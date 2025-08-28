const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  data: {
    type: Buffer,
    required: true
  },
  hash: {
    type: String,
    required: true,
    unique: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('File', fileSchema);
