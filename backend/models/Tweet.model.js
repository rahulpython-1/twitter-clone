import mongoose from 'mongoose';

const tweetSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    maxlength: 280,
    trim: true
  },
  media: [{
    url: { type: String, required: true },
    publicId: String,
    type: {
      type: String,
      enum: ['image', 'video', 'gif'],
      required: true
    },
    width: Number,
    height: Number,
    thumbnail: String
  }],
  poll: {
    options: [{
      text: { type: String, maxlength: 50 },
      votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    endsAt: Date,
    totalVotes: { type: Number, default: 0 }
  },
  type: {
    type: String,
    enum: ['tweet', 'retweet', 'quote', 'reply'],
    default: 'tweet'
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
    index: true
  },
  quotedTweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet'
  },
  originalTweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet'
  },
  isThread: {
    type: Boolean,
    default: false
  },
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet'
  },
  threadPosition: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  retweets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  impressions: {
    type: Number,
    default: 0
  },
  hashtags: [{
    type: String,
    lowercase: true
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  stats: {
    likesCount: { type: Number, default: 0 },
    retweetsCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    quotesCount: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 }
  },
  scheduledFor: {
    type: Date
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'followers', 'mentioned'],
    default: 'public'
  },
  language: {
    type: String,
    default: 'en'
  }
}, {
  timestamps: true
});

// Indexes for performance
tweetSchema.index({ author: 1, createdAt: -1 });
tweetSchema.index({ replyTo: 1, createdAt: -1 });
tweetSchema.index({ hashtags: 1 });
tweetSchema.index({ mentions: 1 });
tweetSchema.index({ 'stats.likesCount': -1 });
tweetSchema.index({ createdAt: -1 });
tweetSchema.index({ views: -1 });
tweetSchema.index({ scheduledFor: 1, isScheduled: 1 });

// Text index for search
tweetSchema.index({ content: 'text' });

// Virtual for replies
tweetSchema.virtual('replies', {
  ref: 'Tweet',
  localField: '_id',
  foreignField: 'replyTo'
});

const Tweet = mongoose.model('Tweet', tweetSchema);

export default Tweet;
