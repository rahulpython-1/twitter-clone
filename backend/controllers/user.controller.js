import User from '../models/User.model.js';
import Tweet from '../models/Tweet.model.js';
import Notification from '../models/Notification.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { emitToUser } from '../config/socket.js';

// @desc    Get user profile
// @route   GET /api/users/:username
// @access  Public
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { displayName, bio, location, website } = req.body;

    const user = await User.findById(req.user.id);

    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;

    await user.save();

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/users/avatar
// @access  Private
export const uploadAvatar = async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image) {
      return next(new AppError('Please provide an image', 400));
    }

    const user = await User.findById(req.user.id);

    // Delete old avatar if exists
    if (user.avatar.publicId) {
      await deleteFromCloudinary(user.avatar.publicId);
    }

    // Upload new avatar
    const result = await uploadToCloudinary(image, 'chirpx/avatars');

    user.avatar = {
      url: result.url,
      publicId: result.publicId
    };

    await user.save();

    res.status(200).json({
      success: true,
      avatar: user.avatar
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload banner
// @route   POST /api/users/banner
// @access  Private
export const uploadBanner = async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image) {
      return next(new AppError('Please provide an image', 400));
    }

    const user = await User.findById(req.user.id);

    // Delete old banner if exists
    if (user.banner?.publicId) {
      await deleteFromCloudinary(user.banner.publicId);
    }

    // Upload new banner
    const result = await uploadToCloudinary(image, 'chirpx/banners');

    user.banner = {
      url: result.url,
      publicId: result.publicId
    };

    await user.save();

    res.status(200).json({
      success: true,
      banner: user.banner
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return next(new AppError('User not found', 404));
    }

    if (req.params.id === req.user.id) {
      return next(new AppError('You cannot follow yourself', 400));
    }

    // Check if already following
    if (currentUser.following.includes(req.params.id)) {
      return next(new AppError('Already following this user', 400));
    }

    // Add to following/followers
    currentUser.following.push(req.params.id);
    currentUser.stats.followingCount += 1;
    userToFollow.followers.push(req.user.id);
    userToFollow.stats.followersCount += 1;

    await currentUser.save();
    await userToFollow.save();

    // Create notification
    const notification = await Notification.create({
      recipient: userToFollow._id,
      sender: currentUser._id,
      type: 'follow',
      message: `${currentUser.displayName} started following you`
    });

    // Emit real-time notification
    const io = req.app.get('io');
    emitToUser(io, userToFollow._id.toString(), 'notification', notification);

    res.status(200).json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow user
// @route   DELETE /api/users/:id/follow
// @access  Private
export const unfollowUser = async (req, res, next) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return next(new AppError('User not found', 404));
    }

    // Check if following
    if (!currentUser.following.includes(req.params.id)) {
      return next(new AppError('Not following this user', 400));
    }

    // Remove from following/followers
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== req.params.id
    );
    currentUser.stats.followingCount -= 1;
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== req.user.id
    );
    userToUnfollow.stats.followersCount -= 1;

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user followers
// @route   GET /api/users/:id/followers
// @access  Public
export const getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username displayName avatar isVerified');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      followers: user.followers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user following
// @route   GET /api/users/:id/following
// @access  Public
export const getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username displayName avatar isVerified');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      following: user.following
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user tweets
// @route   GET /api/users/:username/tweets
// @access  Public
export const getUserTweets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const tweets = await Tweet.find({ 
      author: user._id, 
      isDeleted: false,
      type: { $in: ['tweet', 'quote'] }
    })
      .populate('author', 'username displayName avatar isVerified')
      .populate('quotedTweet')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Tweet.countDocuments({ 
      author: user._id, 
      isDeleted: false,
      type: { $in: ['tweet', 'quote'] }
    });

    res.status(200).json({
      success: true,
      tweets,
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

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
export const updateSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (req.body.settings) {
      user.settings = { ...user.settings, ...req.body.settings };
    }

    await user.save();

    res.status(200).json({
      success: true,
      settings: user.settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block user
// @route   POST /api/users/:id/block
// @access  Private
export const blockUser = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    if (currentUser.blockedUsers.includes(req.params.id)) {
      return next(new AppError('User already blocked', 400));
    }

    currentUser.blockedUsers.push(req.params.id);
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock user
// @route   DELETE /api/users/:id/block
// @access  Private
export const unblockUser = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      id => id.toString() !== req.params.id
    );
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    next(error);
  }
};
