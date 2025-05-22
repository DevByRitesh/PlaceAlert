export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "student";
  createdAt: Date;
}

export type Student = {
  id: string;
  userId: string;
  name: string;
  email: string;
  branch: string;
  percentage: number;
  resume?: string;
  isPlaced: boolean;
  placedCompanies?: string[];
  selectedCount?: number;
  createdAt: Date;
}

export type Company = {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  location?: string;
  createdAt: Date;
}

export type PlacementDrive = {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  requirements: string;
  eligibleBranches: string[];
  minimumPercentage: number;
  ctcRange?: {
    min: number;
    max: number;
  };
  ctc?: number;
  numberOfRounds: number;
  applicationLink?: string;
  driveDate: Date;
  lastDateToApply: Date;
  createdAt: Date;
}

export type Application = {
  id: string;
  studentId: string;
  driveId: string;
  status: "applied" | "shortlisted" | "rejected" | "selected";
  resumeUrl?: string;
  isPresent: boolean;
  currentRound?: number;
  createdAt: Date;
  updatedAt: Date;
  nextRoundDate?: Date;
}

export type Notification = {
  id: string;
  title: string;
  message: string;
  recipients: "all" | "placed" | "unplaced" | string[];
  read: string[];
  createdAt: Date;
}

export type Event = {
  id: string;
  title: string;
  description?: string;
  date: Date;
  driveId?: string;
  createdAt: Date;
}

export type Branch = 
  | "Computer Science"
  | "Information Technology"
  | "Electronics"
  | "Electrical"
  | "Mechanical"
  | "Civil"
  | "Chemical"
  | "Biotechnology"
  | "Other";

export const branches: Branch[] = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Electrical", 
  "Mechanical",
  "Civil",
  "Chemical",
  "Biotechnology",
  "Other"
];

export interface ResumeScore {
  id: string;
  studentId: string;
  atsScore: number;
  technicalScore: number;
  communicationScore: number;
  experienceScore: number;
  skillsScore: number;
  overallScore: number;
  feedback: string;
  createdAt: Date;
}

export interface InterviewResource {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'aptitude' | 'hr' | 'soft-skills';
  type: 'document' | 'video' | 'quiz';
  url: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  createdAt: Date;
}
