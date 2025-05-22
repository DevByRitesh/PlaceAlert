const express = require('express');
const PlacementDrive = require('../models/PlacementDrive');
const Application = require('../models/Application');
const Event = require('../models/Event');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all placement drives
router.get('/', auth, async (req, res) => {
  try {
    const drives = await PlacementDrive.find({});
    res.status(200).json(drives);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch placement drives', error: error.message });
  }
});

// Get drive by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    
    if (!drive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }
    
    res.status(200).json(drive);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch placement drive', error: error.message });
  }
});

// Create a placement drive (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { 
      companyId, 
      companyName,
      title, 
      description, 
      requirements, 
      eligibleBranches, 
      minimumPercentage,
      ctcRange,
      numberOfRounds,
      applicationLink,
      driveDate,
      lastDateToApply
    } = req.body;
    
    console.log('Received drive creation request:', req.body);
    
    const drive = new PlacementDrive({
      companyId,
      companyName,
      title,
      description,
      requirements,
      eligibleBranches,
      minimumPercentage,
      ctcRange,
      numberOfRounds,
      applicationLink,
      driveDate,
      lastDateToApply
    });
    
    console.log('Created drive object:', drive);
    
    await drive.save();
    console.log('Drive saved successfully');
    
    // Create an associated event
    const event = new Event({
      title: `${companyName} Placement Drive`,
      description: title,
      date: new Date(driveDate),
      driveId: drive._id
    });
    
    console.log('Created event object:', event);
    
    await event.save();
    console.log('Event saved successfully');
    
    res.status(201).json({ 
      message: 'Placement drive created successfully', 
      drive,
      event 
    });
  } catch (error) {
    console.error('Error in drive creation:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Failed to create placement drive', error: error.message });
  }
});

// Update a placement drive (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    
    if (!drive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }
    
    const updates = req.body;
    
    // Convert date strings to Date objects
    if (updates.driveDate) {
      updates.driveDate = new Date(updates.driveDate);
    }
    if (updates.lastDateToApply) {
      updates.lastDateToApply = new Date(updates.lastDateToApply);
    }
    
    // Update drive fields
    Object.keys(updates).forEach(update => {
      drive[update] = updates[update];
    });
    
    await drive.save();
    
    // Update the associated event if exists
    if (updates.driveDate || updates.title || updates.companyName) {
      const event = await Event.findOne({ driveId: drive._id });
      if (event) {
        if (updates.companyName) {
          event.title = `${updates.companyName} Placement Drive`;
        }
        if (updates.title) {
          event.description = updates.title;
        }
        if (updates.driveDate) {
          event.date = new Date(updates.driveDate);
        }
        await event.save();
      }
    }
    
    res.status(200).json({ message: 'Placement drive updated successfully', drive });
  } catch (error) {
    console.error('Error updating drive:', error);
    res.status(500).json({ message: 'Failed to update placement drive', error: error.message });
  }
});

// Delete a placement drive (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    // Delete associated applications
    await Application.deleteMany({ driveId: req.params.id });
    
    // Delete associated event
    await Event.deleteOne({ driveId: req.params.id });
    
    const drive = await PlacementDrive.findByIdAndDelete(req.params.id);
    
    if (!drive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }
    
    res.status(200).json({ message: 'Placement drive deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete placement drive', error: error.message });
  }
});

module.exports = router;
