const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  eligibleBranches: {
    type: [String],
    required: true
  },
  minimumPercentage: {
    type: Number,
    required: true
  },
  ctcRange: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  numberOfRounds: {
    type: Number,
    required: true,
    min: 1
  },
  applicationLink: {
    type: String
  },
  driveDate: {
    type: Date,
    required: true
  },
  lastDateToApply: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PlacementDrive = mongoose.model('PlacementDrive', placementDriveSchema);
module.exports = PlacementDrive;
