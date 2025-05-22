const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ResumeScore = require('../models/ResumeScore');
const Student = require('../models/Student');

// Get latest resume score for a student
router.get('/latest/:studentId', auth, async (req, res) => {
  try {
    console.log('Fetching latest resume score for student:', req.params.studentId);
    
    // Validate student ID
    if (!req.params.studentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }

    const latestScore = await ResumeScore.findOne({ 
      studentId: req.params.studentId 
    }).sort({ createdAt: -1 });
    
    if (!latestScore) {
      console.log('No resume score found for student:', req.params.studentId);
      return res.status(404).json({ 
        message: 'No resume score found',
        studentId: req.params.studentId
      });
    }
    
    console.log('Found resume score:', latestScore);
    res.json(latestScore);
  } catch (error) {
    console.error('Error fetching resume score:', error);
    res.status(500).json({ 
      message: 'Error fetching resume score', 
      error: error.message,
      studentId: req.params.studentId
    });
  }
});

// Get average scores for comparison
router.get('/averages', auth, async (req, res) => {
  try {
    console.log('Calculating average scores');
    const averages = await ResumeScore.aggregate([
      {
        $group: {
          _id: null,
          avgTechnical: { $avg: '$technicalScore' },
          avgCommunication: { $avg: '$communicationScore' },
          avgExperience: { $avg: '$experienceScore' },
          avgSkills: { $avg: '$skillsScore' },
          avgOverall: { $avg: '$overallScore' }
        }
      }
    ]);
    
    if (!averages.length) {
      console.log('No scores found for averaging');
      return res.json({
        avgTechnical: 0,
        avgCommunication: 0,
        avgExperience: 0,
        avgSkills: 0,
        avgOverall: 0
      });
    }
    
    console.log('Calculated averages:', averages[0]);
    res.json(averages[0]);
  } catch (error) {
    console.error('Error calculating averages:', error);
    res.status(500).json({ message: 'Error fetching averages', error: error.message });
  }
});

// Save new resume score
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating new resume score for user:', req.user._id);
    
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      console.log('Student not found for user:', req.user._id);
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const newScore = new ResumeScore({
      studentId: student._id,
      ...req.body
    });
    
    await newScore.save();
    console.log('Saved new resume score:', newScore);
    res.status(201).json(newScore);
  } catch (error) {
    console.error('Error saving resume score:', error);
    res.status(500).json({ message: 'Error saving resume score', error: error.message });
  }
});

module.exports = router; 