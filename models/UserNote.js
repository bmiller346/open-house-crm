const mongoose = require('mongoose');

const UserNoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'workspace',
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String, // Markdown content
    required: true,
  },
  tags: {
    type: [String],
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'resource_document',
  },
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'deal', // Assuming a 'Deal' model exists
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'contact',
  },
  isPrivate: {
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

UserNoteSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('user_note', UserNoteSchema);
