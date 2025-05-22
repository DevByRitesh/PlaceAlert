const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  resume: {
    type: String
  },
  isPlaced: {
    type: Boolean,
    default: false
  },
  placedCompanies: {
    type: [String],
    default: []
  },
  selectedCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
