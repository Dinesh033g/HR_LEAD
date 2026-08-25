const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  language: {
    type: String,
    default: 'English',
    trim: true,
  },
  source: {
    type: String,
    enum: ['WhatsApp', 'Manual', 'PDF', 'Image', 'Excel', 'OCR'],
    default: 'Manual',
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Call Accepted', 'Call Rejected', 'Interview Scheduled', 'Selected', 'Rejected'],
    default: 'New',
  },
  assigned_tl: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  assigned_hr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  interviewTime: {
    type: String,
    default: '',
  },
  history: [
    {
      status: { type: String, required: true },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
      note: { type: String, default: '' },
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
