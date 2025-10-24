import List from '../models/List.model.js';
import Tweet from '../models/Tweet.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// @desc    Create list
// @route   POST /api/lists
// @access  Private
export const createList = async (req, res, next) => {
  try {
    const { name, description, isPrivate } = req.body;

    const list = await List.create({
      name,
      description,
      owner: req.user.id,
      isPrivate: isPrivate || false
    });

    res.status(201).json({
      success: true,
      list
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user lists
// @route   GET /api/lists
// @access  Private
export const getUserLists = async (req, res, next) => {
  try {
    const lists = await List.find({ owner: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      lists
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list by ID
// @route   GET /api/lists/:id
// @access  Public
export const getList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id)
      .populate('owner', 'username displayName avatar isVerified')
      .populate('members', 'username displayName avatar isVerified');

    if (!list) {
      return next(new AppError('List not found', 404));
    }

    if (list.isPrivate && list.owner._id.toString() !== req.user?.id) {
      return next(new AppError('This list is private', 403));
    }

    res.status(200).json({
      success: true,
      list
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update list
// @route   PUT /api/lists/:id
// @access  Private
export const updateList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return next(new AppError('List not found', 404));
    }

    if (list.owner.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    const { name, description, isPrivate } = req.body;

    if (name) list.name = name;
    if (description !== undefined) list.description = description;
    if (isPrivate !== undefined) list.isPrivate = isPrivate;

    await list.save();

    res.status(200).json({
      success: true,
      list
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete list
// @route   DELETE /api/lists/:id
// @access  Private
export const deleteList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return next(new AppError('List not found', 404));
    }

    if (list.owner.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    await list.deleteOne();

    res.status(200).json({
      success: true,
      message: 'List deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to list
// @route   POST /api/lists/:id/members/:userId
// @access  Private
export const addMember = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return next(new AppError('List not found', 404));
    }

    if (list.owner.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (list.members.includes(req.params.userId)) {
      return next(new AppError('User already in list', 400));
    }

    list.members.push(req.params.userId);
    list.stats.membersCount += 1;
    await list.save();

    res.status(200).json({
      success: true,
      list
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from list
// @route   DELETE /api/lists/:id/members/:userId
// @access  Private
export const removeMember = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return next(new AppError('List not found', 404));
    }

    if (list.owner.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    list.members = list.members.filter(
      id => id.toString() !== req.params.userId
    );
    list.stats.membersCount -= 1;
    await list.save();

    res.status(200).json({
      success: true,
      list
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list tweets
// @route   GET /api/lists/:id/tweets
// @access  Public
export const getListTweets = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return next(new AppError('List not found', 404));
    }

    if (list.isPrivate && list.owner.toString() !== req.user?.id) {
      return next(new AppError('This list is private', 403));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const tweets = await Tweet.find({
      author: { $in: list.members },
      isDeleted: false,
      isScheduled: false
    })
      .populate('author', 'username displayName avatar isVerified')
      .sort({ createdAt: -1 })
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
