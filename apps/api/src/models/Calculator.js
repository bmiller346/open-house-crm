const mongoose = require('mongoose');

const CalculatorInputSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ['number', 'currency', 'percentage', 'text'],
    required: true,
  },
  required: { type: Boolean, default: true },
  defaultValue: mongoose.Schema.Types.Mixed,
  min: Number,
  max: Number,
  placeholder: String,
  helpText: String,
});

const CalculatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    enum: ['wholesaling', 'investment', 'financing', 'rehab'],
    required: true,
  },
  inputs: [CalculatorInputSchema],
  formula: {
    type: String,
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'workspace',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('calculator', CalculatorSchema);
