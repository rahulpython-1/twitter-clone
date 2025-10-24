import Tweet from '../models/Tweet.model.js';
import User from '../models/User.model.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Get trending topics
// @route   GET /api/trending/topics
// @access  Public
export const getTrendingTopics = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const timeframe = req.query.timeframe || '24h';

    // Calculate time threshold
    const now = new Date();
    let timeThreshold;
    switch (timeframe) {
      case '1h':
        timeThreshold = new Date(now - 60 * 60 * 1000);
        break;
      case '12h':
        timeThreshold = new Date(now - 12 * 60 * 60 * 1000);
        break;
      case '7d':
        timeThreshold = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      default: // 24h
        timeThreshold = new Date(now - 24 * 60 * 60 * 1000);
    }

    const trending = await Tweet.aggregate([
      {
        $match: {
          createdAt: { $gte: timeThreshold },
          isDeleted: false,
          hashtags: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$hashtags'
      },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
          totalEngagement: {
            $sum: {
              $add: [
                '$stats.likesCount',
                '$stats.retweetsCount',
                '$stats.repliesCount'
              ]
            }
          }
        }
      },
      {
        $sort: { totalEngagement: -1, count: -1 }
      },
      {
        $limit: limit
      }
    ]);

    res.status(200).json({
      success: true,
      trending
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending tweets
// @route   GET /api/trending/tweets
// @access  Public
export const getTrendingTweets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get tweets from last 24 hours with high engagement
    const timeThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const tweets = await Tweet.find({
      createdAt: { $gte: timeThreshold },
      isDeleted: false,
      isScheduled: false
    })
      .populate('author', 'username displayName avatar isVerified')
      .sort({
        'stats.likesCount': -1,
        'stats.retweetsCount': -1,
        views: -1
      })
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

// @desc    Get suggested users
// @route   GET /api/trending/users
// @access  Public
export const getSuggestedUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Get users with high follower count that current user doesn't follow
    const excludeIds = req.user ? [req.user.id, ...req.user.following] : [];

    const users = await User.find({
      _id: { $nin: excludeIds },
      isActive: true
    })
      .select('username displayName avatar bio isVerified isPremium stats')
      .sort({ 'stats.followersCount': -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get explore feed
// @route   GET /api/trending/explore
// @access  Public
export const getExploreFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Mix of trending and recent tweets
    const tweets = await Tweet.find({
      isDeleted: false,
      isScheduled: false,
      visibility: 'public'
    })
      .populate('author', 'username displayName avatar isVerified')
      .sort({
        views: -1,
        'stats.likesCount': -1,
        createdAt: -1
      })
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
