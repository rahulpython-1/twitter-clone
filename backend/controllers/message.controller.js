import Message from '../models/Message.model.js';
import Conversation from '../models/Conversation.model.js';
import User from '../models/User.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { emitToUser } from '../config/socket.js';

// @desc    Get all conversations
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .populate('participants', 'username displayName avatar isVerified')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username displayName' }
      })
      .sort({ updatedAt: -1 });

    // Add currentUserId to each conversation for frontend use
    const conversationsWithUserId = conversations.map(conv => ({
      ...conv.toObject(),
      currentUserId: req.user.id
    }));

    res.status(200).json({
      success: true,
      conversations: conversationsWithUserId
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single conversation
// @route   GET /api/messages/conversations/:id
// @access  Private
export const getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'username displayName avatar isVerified');

    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
      return next(new AppError('Not authorized', 403));
    }

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create conversation
// @route   POST /api/messages/conversations
// @access  Private
export const createConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return next(new AppError('Participant ID is required', 400));
    }

    const participant = await User.findById(participantId);
    if (!participant) {
      return next(new AppError('User not found', 404));
    }

    // Check if conversation already exists
    let existingConversation = await Conversation.findOne({
      participants: { $all: [req.user.id, participantId] },
      isGroup: false
    }).populate('participants', 'username displayName avatar isVerified');

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        conversation: {
          ...existingConversation.toObject(),
          currentUserId: req.user.id
        }
      });
    }

    // Create new conversation
    const conversation = await Conversation.create({
      participants: [req.user.id, participantId]
    });

    await conversation.populate('participants', 'username displayName avatar isVerified');

    res.status(201).json({
      success: true,
      conversation: {
        ...conversation.toObject(),
        currentUserId: req.user.id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message
// @route   POST /api/messages/conversations/:id/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { content, media } = req.body;
    const conversationId = req.params.id;

    if (!content && (!media || media.length === 0)) {
      return next(new AppError('Message must have content or media', 400));
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      return next(new AppError('Not authorized', 403));
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      content,
      media
    });

    await message.populate('sender', 'username displayName avatar');

    // Update conversation
    conversation.lastMessage = message._id;
    await conversation.save();

    // Emit real-time message to other participants
    const io = req.app.get('io');
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id) {
        emitToUser(io, participantId.toString(), 'new-message', {
          conversationId,
          message
        });
      }
    });

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages
// @route   GET /api/messages/conversations/:id/messages
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      return next(new AppError('Not authorized', 403));
    }

    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false
    })
      .populate('sender', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return next(new AppError('Message not found', 404));
    }

    message.isRead = true;
    message.readBy.push({
      user: req.user.id,
      readAt: new Date()
    });

    await message.save();

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return next(new AppError('Message not found', 404));
    }

    if (message.sender.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    message.isDeleted = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete conversation
// @route   DELETE /api/messages/conversations/:id
// @access  Private
export const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      return next(new AppError('Not authorized', 403));
    }

    // Delete all messages in the conversation
    await Message.updateMany(
      { conversation: req.params.id },
      { isDeleted: true }
    );

    // Delete the conversation
    await Conversation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Conversation deleted'
    });
  } catch (error) {
    next(error);
  }
};
