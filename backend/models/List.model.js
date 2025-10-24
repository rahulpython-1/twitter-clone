import mongoose from 'mongoose';

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 160
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  banner: {
    url: String,
    publicId: String
  },
  stats: {
    membersCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
listSchema.index({ owner: 1, createdAt: -1 });
listSchema.index({ members: 1 });

const List = mongoose.model('List', listSchema);

export default List;
