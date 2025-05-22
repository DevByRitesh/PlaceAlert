
const express = require('express');
const Student = require('../models/Student');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all students (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const students = await Student.find({});
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
});

// Get student by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if user is admin or the student themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== student.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this student profile' });
    }
    
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student', error: error.message });
  }
});

// Get student by user ID
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.params.userId });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if user is admin or the student themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized to view this student profile' });
    }
    
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student', error: error.message });
  }
});

// Create a student (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { userId, name, email, branch, percentage } = req.body;
    
    const student = new Student({
      userId,
      name,
      email,
      branch,
      percentage,
      isPlaced: false
    });
    
    await student.save();
    res.status(201).json({ message: 'Student created successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create student', error: error.message });
  }
});

// Update a student
router.put('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if user is admin or the student themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== student.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this student profile' });
    }
    
    const updates = req.body;
    Object.keys(updates).forEach(update => {
      student[update] = updates[update];
    });
    
    await student.save();
    res.status(200).json({ message: 'Student updated successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student', error: error.message });
  }
});

// Delete a student (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student', error: error.message });
  }
});

module.exports = router;
