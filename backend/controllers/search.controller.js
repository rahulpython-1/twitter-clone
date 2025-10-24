import User from '../models/User.model.js';
import Tweet from '../models/Tweet.model.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Search all
// @route   GET /api/search
// @access  Public
export const searchAll = async (req, res, next) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q) {
      return next(new AppError('Search query required', 400));
    }

    const results = {};

    if (type === 'all' || type === 'users') {
      results.users = await User.find({
        $or: [
          { username: { $regex: q, $options: 'i' } },
          { displayName: { $regex: q, $options: 'i' } }
        ],
        isActive: true
      })
        .select('username displayName avatar bio isVerified isPremium stats')
        .limit(10);
    }

    if (type === 'all' || type === 'tweets') {
      results.tweets = await Tweet.find({
        $text: { $search: q },
        isDeleted: false,
        isScheduled: false
      })
        .populate('author', 'username displayName avatar isVerified')
        .sort({ score: { $meta: 'textScore' } })
        .limit(20);
    }

    if (type === 'all' || type === 'hashtags') {
      results.hashtags = await Tweet.aggregate([
        {
          $match: {
            hashtags: { $regex: q, $options: 'i' },
            isDeleted: false
          }
        },
        {
          $unwind: '$hashtags'
        },
        {
          $match: {
            hashtags: { $regex: q, $options: 'i' }
          }
        },
        {
          $group: {
            _id: '$hashtags',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]);
    }

    res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/search/users
// @access  Public
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!q) {
      return next(new AppError('Search query required', 400));
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    })
      .select('username displayName avatar bio isVerified isPremium stats')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search tweets
// @route   GET /api/search/tweets
// @access  Public
export const searchTweets = async (req, res, next) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!q) {
      return next(new AppError('Search query required', 400));
    }

    const tweets = await Tweet.find({
      $text: { $search: q },
      isDeleted: false,
      isScheduled: false
    })
      .populate('author', 'username displayName avatar isVerified')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      tweets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tweets by hashtag
// @route   GET /api/search/hashtag/:tag
// @access  Public
export const getTweetsByHashtag = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const tweets = await Tweet.find({
      hashtags: tag.toLowerCase(),
      isDeleted: false,
      isScheduled: false
    })
      .populate('author', 'username displayName avatar isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const count = await Tweet.countDocuments({
      hashtags: tag.toLowerCase(),
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      tweets,
      count
    });
  } catch (error) {
    next(error);
  }
};
