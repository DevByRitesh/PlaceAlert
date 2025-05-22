import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import NotificationBell from "@/components/NotificationBell";
import DriveCard from "@/components/DriveCard";
import InterviewResourceCard from "@/components/InterviewResourceCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ResumeScore, InterviewResource, Branch, Application, PlacementDrive } from "@/types";
import styles from "@/styles/dashboard.module.css";
import { RefreshCw } from "lucide-react";
import React from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { students, drives, applications, refreshData, isLoading } = useData();
  const navigate = useNavigate();
  
  // Track if initial data has been loaded
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [resumeScores, setResumeScores] = useState<ResumeScore | null>(null);

  // Get current student with proper user ID matching and null checks
  const currentStudent = useMemo(() => {
    if (!user?.id) return null;
    const student = students.find(s => s.userId === user.id) || null;
    
    // Debug log to check the student data and placedCompanies format
    if (student) {
      console.log("Current student data:", student);
      console.log("PlacedCompanies:", student.placedCompanies);
      console.log("IsPlaced status:", student.isPlaced);
      console.log("SelectedCount:", student.selectedCount);
    }
    
    return student;
  }, [students, user?.id]);

  // Helper to safely process placedCompanies which might be a string or an array
  const getPlacedCompanies = useMemo(() => {
    if (!currentStudent) return [];
    
    // Get all applications for the current student
    const studentApps = applications.filter(app => app.studentId === currentStudent.id);
    
    // Get placed companies with their roles
    const placedCompaniesWithRoles = studentApps
      .filter(app => app.status === "selected")
      .map(app => {
        const drive = drives.find(d => d.id === app.driveId);
        if (drive) {
          return `${drive.companyName} (${drive.title})`;
        }
        return null;
      })
      .filter(Boolean); // Remove any null entries
    
    return placedCompaniesWithRoles;
  }, [currentStudent, applications, drives]);

  // Authentication check effect
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (user?.role !== "student") {
      navigate("/");
      return;
    }
  }, [isAuthenticated, user?.role, navigate]);

  // Use a ref to track if initial data has been requested
  const initialDataRequested = React.useRef(false);
  
  // Combine data loading into a single effect to prevent overlapping requests
  useEffect(() => {
    // Skip if not authenticated or not a student
    if (!isAuthenticated || user?.role !== "student") return;
    
    // Initial data load - only once
    if (!initialDataRequested.current && !hasInitialLoad) {
      initialDataRequested.current = true;
      console.log("Performing initial data load...");
      
      setIsDashboardLoading(true);
      refreshData()
        .then(() => {
          setHasInitialLoad(true);
          console.log("Initial data load complete");
        })
        .catch(error => {
          console.error("Error during initial data load:", error);
          toast.error("Failed to load initial data. Please refresh the page.");
        })
        .finally(() => setIsDashboardLoading(false));
    }

    // Set up periodic refresh for real-time data - with proper cleanup
    const refreshIntervalId = setInterval(() => {
      // Only perform refresh if component is still mounted and user is authenticated
      if (isAuthenticated && user?.role === "student") {
        console.log("Performing periodic refresh for real-time data...");
        refreshData().catch(error => {
          console.error("Error during periodic refresh:", error);
          // Don't show toast on periodic refresh failures to avoid annoying users
        });
      }
    }, 60000); // Refresh every minute (increased to reduce server load)
    
    // Clean up interval on unmount or deps change
    return () => {
      console.log("Cleaning up refresh interval");
      clearInterval(refreshIntervalId);
    };
  }, [isAuthenticated, user?.role]); // Removed refreshData from dependencies to avoid loops

  // Move createDefaultResumeScore inside useCallback
  const createDefaultResumeScore = useCallback((feedback: string): ResumeScore => ({
    id: 'default',
    studentId: currentStudent?.id || 'default',
    atsScore: 0,
    technicalScore: 0,
    communicationScore: 0,
    experienceScore: 0,
    skillsScore: 0,
    overallScore: 0,
    feedback,
    createdAt: new Date()
  }), [currentStudent?.id]);

  // Fetch resume scores
  useEffect(() => {
    const fetchScores = async () => {
      if (!currentStudent?.id) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // First try to get the latest resume score
        const scoresRes = await fetch(`${API_BASE_URL}/api/resume-scores/latest/${currentStudent.id}`, {
          headers,
          method: 'GET'
        });

        // Handle 404 case silently - it means no resume score exists yet
        if (scoresRes.status === 404) {
          setResumeScores(createDefaultResumeScore(
            "No resume analysis available yet. Upload your resume to get detailed feedback."
          ));
        } else if (!scoresRes.ok) {
          throw new Error('Failed to fetch resume scores');
        } else {
          const scores = await scoresRes.json();
          setResumeScores(scores);
        }
      } catch (error) {
        console.error('Error fetching resume scores:', error);
        setResumeScores(createDefaultResumeScore(
          "Error loading resume scores. Please try again later."
        ));
      }
    };

    fetchScores();
  }, [currentStudent?.id, createDefaultResumeScore]);

  // Get student applications with memoization and null checks
  const studentApplications = useMemo(() => {
    const apps = applications.filter((app: Application) => app.studentId === currentStudent?.id) || [];
    console.log('Filtered applications for student:', apps);
    console.log('Application statuses:', apps.map(app => ({ id: app.id, status: app.status, round: app.currentRound })));
    return apps;
  }, [applications, currentStudent?.id]);

  // Calculate statistics with memoization
  const stats = useMemo(() => {
    // Count shortlisted applications directly instead of using a Set
    const shortlistedCount = studentApplications.filter(app => {
      console.log('Checking application:', { id: app.id, status: app.status, round: app.currentRound });
      // Count as shortlisted if in round 1 or if explicitly marked as shortlisted
      return app.currentRound === 1 || app.status === "shortlisted";
    }).length;

    const selectedApps = studentApplications.filter(app => app.status === "selected");
    
    // Calculate total selected count, combining profile data and applications
    const totalSelectedCount = currentStudent?.isPlaced && currentStudent?.selectedCount 
      ? Math.max(currentStudent.selectedCount, selectedApps.length)
      : selectedApps.length;
    
    console.log('Current Student:', currentStudent);
    console.log('All Applications:', applications);
    console.log('Student Applications:', studentApplications);
    console.log('Shortlisted Count:', shortlistedCount);
    console.log('Selected Applications:', selectedApps);
    console.log('Total Selected Count:', totalSelectedCount);
    
    return {
      totalApplications: studentApplications.length,
      shortlistedApplications: shortlistedCount,
      selectedApplications: totalSelectedCount,
      rejectedApplications: studentApplications.filter(app => app.status === "rejected").length,
    };
  }, [studentApplications, applications, currentStudent, drives]);

  // Get shortlisted applications with round information
  const shortlistedApplications = useMemo(() => {
    return studentApplications
      .filter(app => app.currentRound === 1 || app.status === "shortlisted")
      .map(app => {
        const drive = drives.find(d => d.id === app.driveId);
        return {
          ...app,
          companyName: drive?.companyName || 'Unknown Company',
          isFirstRound: app.currentRound === 1
        };
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [studentApplications, drives]);

  // Get upcoming drives with memoization
  const upcomingDrives = useMemo(() => {
    if (!currentStudent) return [];
    return drives
      .filter(drive => 
        new Date(drive.lastDateToApply) >= new Date() &&
        drive.eligibleBranches.includes(currentStudent.branch as Branch) &&
        currentStudent.percentage >= drive.minimumPercentage
      )
      .sort((a, b) => new Date(a.lastDateToApply).getTime() - new Date(b.lastDateToApply).getTime())
      .slice(0, 3);
  }, [drives, currentStudent]);

  // Chart data calculations
  const applicationStatusData = useMemo(() => [
    { 
      name: "Applied", 
      value: stats.totalApplications - stats.shortlistedApplications - stats.selectedApplications - stats.rejectedApplications 
    },
    { name: "Shortlisted", value: stats.shortlistedApplications },
    { name: "Selected", value: stats.selectedApplications },
    { name: "Rejected", value: stats.rejectedApplications },
  ].filter(item => item.value > 0), [stats]);

  const COLORS = ["#3E92CC", "#0A2463", "#4CAF50", "#F44336"];
  
  // Get interview resources with memoization
  const interviewResources = useMemo(() => {
    // This would normally come from the API
    // For now, we'll simulate some resources
    return [
      {
        id: "1",
        title: "Technical Interview Preparation Guide",
        description: "Comprehensive guide covering data structures, algorithms, and system design.",
        category: "technical",
        type: "document",
        url: "https://example.com/tech-guide",
        difficulty: "intermediate",
        tags: ["DSA", "System Design"],
        createdAt: new Date()
      },
      {
        id: "2",
        title: "Aptitude Test Practice",
        description: "Practice questions for quantitative, logical, and verbal reasoning.",
        category: "aptitude",
        type: "quiz",
        url: "https://example.com/aptitude",
        difficulty: "beginner",
        tags: ["Quantitative", "Logical"],
        createdAt: new Date()
      },
      {
        id: "3",
        title: "HR Interview Tips",
        description: "Learn how to handle common HR interview questions and scenarios.",
        category: "hr",
        type: "video",
        url: "https://example.com/hr-tips",
        difficulty: "beginner",
        tags: ["Interview", "Soft Skills"],
        createdAt: new Date()
      }
    ] as InterviewResource[];
  }, []);

  // Performance comparison data based on company progress
  const comparisonData = useMemo(() => {
    if (!studentApplications.length || !currentStudent) return [];
    
    const validApplications = studentApplications
      .filter((app: Application) => app.status !== 'rejected')
      .map((application: Application) => {
        const drive = drives.find((d: PlacementDrive) => d.id === application.driveId);
        if (!drive) return null;

        // Calculate progress percentage based on status and rounds
        let progressPercentage = 0;
        let currentStage = '';
        let nextStage = '';
        
        // Check if student is placed in this company
        const isPlacedInCompany = currentStudent?.isPlaced && 
          getPlacedCompanies.some(company => 
            company.toLowerCase() === drive.companyName.toLowerCase()
          );

        // If student is placed in this company, show 100%
        if (isPlacedInCompany || application.status === 'placed') {
          progressPercentage = 100;
          currentStage = 'Placed';
          nextStage = 'Completed';
        } else {
          // Calculate progress based on status and rounds
          switch (application.status) {
            case 'applied':
              progressPercentage = 10; // Start at 10% for application
              currentStage = 'Applied';
              nextStage = 'Shortlisting';
              break;
            case 'shortlisted':
              progressPercentage = 20; // Base percentage for being shortlisted
              currentStage = 'Shortlisted';
              nextStage = 'Selection Rounds';
              break;
            case 'selected':
              // Base percentage for being selected
              progressPercentage = 30;
              currentStage = 'Selected';
              
              // Add percentage based on completed rounds
              if (application.currentRound && drive.numberOfRounds > 1) {
                // Calculate progress per round (remaining 60% divided by number of rounds)
                const progressPerRound = 60 / drive.numberOfRounds;
                // Add progress for completed rounds
                progressPercentage += (application.currentRound - 1) * progressPerRound;
                
                currentStage = `Round ${application.currentRound}`;
                nextStage = application.currentRound < drive.numberOfRounds 
                  ? `Round ${application.currentRound + 1}`
                  : 'Placement Confirmation';
              }
              break;
          }
        }

        return {
          name: drive.companyName,
          progress: Math.round(progressPercentage),
          status: isPlacedInCompany ? 'Placed' : application.status.charAt(0).toUpperCase() + application.status.slice(1),
          currentStage,
          nextStage,
          role: drive.title,
          rounds: drive.numberOfRounds,
          currentRound: application.currentRound || 0
        };
      })
      .filter((item): item is { 
        name: string; 
        progress: number; 
        status: string;
        currentStage: string;
        nextStage: string;
        role: string;
        rounds: number;
        currentRound: number;
      } => item !== null)
      .sort((a, b) => b.progress - a.progress);

    return validApplications;
  }, [studentApplications, drives, currentStudent, getPlacedCompanies]);

  // Redirect if not authenticated or not student
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "student") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  // Get active applications (not rejected)
  const activeApplications = studentApplications.filter(
    app => app.status !== "rejected"
  );

  // Get upcoming interviews (selected applications)
  const upcomingInterviews = activeApplications.filter(
    app => app.status === "selected"
  );

  // Update Badge components to use valid variants
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "selected":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getAttendanceBadgeVariant = (isPresent: boolean) => {
    return isPresent ? "default" : "destructive";
  };

  // Loading state - show only on initial load
  if (!hasInitialLoad && (isDashboardLoading || isLoading)) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-muted flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // No student data state
  if (!currentStudent) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-muted flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">No student profile found. Please contact support.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check if student has already applied to a drive
  const hasApplied = (driveId: string) => {
    return studentApplications.some(app => app.driveId === driveId);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Student Dashboard</h1>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => {
                  toast.info("Refreshing data...");
                  setIsDashboardLoading(true);
                  refreshData()
                    .then(() => {
                      toast.success("Data refreshed successfully");
                      // Force update any derived data that depends on applications
                      setHasInitialLoad(true);
                    })
                    .catch((error) => {
                      console.error("Manual refresh error:", error);
                      toast.error("Failed to refresh data");
                    })
                    .finally(() => {
                      setIsDashboardLoading(false);
                    });
                }}
                disabled={isLoading || isDashboardLoading}
                className="mr-2"
              >
                <RefreshCw className={`h-4 w-4 ${(isLoading || isDashboardLoading) ? 'animate-spin' : ''}`} />
              </Button>
              <NotificationBell />
            </div>
          </div>
          
          {/* Welcome Card */}
          <Card className="mb-8 bg-gradient-to-r from-primary to-secondary text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Welcome, {currentStudent.name}</h2>
                  <p className="opacity-90">
                    {currentStudent.isPlaced 
                      ? `Congratulations on your placement! ${currentStudent.selectedCount && currentStudent.selectedCount > 1 
                          ? `You've been selected in ${currentStudent.selectedCount} companies${getPlacedCompanies.length > 0 ? ` (${getPlacedCompanies.join(", ")})` : ''}.` 
                          : `You've been placed at ${getPlacedCompanies.length > 0 ? getPlacedCompanies.join(", ") : 'your selected company'}.`}` 
                      : "Keep exploring placement opportunities and prepare well for the upcoming drives."}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  onClick={() => navigate("/student/profile-update")}
                >
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              title="Applications" 
              value={stats.totalApplications} 
              description="Total applications submitted"
            />
            <StatCard 
              title="Shortlisted" 
              value={stats.shortlistedApplications} 
              description={`Shortlisted in ${stats.shortlistedApplications} ${stats.shortlistedApplications === 1 ? 'company' : 'companies'}`}
              className={stats.shortlistedApplications > 0 ? "bg-blue-50" : ""}
            />
            <StatCard 
              title="Selected" 
              value={currentStudent.isPlaced ? stats.selectedApplications : 0} 
              description={currentStudent.isPlaced ? "Confirmed placements" : "Offers received"}
              className={currentStudent.isPlaced ? "bg-green-50" : ""}
            />
            <StatCard 
              title="Resume Score" 
              value={resumeScores ? `${resumeScores.overallScore}%` : 'N/A'} 
              description="ATS compatibility score"
            />
          </div>
          
          {/* Shortlisting Details Card */}
          {stats.shortlistedApplications > 0 && (
            <Card className="mb-8 border-blue-200">
              <CardHeader className="bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-blue-900">Shortlisting Status</CardTitle>
                    <CardDescription className="text-blue-700">
                      You have been shortlisted in {stats.shortlistedApplications} {stats.shortlistedApplications === 1 ? 'company' : 'companies'}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-lg px-4 py-1">
                    {stats.shortlistedApplications} {stats.shortlistedApplications === 1 ? 'Company' : 'Companies'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shortlistedApplications.map(application => {
                    const drive = drives.find(d => d.id === application.driveId);
                    if (!drive) {
                      console.warn('No drive found for application:', application);
                      return null;
                    }

                    const nextRoundDateObj = application.nextRoundDate ? new Date(application.nextRoundDate) : null;
                    const isUpcoming = nextRoundDateObj && nextRoundDateObj > new Date();

                    return (
                      <div
                        key={application.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          isUpcoming ? 'bg-blue-50 border-blue-200' : 'hover:bg-accent/20'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{drive.companyName}</h3>
                            <div className="text-sm text-muted-foreground">{drive.title}</div>
                            <div className="mt-2 space-y-1">
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Position:</span> {drive.title}
                              </div>
                              {drive.ctcRange ? (
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Package:</span> {drive.ctcRange.min} - {drive.ctcRange.max} LPA
                                </div>
                              ) : drive.ctc ? (
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Package:</span> {drive.ctc} LPA
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/student/drives/${drive.id}`)}
                            >
                              View Details
                            </Button>
                            {application.isFirstRound && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                First Round Selection
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium">Shortlisted on:</span>
                            {format(new Date(application.updatedAt), "PPP")}
                          </div>
                          {nextRoundDateObj && (
                            <div className={`flex items-center gap-2 text-sm ${
                              isUpcoming ? 'text-blue-700' : 'text-muted-foreground'
                            }`}>
                              <span className="font-medium">Next Round:</span>
                              {format(nextRoundDateObj, "PPP 'at' p")}
                              {isUpcoming && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                  Upcoming
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Selected Applications Card */}
          {(currentStudent.isPlaced && getPlacedCompanies.length > 0) && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Selected Status</CardTitle>
                <CardDescription>
                  Congratulations! You have been placed 
                  {currentStudent.selectedCount && currentStudent.selectedCount > 1 
                    ? ` in ${currentStudent.selectedCount} companies` 
                    : ''
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-green-700">
                      Confirmed Placements
                    </h3>
                    <div className="space-y-4">
                      {getPlacedCompanies.map((companyName, index) => {
                        const matchingDrive = drives.find(d => d.companyName.toLowerCase() === companyName.toLowerCase());
                        
                        return (
                          <div
                            key={`placed-${index}`}
                            className="p-4 border rounded-lg bg-green-50 border-green-200 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{companyName}</h3>
                                {matchingDrive && (
                                  <>
                                    <div className="text-sm text-muted-foreground">{matchingDrive.title}</div>
                                    <div className="mt-2 space-y-1">
                                      {matchingDrive.ctcRange ? (
                                        <div className="text-sm text-muted-foreground">
                                          <span className="font-medium">Package:</span> {matchingDrive.ctcRange.min} - {matchingDrive.ctcRange.max} LPA
                                        </div>
                                      ) : matchingDrive.ctc ? (
                                        <div className="text-sm text-muted-foreground">
                                          <span className="font-medium">Package:</span> {matchingDrive.ctc} LPA
                                        </div>
                                      ) : null}
                                    </div>
                                  </>
                                )}
                              </div>
                              {matchingDrive && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/student/drives/${matchingDrive.id}`)}
                                >
                                  View Details
                                </Button>
                              )}
                            </div>
                            <div className="mt-3">
                              <Badge className="bg-green-100 text-green-700">
                                Confirmed Placement
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Charts and Application Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {applicationStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={applicationStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {applicationStatusData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">
                      No application data available. Start applying to placement drives.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Company-wise Progress</CardTitle>
                <CardDescription>Your progress in different companies' recruitment processes</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {comparisonData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={150}
                        tick={({ x, y, payload }) => (
                          <g transform={`translate(${x},${y})`}>
                            <text x={0} y={0} dy={4} textAnchor="end" fill="#666" fontSize={12}>
                              {payload.value}
                            </text>
                          </g>
                        )}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-lg">
                                <p className="font-semibold">{data.name}</p>
                                <p className="text-sm text-gray-600">{data.role}</p>
                                <p className="text-sm">
                                  <span className="font-medium">Progress:</span> {data.progress}%
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Current Stage:</span> {data.currentStage}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Next Stage:</span> {data.nextStage}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Rounds:</span> {data.currentRound}/{data.rounds}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="progress" 
                        name="Progress" 
                        fill="#0A2463"
                        radius={[0, 4, 4, 0]}
                      >
                        {comparisonData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`}
                            fill={
                              entry.progress === 100 
                                ? "#4CAF50"  // Selected - Green
                                : entry.progress >= 50 
                                  ? "#3E92CC"  // Shortlisted - Blue
                                  : "#FFC107"  // Applied - Yellow
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">
                      No application data available. Start applying to placement drives.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Upcoming Drives */}
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Drives</CardTitle>
              <Button size="sm" variant="outline" asChild>
                <Link to="/student/drives">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingDrives.length > 0 ? (
                  upcomingDrives.map(drive => {
                    const application = studentApplications.find(app => app.driveId === drive.id);
                    return (
                      <DriveCard 
                        key={drive.id}
                        drive={drive}
                        isEligible={true}
                        hasApplied={hasApplied(drive.id)}
                        onApply={() => navigate(`/student/drives/${drive.id}`)}
                        application={application}
                        isStudentDashboard={true}
                        showDetails={false}
                      />
                    );
                  })
                ) : (
                  <div className="col-span-3 p-8 text-center">
                    <div className="text-sm text-muted-foreground">
                      No upcoming drives match your eligibility criteria.
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Links */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Resources</CardTitle>
                <CardDescription>
                  Prepare for your interviews with these curated resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="technical">Technical</TabsTrigger>
                    <TabsTrigger value="aptitude">Aptitude</TabsTrigger>
                    <TabsTrigger value="hr">HR</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4">
                    {interviewResources.map(resource => (
                      <InterviewResourceCard key={resource.id} resource={resource} />
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="technical" className="space-y-4">
                    {interviewResources
                      .filter(r => r.category === 'technical')
                      .map(resource => (
                        <InterviewResourceCard key={resource.id} resource={resource} />
                      ))}
                  </TabsContent>
                  
                  <TabsContent value="aptitude" className="space-y-4">
                    {interviewResources
                      .filter(r => r.category === 'aptitude')
                      .map(resource => (
                        <InterviewResourceCard key={resource.id} resource={resource} />
                      ))}
                  </TabsContent>
                  
                  <TabsContent value="hr" className="space-y-4">
                    {interviewResources
                      .filter(r => r.category === 'hr')
                      .map(resource => (
                        <InterviewResourceCard key={resource.id} resource={resource} />
                      ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Resume Score Card */}
            <Card>
              <CardHeader>
                <CardTitle>Resume Analysis</CardTitle>
                <CardDescription>
                  Your resume performance and improvement suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">ATS Compatibility</span>
                          <span className="text-sm font-medium">
                            {resumeScores ? `${resumeScores.atsScore}%` : 'N/A'}
                          </span>
                        </div>
                        <div className={styles.progressBarContainer}>
                          <div 
                            className={styles.progressBarAts}
                            data-score={`${resumeScores?.atsScore || 0}%`}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Technical Content</span>
                          <span className="text-sm font-medium">
                            {resumeScores ? `${resumeScores.technicalScore}%` : 'N/A'}
                          </span>
                        </div>
                        <div className={styles.progressBarContainer}>
                          <div 
                            className={styles.progressBarTechnical}
                            data-score={`${resumeScores?.technicalScore || 0}%`}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Skills Coverage</span>
                          <span className="text-sm font-medium">
                            {resumeScores ? `${resumeScores.skillsScore}%` : 'N/A'}
                          </span>
                        </div>
                        <div className={styles.progressBarContainer}>
                          <div 
                            className={styles.progressBarSkills}
                            data-score={`${resumeScores?.skillsScore || 0}%`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Suggestions</h3>
                    {resumeScores ? (
                      <ul className="space-y-2 text-sm">
                        {resumeScores.feedback.split('\n').map((suggestion, index) => (
                          <li key={index} className="flex items-start">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No resume analysis available. Upload your resume to get detailed feedback.
                      </div>
                    )}
                    
                    <Button className="w-full mt-4" asChild>
                      <Link to="/student/resume">Improve Your Resume</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Interviews */}
          {upcomingInterviews.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Upcoming Interviews</CardTitle>
                <CardDescription>Your next round interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingInterviews.map(application => {
                    const drive = drives.find(d => d.id === application.driveId);
                    if (!drive) return null;

                    return (
                      <div
                        key={application.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/20 transition-colors"
                      >
                        <div>
                          <h3 className="font-medium">{drive.companyName}</h3>
                          <p className="text-sm text-muted-foreground">{drive.title}</p>
                          <div className="text-sm mt-1">
                            <span className="font-medium">Round {application.currentRound}</span>
                            {" "}
                            <Badge 
                              variant={getAttendanceBadgeVariant(application.isPresent)}
                              className={application.isPresent ? "bg-green-500 hover:bg-green-600" : ""}
                            >
                              {application.isPresent ? "Present" : "Absent"}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/student/drives/${drive.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Application History</CardTitle>
              <CardDescription>Track your placement journey</CardDescription>
            </CardHeader>
            <CardContent>
              {studentApplications.length > 0 ? (
                <div className="space-y-4">
                  {studentApplications.map(application => {
                    const drive = drives.find(d => d.id === application.driveId);
                    if (!drive) return null;

                    return (
                      <div
                        key={application.id}
                        className="p-4 border rounded-lg hover:bg-accent/20 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{drive.companyName}</h3>
                            <div className="text-sm text-muted-foreground">{drive.title}</div>
                          </div>
                          <Badge
                            variant={getStatusBadgeVariant(application.status)}
                            className={application.status === "selected" ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {application.status === "selected" 
                              ? `Selected - Round ${application.currentRound}`
                              : application.status}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <div>Applied on: {format(new Date(application.createdAt), "PPP")}</div>
                          {application.isPresent !== undefined && (
                            <div className="flex items-center gap-2">
                              <span>Last Round:</span>
                              <Badge 
                                variant={getAttendanceBadgeVariant(application.isPresent)}
                                className={application.isPresent ? "bg-green-500 hover:bg-green-600" : ""}
                              >
                                {application.isPresent ? "Present" : "Absent"}
                              </Badge>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => navigate(`/student/drives/${drive.id}`)}
                        >
                          View Drive Details
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">You haven't applied to any drives yet.</div>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate("/student/drives")}
                  >
                    Browse Available Drives
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudentDashboard;
