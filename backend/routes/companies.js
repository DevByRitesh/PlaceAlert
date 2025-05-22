
const express = require('express');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all companies
router.get('/', auth, async (req, res) => {
  try {
    const companies = await Company.find({});
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch companies', error: error.message });
  }
});

// Get company by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch company', error: error.message });
  }
});

// Create a company (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, logo, website, location } = req.body;
    
    const company = new Company({
      name,
      description,
      logo,
      website,
      location
    });
    
    await company.save();
    res.status(201).json({ message: 'Company created successfully', company });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create company', error: error.message });
  }
});

// Update a company (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    const updates = req.body;
    Object.keys(updates).forEach(update => {
      company[update] = updates[update];
    });
    
    await company.save();
    res.status(200).json({ message: 'Company updated successfully', company });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update company', error: error.message });
  }
});

// Delete a company (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    // Check if company has any associated drives
    const drives = await PlacementDrive.find({ companyId: req.params.id });
    if (drives.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete company with associated placement drives. Delete the drives first.' 
      });
    }
    
    const company = await Company.findByIdAndDelete(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete company', error: error.message });
  }
});

module.exports = router;
