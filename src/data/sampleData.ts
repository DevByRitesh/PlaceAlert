import { 
  Student, 
  Company, 
  PlacementDrive, 
  Application, 
  Notification, 
  Event 
} from "@/types";

// Sample students
export const sampleStudents: Student[] = [
  {
    id: "s1",
    userId: "u1",
    name: "John Doe",
    email: "john@example.com",
    branch: "Computer Science",
    percentage: 85.5,
    isPlaced: false,
    placedCompanies: [],
    selectedCount: 0,
    createdAt: new Date("2023-09-01")
  },
  {
    id: "s2",
    userId: "u2",
    name: "Jane Smith",
    email: "jane@example.com",
    branch: "Information Technology",
    percentage: 92.3,
    isPlaced: true,
    placedCompanies: ["Tech Solutions Inc."],
    selectedCount: 1,
    createdAt: new Date("2023-09-02")
  },
  {
    id: "s3",
    userId: "u3",
    name: "Mike Johnson",
    email: "mike@example.com",
    branch: "Electronics",
    percentage: 78.9,
    isPlaced: false,
    placedCompanies: [],
    selectedCount: 0,
    createdAt: new Date("2023-09-03")
  },
  {
    id: "s4",
    userId: "u4",
    name: "Sara Wilson",
    email: "sara@example.com",
    branch: "Computer Science",
    percentage: 88.7,
    isPlaced: true,
    placedCompanies: ["InnovateTech", "Global Systems"],
    selectedCount: 2,
    createdAt: new Date("2023-09-04")
  },
  {
    id: "s5",
    userId: "u5",
    name: "Alex Brown",
    email: "alex@example.com",
    branch: "Mechanical",
    percentage: 81.2,
    isPlaced: false,
    placedCompanies: [],
    selectedCount: 0,
    createdAt: new Date("2023-09-05")
  }
];

// Sample companies
export const sampleCompanies: Company[] = [
  {
    id: "c1",
    name: "Tech Solutions Inc.",
    description: "Leading software development company",
    website: "https://techsolutions.example.com",
    location: "Bangalore",
    createdAt: new Date("2023-08-15")
  },
  {
    id: "c2",
    name: "InnovateTech",
    description: "AI and Machine Learning focused company",
    website: "https://innovatetech.example.com",
    location: "Mumbai",
    createdAt: new Date("2023-08-20")
  },
  {
    id: "c3",
    name: "GlobalSys",
    description: "Global IT consulting and services",
    website: "https://globalsys.example.com",
    location: "Delhi",
    createdAt: new Date("2023-08-25")
  },
  {
    id: "c4",
    name: "DataAnalytica",
    description: "Big data and analytics solutions",
    website: "https://dataanalytica.example.com",
    location: "Hyderabad",
    createdAt: new Date("2023-08-30")
  }
];

// Sample placement drives
export const sampleDrives: PlacementDrive[] = [
  {
    id: "d1",
    companyId: "c1",
    companyName: "Tech Solutions Inc.",
    title: "Software Engineer",
    description: "We're looking for talented software engineers to join our team",
    requirements: "Strong knowledge of data structures and algorithms",
    eligibleBranches: ["Computer Science", "Information Technology"],
    minimumPercentage: 70,
    applicationLink: "https://forms.example.com/techsolutions",
    driveDate: new Date("2023-10-15"),
    lastDateToApply: new Date("2023-10-10"),
    createdAt: new Date("2023-09-15")
  },
  {
    id: "d2",
    companyId: "c2",
    companyName: "InnovateTech",
    title: "AI Research Intern",
    description: "Internship opportunity in our AI research division",
    requirements: "Knowledge of machine learning frameworks",
    eligibleBranches: ["Computer Science", "Electronics"],
    minimumPercentage: 80,
    applicationLink: "https://forms.example.com/innovatetech",
    driveDate: new Date("2023-10-20"),
    lastDateToApply: new Date("2023-10-15"),
    createdAt: new Date("2023-09-20")
  },
  {
    id: "d3",
    companyId: "c3",
    companyName: "GlobalSys",
    title: "System Analyst",
    description: "Join our team as a system analyst",
    requirements: "Understanding of enterprise systems",
    eligibleBranches: ["Computer Science", "Information Technology", "Electronics"],
    minimumPercentage: 75,
    applicationLink: "https://forms.example.com/globalsys",
    driveDate: new Date("2023-10-25"),
    lastDateToApply: new Date("2023-10-20"),
    createdAt: new Date("2023-09-25")
  }
];

// Sample applications
export const sampleApplications: Application[] = [
  {
    id: "a1",
    studentId: "s1",
    driveId: "d1",
    status: "applied",
    isPresent: false,
    createdAt: new Date("2023-09-25")
  },
  {
    id: "a2",
    studentId: "s3",
    driveId: "d1",
    status: "shortlisted",
    isPresent: true,
    currentRound: 1,
    createdAt: new Date("2023-09-26")
  },
  {
    id: "a3",
    studentId: "s4",
    driveId: "d2",
    status: "selected",
    isPresent: true,
    currentRound: 3,
    createdAt: new Date("2023-09-27")
  },
  {
    id: "a4",
    studentId: "s5",
    driveId: "d3",
    status: "rejected",
    isPresent: true,
    currentRound: 2,
    createdAt: new Date("2023-09-28")
  }
];

// Sample notifications
export const sampleNotifications: Notification[] = [
  {
    id: "n1",
    title: "New Placement Drive",
    message: "Tech Solutions Inc. is conducting a campus placement drive on 15th October.",
    recipients: "all",
    read: [],
    createdAt: new Date("2023-09-15")
  },
  {
    id: "n2",
    title: "Resume Submission Reminder",
    message: "Don't forget to submit your resume for the InnovateTech placement drive.",
    recipients: "unplaced",
    read: ["u2", "u4"],
    createdAt: new Date("2023-09-20")
  },
  {
    id: "n3",
    title: "Pre-placement Talk",
    message: "GlobalSys will be conducting a pre-placement talk tomorrow.",
    recipients: ["u1", "u3", "u5"],
    read: ["u1"],
    createdAt: new Date("2023-09-24")
  }
];

// Sample events
export const sampleEvents: Event[] = [
  {
    id: "e1",
    title: "Tech Solutions Inc. Placement Drive",
    description: "Software Engineer",
    date: new Date("2023-10-15"),
    driveId: "d1",
    createdAt: new Date("2023-09-15")
  },
  {
    id: "e2",
    title: "InnovateTech Placement Drive",
    description: "AI Research Intern",
    date: new Date("2023-10-20"),
    driveId: "d2",
    createdAt: new Date("2023-09-20")
  },
  {
    id: "e3",
    title: "Resume Workshop",
    description: "Learn how to create an ATS-friendly resume",
    date: new Date("2023-10-05"),
    createdAt: new Date("2023-09-22")
  },
  {
    id: "e4",
    title: "Interview Preparation Session",
    description: "Mock interviews and tips",
    date: new Date("2023-10-08"),
    createdAt: new Date("2023-09-23")
  }
];
