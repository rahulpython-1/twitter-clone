import Bookmark from '../models/Bookmark.model.js';
import Tweet from '../models/Tweet.model.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Add bookmark
// @route   POST /api/bookmarks
// @access  Private
export const addBookmark = async (req, res, next) => {
  try {
    const { tweetId, folder, note } = req.body;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet || tweet.isDeleted) {
      return next(new AppError('Tweet not found', 404));
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      user: req.user.id,
      tweet: tweetId
    });

    if (existingBookmark) {
      return next(new AppError('Tweet already bookmarked', 400));
    }

    const bookmark = await Bookmark.create({
      user: req.user.id,
      tweet: tweetId,
      folder: folder || 'default',
      note
    });

    // Update tweet bookmarks
    tweet.bookmarks.push(req.user.id);
    tweet.stats.bookmarksCount += 1;
    await tweet.save();

    res.status(201).json({
      success: true,
      bookmark
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookmarks
// @route   GET /api/bookmarks
// @access  Private
export const getBookmarks = async (req, res, next) => {
  try {
    const { folder } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };
    if (folder) {
      query.folder = folder;
    }

    const bookmarks = await Bookmark.find(query)
      .populate({
        path: 'tweet',
        populate: {
          path: 'author',
          select: 'username displayName avatar isVerified'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      bookmarks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Private
export const deleteBookmark = async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return next(new AppError('Bookmark not found', 404));
    }

    if (bookmark.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    // Update tweet bookmarks
    await Tweet.findByIdAndUpdate(bookmark.tweet, {
      $pull: { bookmarks: req.user.id },
      $inc: { 'stats.bookmarksCount': -1 }
    });

    await bookmark.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Bookmark deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookmark folders
// @route   GET /api/bookmarks/folders
// @access  Private
export const getFolders = async (req, res, next) => {
  try {
    const folders = await Bookmark.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$folder', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      folders
    });
  } catch (error) {
    next(error);
  }
};
