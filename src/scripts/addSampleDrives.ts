import { PlacementDrive } from "@/types";

const sampleDrives: PlacementDrive[] = [
  {
    id: "drive1",
    companyId: "comp1",
    companyName: "Google",
    title: "Software Development Engineer",
    description: "Join Google's engineering team to build next-generation products and services.",
    requirements: "Strong programming skills in Java/Python/C++, Data Structures and Algorithms, Problem Solving",
    eligibleBranches: ["CSE", "IT", "ECE"],
    minimumPercentage: 70,
    ctcRange: {
      min: 12,
      max: 15
    },
    numberOfRounds: 3,
    applicationLink: "https://careers.google.com",
    driveDate: new Date("2024-04-15"),
    lastDateToApply: new Date("2024-04-01"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "drive2",
    companyId: "comp2",
    companyName: "Microsoft",
    title: "Full Stack Developer",
    description: "Work on cutting-edge web technologies and cloud services at Microsoft.",
    requirements: "Experience with React/Node.js, Cloud platforms, Database design",
    eligibleBranches: ["CSE", "IT"],
    minimumPercentage: 65,
    ctcRange: {
      min: 10,
      max: 13
    },
    numberOfRounds: 4,
    applicationLink: "https://careers.microsoft.com",
    driveDate: new Date("2024-04-20"),
    lastDateToApply: new Date("2024-04-05"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "drive3",
    companyId: "comp3",
    companyName: "Amazon",
    title: "Backend Developer",
    description: "Build scalable backend services for Amazon's e-commerce platform.",
    requirements: "Strong in Java/Spring Boot, Microservices, AWS",
    eligibleBranches: ["CSE", "IT", "ECE"],
    minimumPercentage: 68,
    ctcRange: {
      min: 11,
      max: 14
    },
    numberOfRounds: 3,
    applicationLink: "https://amazon.jobs",
    driveDate: new Date("2024-04-25"),
    lastDateToApply: new Date("2024-04-10"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "drive4",
    companyId: "comp4",
    companyName: "Goldman Sachs",
    title: "Software Engineer",
    description: "Join our technology team to build financial systems and trading platforms.",
    requirements: "Strong programming fundamentals, Problem Solving, Interest in Finance",
    eligibleBranches: ["CSE", "IT", "ECE", "EEE"],
    minimumPercentage: 75,
    ctcRange: {
      min: 13,
      max: 16
    },
    numberOfRounds: 5,
    applicationLink: "https://www.goldmansachs.com/careers",
    driveDate: new Date("2024-05-01"),
    lastDateToApply: new Date("2024-04-15"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "drive5",
    companyId: "comp5",
    companyName: "Adobe",
    title: "Frontend Developer",
    description: "Create beautiful and intuitive user interfaces for Adobe's creative products.",
    requirements: "Expertise in JavaScript/TypeScript, React, UI/UX design",
    eligibleBranches: ["CSE", "IT"],
    minimumPercentage: 65,
    ctcRange: {
      min: 10,
      max: 12
    },
    numberOfRounds: 3,
    applicationLink: "https://careers.adobe.com",
    driveDate: new Date("2024-05-05"),
    lastDateToApply: new Date("2024-04-20"),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default sampleDrives; 