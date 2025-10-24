import Tweet from '../models/Tweet.model.js';
import User from '../models/User.model.js';
import Notification from '../models/Notification.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { emitToUser, emitToMultipleUsers } from '../config/socket.js';

// @desc    Create tweet
// @route   POST /api/tweets
// @access  Private
export const createTweet = async (req, res, next) => {
  try {
    const { content, media, poll, visibility, replyTo, quotedTweet, scheduledFor } = req.body;

    // Validate content or media
    if (!content && (!media || media.length === 0) && !poll) {
      return next(new AppError('Tweet must have content, media, or poll', 400));
    }

    // Upload media if provided
    let uploadedMedia = [];
    if (media && media.length > 0) {
      for (const item of media) {
        const result = await uploadToCloudinary(item.data, 'chirpx/tweets');
        uploadedMedia.push({
          url: result.url,
          publicId: result.publicId,
          type: item.type,
          width: result.width,
          height: result.height
        });
      }
    }

    // Extract hashtags and mentions
    const hashtags = content ? extractHashtags(content) : [];
    const mentions = content ? await extractMentions(content) : [];

    const tweetData = {
      author: req.user.id,
      content,
      media: uploadedMedia,
      poll,
      visibility: visibility || 'public',
      hashtags,
      mentions,
      type: quotedTweet ? 'quote' : replyTo ? 'reply' : 'tweet',
      replyTo,
      quotedTweet
    };

    if (scheduledFor) {
      tweetData.scheduledFor = scheduledFor;
      tweetData.isScheduled = true;
    }

    const tweet = await Tweet.create(tweetData);
    await tweet.populate('author', 'username displayName avatar isVerified');

    if (quotedTweet) {
      await tweet.populate('quotedTweet');
    }

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.tweetsCount': 1 }
    });

    // Update reply count if it's a reply
    if (replyTo) {
      await Tweet.findByIdAndUpdate(replyTo, {
        $inc: { 'stats.repliesCount': 1 }
      });

      // Create notification for reply
      const parentTweet = await Tweet.findById(replyTo);
      if (parentTweet && parentTweet.author.toString() !== req.user.id) {
        const notification = await Notification.create({
          recipient: parentTweet.author,
          sender: req.user.id,
          type: 'reply',
          tweet: tweet._id,
          message: `${req.user.displayName} replied to your tweet`
        });

        const io = req.app.get('io');
        emitToUser(io, parentTweet.author.toString(), 'notification', notification);
      }
    }

    // Create notifications for mentions
    if (mentions.length > 0) {
      const io = req.app.get('io');
      for (const mentionedUserId of mentions) {
        if (mentionedUserId.toString() !== req.user.id) {
          const notification = await Notification.create({
            recipient: mentionedUserId,
            sender: req.user.id,
            type: 'mention',
            tweet: tweet._id,
            message: `${req.user.displayName} mentioned you in a tweet`
          });
          emitToUser(io, mentionedUserId.toString(), 'notification', notification);
        }
      }
    }

    // Emit real-time tweet to followers
    const user = await User.findById(req.user.id);
    const io = req.app.get('io');
    emitToMultipleUsers(io, user.followers.map(f => f.toString()), 'new-tweet', tweet);

    res.status(201).json({
      success: true,
      tweet
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feed
// @route   GET /api/tweets/feed
// @access  Private
export const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id);

    // Get tweets from following + own tweets
    const tweets = await Tweet.find({
      author: { $in: [...user.following, req.user.id] },
      isDeleted: false,
      isScheduled: false,
      $or: [
        { visibility: 'public' },
        { visibility: 'followers', author: { $in: user.following } }
      ]
    })
      .populate('author', 'username displayName avatar isVerified isPremium')
      .populate({
        path: 'quotedTweet',
        populate: { path: 'author', select: 'username displayName avatar isVerified' }
      })
      .populate('replyTo', 'content author')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add user interaction data and convert to plain objects
    const tweetsWithInteractions = tweets.map(tweet => {
      const tweetObj = tweet.toObject();
      return {
        ...tweetObj,
        isLiked: tweetObj.likes?.some(id => id.toString() === req.user.id) || false,
        isRetweeted: tweetObj.retweets?.some(id => id.toString() === req.user.id) || false,
        isBookmarked: tweetObj.bookmarks?.some(id => id.toString() === req.user.id) || false
      };
    });

    res.status(200).json({
      success: true,
      tweets: tweetsWithInteractions,
      pagination: {
        page,
        limit,
        hasMore: tweets.length === limit
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tweet by ID
// @route   GET /api/tweets/:id
// @access  Public
export const getTweet = async (req, res, next) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
      .populate('author', 'username displayName avatar isVerified isPremium')
      .populate('quotedTweet')
      .populate('replyTo');

    if (!tweet || tweet.isDeleted) {
      return next(new AppError('Tweet not found', 404));
    }

    // Increment views
    tweet.views += 1;
    await tweet.save();

    res.status(200).json({
      success: true,
      tweet
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete tweet
// @route   DELETE /api/tweets/:id
// @access  Private
export const deleteTweet = async (req, res, next) => {
  try {
    const tweet = await Tweet.findById(req.params.id);

    if (!tweet) {
      return next(new AppError('Tweet not found', 404));
    }

    if (tweet.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this tweet', 403));
    }

    // Delete media from cloudinary
    if (tweet.media && tweet.media.length > 0) {
      for (const item of tweet.media) {
        if (item.publicId) {
          await deleteFromCloudinary(item.publicId);
        }
      }
    }

    tweet.isDeleted = true;
    await tweet.save();

    // Update user stats
    await User.findByIdAndUpdate(tweet.author, {
      $inc: { 'stats.tweetsCount': -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Tweet deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on tweet (like if not liked, unlike if already liked)
// @route   POST /api/tweets/:id/like
// @access  Private
export const likeTweet = async (req, res, next) => {
  try {
    const tweet = await Tweet.findById(req.params.id);

    if (!tweet || tweet.isDeleted) {
      return next(new AppError('Tweet not found', 404));
    }

    const isLiked = tweet.likes.includes(req.user.id);

    if (isLiked) {
      // Unlike the tweet
      tweet.likes = tweet.likes.filter(id => id.toString() !== req.user.id);
      tweet.stats.likesCount -= 1;
      await tweet.save();

      res.status(200).json({
        success: true,
        message: 'Tweet unliked successfully',
        isLiked: false
      });
    } else {
      // Like the tweet
      tweet.likes.push(req.user.id);
      tweet.stats.likesCount += 1;
      await tweet.save();

      // Create notification
      if (tweet.author.toString() !== req.user.id) {
        const notification = await Notification.create({
          recipient: tweet.author,
          sender: req.user.id,
          type: 'like',
          tweet: tweet._id,
          message: `${req.user.displayName} liked your tweet`
        });

        const io = req.app.get('io');
        emitToUser(io, tweet.author.toString(), 'notification', notification);
      }

      res.status(200).json({
        success: true,
        message: 'Tweet liked successfully',
        isLiked: true
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Unlike tweet
// @route   DELETE /api/tweets/:id/like
// @access  Private
export const unlikeTweet = async (req, res, next) => {
  try {
    const tweet = await Tweet.findById(req.params.id);

    if (!tweet) {
      return next(new AppError('Tweet not found', 404));
    }

    // Check if liked
    if (!tweet.likes.includes(req.user.id)) {
      return next(new AppError('Tweet not liked', 400));
    }

    tweet.likes = tweet.likes.filter(id => id.toString() !== req.user.id);
    tweet.stats.likesCount -= 1;
    await tweet.save();

    res.status(200).json({
      success: true,
      message: 'Tweet unliked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Retweet
// @route   POST /api/tweets/:id/retweet
// @access  Private
export const retweet = async (req, res, next) => {
  try {
    const originalTweet = await Tweet.findById(req.params.id);

    if (!originalTweet || originalTweet.isDeleted) {
      return next(new AppError('Tweet not found', 404));
    }

    // Check if already retweeted
    if (originalTweet.retweets.includes(req.user.id)) {
      return next(new AppError('Already retweeted', 400));
    }

    // Create retweet
    const retweet = await Tweet.create({
      author: req.user.id,
      type: 'retweet',
      originalTweet: originalTweet._id,
      content: originalTweet.content,
      media: originalTweet.media
    });

    originalTweet.retweets.push(req.user.id);
    originalTweet.stats.retweetsCount += 1;
    await originalTweet.save();

    // Create notification
    if (originalTweet.author.toString() !== req.user.id) {
      const notification = await Notification.create({
        recipient: originalTweet.author,
        sender: req.user.id,
        type: 'retweet',
        tweet: originalTweet._id,
        message: `${req.user.displayName} retweeted your tweet`
      });

      const io = req.app.get('io');
      emitToUser(io, originalTweet.author.toString(), 'notification', notification);
    }

    res.status(201).json({
      success: true,
      retweet
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Undo retweet
// @route   DELETE /api/tweets/:id/retweet
// @access  Private
export const undoRetweet = async (req, res, next) => {
  try {
    const originalTweet = await Tweet.findById(req.params.id);

    if (!originalTweet) {
      return next(new AppError('Tweet not found', 404));
    }

    // Remove from retweets
    originalTweet.retweets = originalTweet.retweets.filter(
      id => id.toString() !== req.user.id
    );
    originalTweet.stats.retweetsCount -= 1;
    await originalTweet.save();

    // Delete retweet document
    await Tweet.findOneAndDelete({
      author: req.user.id,
      originalTweet: originalTweet._id,
      type: 'retweet'
    });

    res.status(200).json({
      success: true,
      message: 'Retweet removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tweet replies
// @route   GET /api/tweets/:id/replies
// @access  Public
export const getReplies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const replies = await Tweet.find({
      replyTo: req.params.id,
      isDeleted: false
    })
      .populate('author', 'username displayName avatar isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      replies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on poll
// @route   POST /api/tweets/:id/poll/vote
// @access  Private
export const votePoll = async (req, res, next) => {
  try {
    const { optionIndex } = req.body;
    const tweet = await Tweet.findById(req.params.id);

    if (!tweet || !tweet.poll) {
      return next(new AppError('Poll not found', 404));
    }

    if (new Date() > new Date(tweet.poll.endsAt)) {
      return next(new AppError('Poll has ended', 400));
    }

    // Check if already voted
    const hasVoted = tweet.poll.options.some(option =>
      option.votes.includes(req.user.id)
    );

    if (hasVoted) {
      return next(new AppError('Already voted', 400));
    }

    tweet.poll.options[optionIndex].votes.push(req.user.id);
    tweet.poll.totalVotes += 1;
    await tweet.save();

    res.status(200).json({
      success: true,
      poll: tweet.poll
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
const extractHashtags = (text) => {
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
};

const extractMentions = async (text) => {
  const mentionRegex = /@(\w+)/g;
  const matches = text.match(mentionRegex);
  
  if (!matches) return [];

  const usernames = matches.map(mention => mention.slice(1).toLowerCase());
  const users = await User.find({ username: { $in: usernames } }).select('_id');
  
  return users.map(user => user._id);
};
