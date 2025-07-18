const mongoose = require('mongoose');

const ScriptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['cold_call', 'follow_up', 'negotiation', 'email', 'voicemail'],
    required: true,
  },
  situation: {
    type: String,
  },
  script: {
    type: String, // Markdown content
    required: true,
  },
  tips: {
    type: [String],
  },
  successRate: {
    type: Number,
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'workspace',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ScriptSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('script', ScriptSchema);
