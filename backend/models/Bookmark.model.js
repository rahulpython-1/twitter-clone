import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
    required: true
  },
  folder: {
    type: String,
    default: 'default'
  },
  note: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate bookmarks
bookmarkSchema.index({ user: 1, tweet: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, folder: 1, createdAt: -1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;
