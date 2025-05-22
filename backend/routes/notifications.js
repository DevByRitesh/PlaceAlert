const express = require('express');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all notifications
router.get('/', auth, async (req, res) => {
  try {
    // Admin sees all notifications
    if (req.user.role === 'admin') {
      const notifications = await Notification.find({}).sort({ createdAt: -1 });
      return res.status(200).json(notifications);
    }
    
    // Students see notifications meant for them
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    const notifications = await Notification.find({
      $or: [
        { recipients: 'all' },
        { recipients: student.isPlaced ? 'placed' : 'unplaced' },
        { recipients: { $in: [student._id.toString()] } }
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
});

// Create a notification (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { title, message, recipients } = req.body;
    
    const notification = new Notification({
      title,
      message,
      recipients,
      read: []
    });
    
    await notification.save();
    res.status(201).json({ message: 'Notification created successfully', notification });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if already read
    if (!notification.read.includes(req.user._id.toString())) {
      notification.read.push(req.user._id);
      await notification.save();
    }
    
    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    let query = {};
    
    // For students, only mark their relevant notifications as read
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      
      query = {
        $or: [
          { recipients: 'all' },
          { recipients: student.isPlaced ? 'placed' : 'unplaced' },
          { recipients: { $in: [student._id.toString()] } }
        ]
      };
    }
    
    // Find all relevant notifications and update them
    const notifications = await Notification.find(query);
    
    // Update each notification that hasn't been read by this user
    const updatePromises = notifications.map(notification => {
      if (!notification.read.includes(req.user._id.toString())) {
        notification.read.push(req.user._id);
        return notification.save();
      }
      return Promise.resolve();
    });
    
    await Promise.all(updatePromises);
    
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark all notifications as read', error: error.message });
  }
});

// Delete a notification (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
});

module.exports = router;
