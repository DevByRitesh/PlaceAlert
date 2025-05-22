const mongoose = require('mongoose');
const ResumeScore = require('../models/ResumeScore');
const Student = require('../models/Student');

const seedResumeScores = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get all students
    const students = await Student.find({});
    console.log(`Found ${students.length} students`);

    // Create initial resume scores for each student
    for (const student of students) {
      const existingScore = await ResumeScore.findOne({ studentId: student._id });
      
      if (!existingScore) {
        const initialScore = new ResumeScore({
          studentId: student._id,
          atsScore: Math.floor(Math.random() * 20) + 70, // 70-90
          technicalScore: Math.floor(Math.random() * 20) + 70,
          communicationScore: Math.floor(Math.random() * 20) + 70,
          experienceScore: Math.floor(Math.random() * 20) + 65,
          skillsScore: Math.floor(Math.random() * 15) + 75,
          overallScore: Math.floor(Math.random() * 15) + 75,
          feedback: [
            "Add more quantifiable achievements",
            "Include relevant certifications",
            "Highlight technical skills",
            "Improve formatting for better readability"
          ].join('\n')
        });

        await initialScore.save();
        console.log(`Created initial resume score for student ${student.name}`);
      } else {
        console.log(`Resume score already exists for student ${student.name}`);
      }
    }

    console.log('Resume scores seeding completed');
  } catch (error) {
    console.error('Error seeding resume scores:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeding function
seedResumeScores(); 