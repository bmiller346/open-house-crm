const mongoose = require('mongoose');

const ResourceDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['legal', 'marketing', 'analytics', 'process', 'wholesaling', 'scripts'],
    required: true,
  },
  subCategory: {
    type: String,
  },
  content: {
    type: String, // Markdown content
    required: true,
  },
  tags: {
    type: [String],
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  estimatedReadTime: {
    type: Number, // in minutes
    default: 5,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
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

ResourceDocumentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('resource_document', ResourceDocumentSchema);
