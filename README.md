# PlaceAlert - Campus Placement Management System

## Overview
PlaceAlert is a comprehensive campus placement management system designed to streamline the placement process for educational institutions. It offers an integrated platform for both administrators and students, facilitating efficient management of placement drives, applications, and communications.

## Project Structure
```
├── frontend (React + TypeScript)
│   ├── components
│   ├── context
│   ├── hooks
│   ├── lib
│   ├── pages
│   │   ├── admin
│   │   └── student
│   ├── styles
│   ├── types
│   └── utils
└── backend (Node.js + Express)
    ├── middleware
    ├── models
    ├── routes
    ├── scripts
    └── uploads
```

## Features

### Authentication System
- **User Roles**: Supports two user types - administrators and students
- **Secure Authentication**: JWT-based authentication
- **Protected Routes**: Role-based access control

### Admin Features
1. **Dashboard**
   - Overview of placement statistics
   - Recent activities
   - Quick access to important functions

2. **Placement Drive Management**
   - Create new placement drives
   - Edit existing drive details
   - Set eligibility criteria (branches, CGPA, etc.)
   - Schedule drive phases and deadlines

3. **Student Management**
   - View all registered students
   - Filter students by branch, percentage, etc.
   - View detailed student profiles
   - Track student participation in drives

4. **Application Processing**
   - Review student applications
   - Approve/reject applications
   - Track application status
   - Provide feedback

5. **Company Management**
   - Add new companies
   - Maintain company profiles
   - Track company recruitment history

6. **Event Calendar**
   - Schedule placement-related events
   - Manage pre-placement talks
   - Schedule interviews and tests

7. **Reports Generation**
   - Generate placement statistics
   - Track department-wise placement
   - Monitor placement trends

8. **Notifications**
   - Send announcements
   - Alert students about new opportunities
   - Send reminders for deadlines

### Student Features
1. **Dashboard**
   - Overview of eligible drives
   - Application status tracking
   - Upcoming events and deadlines

2. **Profile Management**
   - Update personal information
   - Upload and manage resume
   - Update academic details

3. **Drive Applications**
   - View eligible placement drives
   - Apply to open drives
   - Track application status
   - Receive feedback

4. **Resume Management**
   - Upload resume
   - Resume scoring and feedback
   - Resume improvement suggestions

5. **Calendar**
   - View upcoming placement events
   - Schedule interviews
   - Set reminders for important dates

6. **Notifications**
   - Receive alerts about new drives
   - Get application status updates
   - Important announcements

## Technical Stack

### Frontend
- **Framework**: React with TypeScript
- **State Management**: React Context API
- **Routing**: React Router
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **HTTP Client**: Custom API utility with Axios
- **Form Handling**: React Hook Form
- **Data Fetching**: TanStack Query (React Query)
- **Notifications**: Sonner toast notifications

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer
- **API Security**: CORS, Rate Limiting, Input Validation
- **Error Handling**: Centralized error middleware

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student profile
- `DELETE /api/students/:id` - Remove student

### Companies
- `GET /api/companies` - List all companies
- `POST /api/companies` - Add new company
- `GET /api/companies/:id` - Get company details
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Remove company

### Placement Drives
- `GET /api/drives` - List all drives
- `POST /api/drives` - Create new drive
- `GET /api/drives/:id` - Get drive details
- `PUT /api/drives/:id` - Update drive
- `DELETE /api/drives/:id` - Remove drive

### Applications
- `GET /api/applications` - List all applications
- `POST /api/applications` - Submit application
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id` - Update application status
- `DELETE /api/applications/:id` - Remove application

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Resume Management
- `POST /api/resume-scores` - Upload and score resume
- `GET /api/resume-scores/:id` - Get resume feedback

## Data Models

### User
- Basic user information
- Authentication details
- Role-based permissions

### Student
- Academic details (branch, percentage, etc.)
- Contact information
- Resume and skills

### Company
- Company details
- Contact information
- Job profiles offered

### PlacementDrive
- Drive details and eligibility
- Timeline and phases
- Associated company
- Required skills

### Application
- Student information
- Drive reference
- Status and feedback
- Interview rounds

### Notification
- Message content
- Target users
- Read status

### Event
- Event details and type
- Date and time
- Associated drive

### ResumeScore
- Resume analysis
- Improvement suggestions
- Score by categories

## Flow Diagram

```
┌─────────────────┐     ┌─────────────────────┐     ┌────────────────┐
│                 │     │                     │     │                │
│     Student     │◄────┤  Authentication &   │────►│     Admin      │
│                 │     │   Authorization     │     │                │
└─────┬───────────┘     └─────────────────────┘     └────┬───────────┘
      │                                                  │
      ▼                                                  ▼
┌─────────────────┐                              ┌────────────────┐
│ View & Apply to │                              │  Create & Manage │
│  Placement Drives│                              │ Placement Drives │
└─────┬───────────┘                              └────┬───────────┘
      │                                                │
      ▼                                                ▼
┌─────────────────┐     ┌─────────────────────┐     ┌────────────────┐
│                 │     │                     │     │                │
│ Track Application│────►│ Application Database │◄────┤ Review & Process│
│    Status       │     │                     │     │   Applications  │
└─────┬───────────┘     └─────────────────────┘     └────┬───────────┘
      │                                                  │
      ▼                                                  ▼
┌─────────────────┐                              ┌────────────────┐
│                 │                              │                │
│ Receive Updates &│                              │ Send Notifications│
│  Notifications  │                              │ & Generate Reports│
└─────────────────┘                              └────────────────┘
```

## Installation

### Prerequisites
- Node.js v14+
- MongoDB
- npm or yarn

### Frontend Setup
```bash
# Navigate to project root
cd PlaceAlert

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start server
node server.js
```

## Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT signing
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Contributors
- Your Name - Project Lead
- [Add contributors as needed]

## License
[Add license information]
