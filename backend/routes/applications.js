const express = require('express');
const Application = require('../models/Application');
const PlacementDrive = require('../models/PlacementDrive');
const Student = require('../models/Student');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const mongoose = require('mongoose');
const router = express.Router();

// Get all applications (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const applications = await Application.find({});
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
});

// Get student's applications
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    // Check authorization
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (req.user.role !== 'admin' && req.user._id.toString() !== student.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }
    
    const applications = await Application.find({ studentId: req.params.studentId });
    console.log('Fetching applications for student:', req.params.studentId);
    console.log('Found applications:', applications);
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching student applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
});

// Get applications for a drive
router.get('/drive/:driveId', auth, async (req, res) => {
  try {
    // Admin can view all, students can only see their own
    let applications;
    
    if (req.user.role === 'admin') {
      applications = await Application.find({ driveId: req.params.driveId });
    } else {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      
      applications = await Application.find({ 
        driveId: req.params.driveId,
        studentId: student._id
      });
    }
    
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
});

// Get application by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check authorization
    if (req.user.role !== 'admin') {
      const student = await Student.findById(application.studentId);
      if (!student || req.user._id.toString() !== student.userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this application' });
      }
    }
    
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch application', error: error.message });
  }
});

// Create an application with resume upload
router.post('/', auth, upload.single('resume'), async (req, res) => {
  try {
    const { studentId, driveId } = req.body;
    
    // Check if student is authorized
    if (req.user.role !== 'admin') {
      const student = await Student.findById(studentId);
      if (!student || req.user._id.toString() !== student.userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to create this application' });
      }
    }
    
    // Check if already applied
    const existingApplication = await Application.findOne({ studentId, driveId });
    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this drive' });
    }
    
    // Check drive eligibility
    const drive = await PlacementDrive.findById(driveId);
    const student = await Student.findById(studentId);
    
    if (!drive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (!drive.eligibleBranches.includes(student.branch)) {
      return res.status(400).json({ message: 'Student branch not eligible for this drive' });
    }
    
    if (student.percentage < drive.minimumPercentage) {
      return res.status(400).json({ message: 'Student percentage below minimum requirement' });
    }
    
    // Check if application deadline has passed
    if (new Date() > new Date(drive.lastDateToApply)) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }
    
    // Create application with resume URL if file was uploaded
    const application = new Application({
      studentId,
      driveId,
      status: 'applied',
      resumeUrl: req.file ? `/uploads/${req.file.filename}` : student.resume,
      isPresent: true,
      currentRound: 0
    });
    
    await application.save();
    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit application', error: error.message });
  }
});

// Update application attendance (admin only)
router.put('/:id/attendance', auth, adminAuth, async (req, res) => {
  try {
    const { isPresent } = req.body;
    
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    application.isPresent = isPresent;
    await application.save();
    
    res.status(200).json({ message: 'Attendance updated successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update attendance', error: error.message });
  }
});

// Update application status (admin only)
router.put('/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status, currentRound, nextRoundDate } = req.body;
    console.log('Updating application status:', {
      applicationId: req.params.id,
      status,
      currentRound,
      nextRoundDate
    });
    
    // Convert currentRound to a proper number
    const roundValue = currentRound !== undefined 
      ? parseInt(currentRound.toString(), 10) 
      : undefined;
    
    console.log('Round value after parsing:', roundValue);
    
    // First get the current application
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Only allow status updates for present students
    if (!application.isPresent) {
      return res.status(400).json({ 
        message: 'Cannot update status for absent students',
        code: 'ABSENT_STUDENT'
      });
    }

    // Create a direct update object
    const updateFields = {};
    
    // Always include status if provided
    if (status) {
      updateFields.status = status;
    }
    
    // Handle round updates
    if (roundValue !== undefined) {
      // Only apply round updates for shortlisted or selected students
      if (status && status !== 'shortlisted' && status !== 'selected') {
        return res.status(400).json({ 
          message: 'Round updates only allowed for shortlisted or selected students',
          code: 'INVALID_ROUND_UPDATE'
        });
      }
      
      // Get the current maximum round for this drive
      const maxRoundApplication = await Application.findOne({ 
        driveId: application.driveId 
      }).sort({ currentRound: -1 });
      
      const maxRound = maxRoundApplication ? maxRoundApplication.currentRound : 0;
      console.log('Current max round:', maxRound);
      
      // Add currentRound to update object
      updateFields.currentRound = roundValue;
      
      // If the new round is higher than the current max, update the drive's numberOfRounds
      if (roundValue > maxRound) {
        const drive = await PlacementDrive.findById(application.driveId);
        if (drive) {
          drive.numberOfRounds = Math.max(drive.numberOfRounds, roundValue + 1);
          await drive.save();
          console.log('Updated drive rounds:', drive.numberOfRounds);
        }
      }
    }

    // Handle next round date for shortlisted applications
    if (status === 'shortlisted' && nextRoundDate) {
      updateFields.nextRoundDate = new Date(nextRoundDate);
    }
    
    console.log('Update fields being sent to MongoDB:', updateFields);
    
    // Use a direct findByIdAndUpdate to ensure the update happens
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true } // Return the updated document
    );
    
    if (!updatedApplication) {
      return res.status(500).json({ message: 'Failed to update application' });
    }
    
    console.log('Application updated successfully. Response:', updatedApplication);
    
    res.status(200).json({ 
      message: 'Application status updated successfully', 
      application: updatedApplication 
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Failed to update application status', error: error.message });
  }
});

// Update application (for attendance)
router.put('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Admin can update any application, students can only update their own
    if (req.user.role !== 'admin') {
      const student = await Student.findById(application.studentId);
      if (!student || req.user._id.toString() !== student.userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this application' });
      }
      
      // Students can only update certain fields
      const { resumeUrl } = req.body;
      if (resumeUrl) application.resumeUrl = resumeUrl;
    } else {
      // Admin can update all fields
      const updates = req.body;
      Object.keys(updates).forEach(update => {
        application[update] = updates[update];
      });
    }
    
    await application.save();
    res.status(200).json({ message: 'Application updated successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update application', error: error.message });
  }
});

// Delete application (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete application', error: error.message });
  }
});

// Debugging endpoint to examine application data (admin only)
router.get('/:id/debug', auth, adminAuth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if there are any middleware or schema validators affecting the data
    const rawApplication = await Application.collection.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });
    
    res.status(200).json({ 
      application,
      rawApplication,
      modelInstance: {
        currentRoundType: typeof application.currentRound,
        currentRoundValue: application.currentRound
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch application debug data', error: error.message });
  }
});

// Emergency endpoint to directly update the round number (admin only)
router.put('/:id/debug-round-fix', auth, adminAuth, async (req, res) => {
  try {
    const { currentRound } = req.body;
    
    if (currentRound === undefined) {
      return res.status(400).json({ message: 'currentRound is required' });
    }
    
    // Parse to ensure it's a number
    const roundValue = parseInt(currentRound.toString(), 10);
    
    console.log(`Emergency round fix: Setting application ${req.params.id} round to ${roundValue}`);
    
    // Use direct MongoDB update to bypass any Mongoose middleware
    const result = await Application.collection.updateOne(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      { $set: { currentRound: roundValue } }
    );
    
    console.log('MongoDB update result:', result);
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Application not found or round not updated' });
    }
    
    // Verify the update worked
    const updatedApplication = await Application.findById(req.params.id);
    
    res.status(200).json({ 
      message: 'Round number fixed successfully', 
      application: updatedApplication,
      rawUpdateResult: result
    });
  } catch (error) {
    console.error('Error fixing round number:', error);
    res.status(500).json({ message: 'Failed to fix round number', error: error.message });
  }
});

// Direct MongoDB round update (admin only) - Use when regular updates fail
router.put('/:id/direct-round-update', auth, adminAuth, async (req, res) => {
  try {
    const { currentRound } = req.body;
    
    if (currentRound === undefined) {
      return res.status(400).json({ message: 'currentRound is required' });
    }
    
    // Parse to ensure it's a number
    const roundValue = parseInt(currentRound.toString(), 10);
    
    console.log(`Direct round update: Setting application ${req.params.id} round to ${roundValue}`);
    
    // Get the application first to verify it exists
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Use direct MongoDB update to bypass any Mongoose middleware
    const result = await Application.collection.updateOne(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      { $set: { currentRound: roundValue } }
    );
    
    console.log('MongoDB direct update result:', result);
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({ 
        message: 'Round not updated, possibly due to database constraints',
        result
      });
    }
    
    // Fetch the updated document
    const updatedApplication = await Application.findById(req.params.id);
    
    res.status(200).json({ 
      message: 'Round number updated successfully', 
      application: updatedApplication
    });
  } catch (error) {
    console.error('Error updating round number:', error);
    res.status(500).json({ message: 'Failed to update round number', error: error.message });
  }
});

module.exports = router;
