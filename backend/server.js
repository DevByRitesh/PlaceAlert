require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import models
const Student = require('./models/Student');
const PlacementDrive = require('./models/PlacementDrive');
const Application = require('./models/Application');

// Import middleware
const { auth, adminAuth } = require('./middleware/auth');

// Import route files
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const companyRoutes = require('./routes/companies');
const driveRoutes = require('./routes/drives');
const applicationRoutes = require('./routes/applications');
const notificationRoutes = require('./routes/notifications');
const eventRoutes = require('./routes/events');
const resumeScoreRoutes = require('./routes/resumeScores');

// Initialize Express app
const app = express();

// Direct MongoDB connection for emergency fixes
let directMongoClient = null;
let directDb = null;

// Connect to MongoDB directly as well for emergency operations
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected via Mongoose');
    serverStatus.mongoStatus = 'connected';
    
    // Also connect directly via MongoDB driver
    return mongoose.connection.getClient();
  })
  .then(client => {
    directMongoClient = client;
    directDb = client.db();
    console.log('Direct MongoDB connection established');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    serverStatus.mongoStatus = 'error';
  });

// Server status tracking
const serverStatus = {
  startTime: new Date(),
  mongoStatus: 'disconnected',
  uptime: 0,
  port: null
};

// Update uptime every second
setInterval(() => {
  serverStatus.uptime = Math.floor((new Date() - serverStatus.startTime) / 1000);
}, 1000);

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com' 
    : ['http://localhost:5173', 'http://localhost:8080']
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/resume-scores', resumeScoreRoutes);

// Server Status Dashboard
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PlaceAlert Connect - Server Status</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
                color: #333;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
                color: #2c3e50;
                text-align: center;
                margin-bottom: 30px;
            }
            .status-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .status-card {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
            }
            .status-card h3 {
                margin: 0 0 10px 0;
                color: #2c3e50;
            }
            .status-card p {
                margin: 0;
                font-size: 1.2em;
                font-weight: bold;
            }
            .status-connected {
                color: #27ae60;
            }
            .status-disconnected {
                color: #e74c3c;
            }
            .api-list {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
            }
            .api-list h2 {
                color: #2c3e50;
                margin-top: 0;
            }
            .api-list ul {
                list-style: none;
                padding: 0;
            }
            .api-list li {
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            .api-list li:last-child {
                border-bottom: none;
            }
            .uptime {
                font-family: monospace;
                font-size: 1.1em;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>PlaceAlert Connect - Server Status</h1>
            <div class="status-grid">
                <div class="status-card">
                    <h3>MongoDB Status</h3>
                    <p class="status-${serverStatus.mongoStatus}">${serverStatus.mongoStatus.toUpperCase()}</p>
                </div>
                <div class="status-card">
                    <h3>Server Port</h3>
                    <p>${serverStatus.port || 'Not Started'}</p>
                </div>
                <div class="status-card">
                    <h3>Uptime</h3>
                    <p class="uptime">${serverStatus.uptime} seconds</p>
                </div>
            </div>
            <div class="api-list">
                <h2>Available API Endpoints</h2>
                <ul>
                    <li>/api/auth - Authentication endpoints</li>
                    <li>/api/students - Student management</li>
                    <li>/api/companies - Company management</li>
                    <li>/api/drives - Placement drives</li>
                    <li>/api/applications - Application management</li>
                    <li>/api/notifications - Notification system</li>
                    <li>/api/events - Event management</li>
                    <li>/api/resume-scores - Resume scoring</li>
                </ul>
            </div>
        </div>
        <script>
            // Auto-refresh uptime
            setInterval(() => {
                fetch('/api/status')
                    .then(res => res.json())
                    .then(data => {
                        document.querySelector('.uptime').textContent = data.uptime + ' seconds';
                    });
            }, 1000);
        </script>
    </body>
    </html>
  `;
  res.send(html);
});

// Status API endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    mongoStatus: serverStatus.mongoStatus,
    uptime: serverStatus.uptime,
    port: serverStatus.port
  });
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Emergency direct MongoDB update endpoint
app.put('/api/emergency-fix/:collectionName/:id', async (req, res) => {
  try {
    if (!directDb) {
      return res.status(500).json({ message: 'Direct MongoDB connection not established' });
    }
    
    const { collectionName, id } = req.params;
    const { field, value } = req.body;
    
    if (!field || value === undefined) {
      return res.status(400).json({ message: 'Field and value are required' });
    }
    
    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    // Create an update object
    const updateObj = {};
    updateObj[field] = typeof value === 'string' && !isNaN(Number(value)) ? 
      Number(value) : value;
    
    console.log(`Emergency fix: Updating ${collectionName}.${id}.${field} to`, updateObj[field]);
    
    // Execute direct update
    const collection = directDb.collection(collectionName);
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateObj }
    );
    
    console.log('Direct MongoDB update result:', result);
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ 
        message: 'Document not found or not modified',
        result
      });
    }
    
    // Fetch the updated document
    const updatedDoc = await collection.findOne({ _id: objectId });
    
    return res.status(200).json({
      message: `${collectionName} document updated successfully`,
      document: updatedDoc,
      updateResult: result
    });
  } catch (error) {
    console.error('Error in emergency fix:', error);
    return res.status(500).json({ 
      message: 'Failed to perform emergency update',
      error: error.message 
    });
  }
});

// Update application status (admin)
app.put('/api/applications/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status, currentRound } = req.body;
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Update application status
    application.status = status;
    
    // If provided, update current round
    if (currentRound !== undefined) {
      application.currentRound = currentRound;
    }
    
    // If status is 'selected', update student placement status
    if (status === 'selected') {
      const student = await Student.findById(application.studentId);
      const drive = await PlacementDrive.findById(application.driveId);
      
      if (student && drive) {
        student.isPlaced = true;
        
        // Add this company to the student's placed companies if not already there
        const companyName = drive.companyName;
        if (!student.placedCompanies) {
          student.placedCompanies = [companyName];
        } else if (!student.placedCompanies.includes(companyName)) {
          student.placedCompanies.push(companyName);
        }
        
        // Increment or set the selected count
        student.selectedCount = (student.selectedCount || 0) + 1;
        
        await student.save();
      }
    } 
    // If status is changed from 'selected' to something else, update selected count
    else if (application.status === 'selected' && status !== 'selected') {
      const student = await Student.findById(application.studentId);
      const drive = await PlacementDrive.findById(application.driveId);
      
      if (student && drive) {
        const companyName = drive.companyName;
        
        // Remove this company from placedCompanies
        if (student.placedCompanies && student.placedCompanies.includes(companyName)) {
          student.placedCompanies = student.placedCompanies.filter(c => c !== companyName);
          
          // Decrement the selected count
          student.selectedCount = Math.max(0, (student.selectedCount || 1) - 1);
          
          // If no companies left, set isPlaced to false
          if (student.placedCompanies.length === 0) {
            student.isPlaced = false;
          }
          
          await student.save();
        }
      }
    }
    
    await application.save();
    
    res.status(200).json({ 
      message: 'Application status updated successfully', 
      application 
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Failed to update application status', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const startServer = async (initialPort) => {
  const findAvailablePort = async (startPort) => {
    let port = startPort;
    while (port < startPort + 10) { // Try up to 10 ports
      try {
        await new Promise((resolve, reject) => {
          const server = app.listen(port, () => {
            console.log(`Server running on port ${port}`);
            serverStatus.port = port;
            resolve(server);
          }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
              console.log(`Port ${port} is busy, trying next port...`);
              port++;
              reject(err);
            } else {
              reject(err);
            }
          });
        });
        return port; // If successful, return the port
      } catch (err) {
        if (port === startPort + 9) { // If we've tried all ports
          throw new Error('Could not find an available port');
        }
        // Otherwise continue to next port
      }
    }
  };

  try {
    const PORT = process.env.PORT || initialPort || 5000;
    await findAvailablePort(PORT);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer(5000);
