const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  driveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementDrive',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'selected'],
    default: 'applied'
  },
  resumeUrl: {
    type: String
  },
  isPresent: {
    type: Boolean,
    default: true
  },
  currentRound: {
    type: Number,
    default: 0,
    get: v => Math.round(Number(v)),
    set: v => Math.round(Number(v))
  },
  nextRoundDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will add updatedAt field automatically
});

applicationSchema.pre('save', function(next) {
  if (this.currentRound !== undefined) {
    this.currentRound = Math.round(Number(this.currentRound));
  }
  next();
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
