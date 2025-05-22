/**
 * Migration script to update the student schema from placedCompany to placedCompanies array
 * This script should be run once after deploying the new schema
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

async function migrateData() {
  try {
    console.log('Starting migration of student placement data...');
    
    // Find all students with the old placedCompany field
    const students = await Student.find({}).lean();
    let migratedCount = 0;
    
    for (const student of students) {
      // Skip students who are already migrated
      if (student.placedCompanies) continue;
      
      const update = {
        placedCompanies: [],
        selectedCount: 0
      };
      
      // If student was placed and had a company, add it to the array
      if (student.isPlaced && student.placedCompany) {
        update.placedCompanies = [student.placedCompany];
        update.selectedCount = 1;
      }
      
      // Update the student record
      await Student.updateOne(
        { _id: student._id },
        { 
          $set: update,
          $unset: { placedCompany: "" }
        }
      );
      
      migratedCount++;
    }
    
    console.log(`Migration complete. Migrated ${migratedCount} student records.`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateData(); 