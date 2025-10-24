import User from '../models/User.model.js';
import Tweet from '../models/Tweet.model.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    
    const totalTweets = await Tweet.countDocuments({ isDeleted: false });
    const tweetsToday = await Tweet.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          verified: verifiedUsers
        },
        tweets: {
          total: totalTweets,
          today: tweetsToday
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify user
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
export const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.isVerified = true;
    user.role = 'verified';
    await user.save();

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
export const suspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User suspended'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete tweet (admin)
// @route   DELETE /api/admin/tweets/:id
// @access  Private/Admin
export const deleteTweetAdmin = async (req, res, next) => {
  try {
    const tweet = await Tweet.findById(req.params.id);

    if (!tweet) {
      return next(new AppError('Tweet not found', 404));
    }

    tweet.isDeleted = true;
    await tweet.save();

    res.status(200).json({
      success: true,
      message: 'Tweet deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reported content
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getReports = async (req, res, next) => {
  try {
    // This would require a Report model - simplified for now
    res.status(200).json({
      success: true,
      reports: []
    });
  } catch (error) {
    next(error);
  }
};
