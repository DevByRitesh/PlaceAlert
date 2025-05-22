const mongoose = require('mongoose');

const resumeScoreSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  atsScore: {
    type: Number,
    required: true
  },
  technicalScore: {
    type: Number,
    required: true
  },
  communicationScore: {
    type: Number,
    required: true
  },
  experienceScore: {
    type: Number,
    required: true
  },
  skillsScore: {
    type: Number,
    required: true
  },
  overallScore: {
    type: Number,
    required: true
  },
  feedback: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ResumeScore = mongoose.model('ResumeScore', resumeScoreSchema);
module.exports = ResumeScore; 