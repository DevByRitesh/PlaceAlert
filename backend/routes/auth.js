const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Register a new user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, branch, percentage, rollNumber, mobileNumber } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Validate student-specific fields
    if (role === 'student') {
      if (!branch || !percentage || !rollNumber || !mobileNumber) {
        return res.status(400).json({ message: "All student fields are required" });
      }

      // Validate percentage
      const percentageNum = parseFloat(percentage);
      if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
        return res.status(400).json({ message: "Percentage must be between 0 and 100" });
      }

      // Validate mobile number format (10 digits)
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(mobileNumber)) {
        return res.status(400).json({ message: "Please enter a valid 10-digit mobile number" });
      }

      // Validate roll number format (alphanumeric)
      const rollNumberRegex = /^[A-Za-z0-9]+$/;
      if (!rollNumberRegex.test(rollNumber)) {
        return res.status(400).json({ message: "Roll number should contain only letters and numbers" });
      }

      // Check if roll number already exists
      const existingStudent = await Student.findOne({ rollNumber });
      if (existingStudent) {
        return res.status(400).json({ message: "Roll number already registered" });
      }
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      role
    });
    
    await user.save();
    
    // If role is student, create student profile
    if (role === 'student') {
      const student = new Student({
        userId: user._id,
        name,
        email,
        rollNumber,
        mobileNumber,
        branch,
        percentage: parseFloat(percentage),
        isPlaced: false
      });
      
      await student.save();
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user data', error: error.message });
  }
});

// Update student profile
router.patch('/student/profile', auth, async (req, res) => {
  try {
    const { branch, percentage, rollNumber, mobileNumber } = req.body;
    const userId = req.user.id;

    // Find and update student profile
    const student = await Student.findOneAndUpdate(
      { userId },
      { branch, percentage, rollNumber, mobileNumber },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      student: {
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        mobileNumber: student.mobileNumber,
        branch: student.branch,
        percentage: student.percentage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Password update failed', error: error.message });
  }
});

// Get student profile
router.get('/student/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find student profile
    const student = await Student.findOne({ userId });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.status(200).json({
      student: {
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        mobileNumber: student.mobileNumber,
        branch: student.branch,
        percentage: student.percentage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

module.exports = router;
