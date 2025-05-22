import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, ExternalLink, FileUp, Building, Users, Percent } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DriveDetails = () => {
  const { driveId } = useParams<{ driveId: string }>();
  const { user, isAuthenticated } = useAuth();
  const { students, drives, addApplication, applications, refreshData } = useData();
  const navigate = useNavigate();
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  
  // Redirect if not authenticated or not student
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "student") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);
  
  // For a real application, we'd use the actual logged in student
  // For now, let's use the first student in our sample data
  const currentStudent = students[0];
  
  // Get drive details
  const drive = drives.find(d => d.id === driveId);
  
  // Get current application
  const application = applications.find(
    app => app.driveId === driveId && app.studentId === currentStudent?.id
  );
  
  // Check if student has already applied
  const hasApplied = Boolean(application);
  
  // Check if student is eligible
  const isEligible = drive && 
    drive.eligibleBranches.includes(currentStudent.branch as any) &&
    currentStudent.percentage >= drive.minimumPercentage;
  
  // Check if drive is still open for applications
  const isOpen = drive && new Date(drive.lastDateToApply) >= new Date();
  
  const handleApply = async () => {
    if (!drive || !isEligible || !isOpen || hasApplied) return;
    
    setIsApplying(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('studentId', currentStudent._id || currentStudent.id);
      formData.append('driveId', drive._id || drive.id);
      
      // If a new resume is uploaded, add it to the form data
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }
      
      // Make API call with FormData
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to submit application');
      }
      
      // Refresh data to ensure we have the latest state
      await refreshData();
      
      toast.success("Application submitted successfully");
      navigate("/student/dashboard");
    } catch (error) {
      console.error("Error applying to drive:", error);
      toast.error(error.message || "Failed to submit application. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };
  
  if (!drive) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow bg-muted flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Drive Not Found</CardTitle>
              <CardDescription>
                The drive you're looking for doesn't exist or has been removed.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate("/student/drives")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Drives
              </Button>
            </CardFooter>
          </Card>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/student/drives")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Drives
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Drive Info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-2xl">{drive.title}</CardTitle>
                    <CardDescription className="text-lg">{drive.companyName}</CardDescription>
                  </div>
                  
                  {!isEligible && (
                    <Badge variant="outline" className="bg-muted">
                      Not Eligible
                    </Badge>
                  )}
                  
                  {hasApplied && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Applied
                    </Badge>
                  )}
                  
                  {!isOpen && (
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                      Applications Closed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Drive Date</p>
                      <p>{format(new Date(drive.driveDate), "MMMM d, yyyy")}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last Date to Apply</p>
                      <p>{format(new Date(drive.lastDateToApply), "MMMM d, yyyy")}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Eligible Branches</p>
                      <p>{drive.eligibleBranches.join(", ")}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Minimum Percentage</p>
                      <p>{drive.minimumPercentage}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">CTC</p>
                      <p>{drive.ctcRange 
                          ? `${drive.ctcRange.min} - ${drive.ctcRange.max} LPA`
                          : `${drive.ctc} LPA`}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                  <p className="whitespace-pre-line">{drive.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  <p className="whitespace-pre-line">{drive.requirements}</p>
                </div>
                
                {drive.applicationLink && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">External Application</h3>
                    <p className="mb-2">This company requires an external application form to be filled.</p>
                    <Button variant="outline" className="flex items-center" asChild>
                      <a href={drive.applicationLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Application Form
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Application Side Panel */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                  <CardDescription>
                    {hasApplied 
                      ? "You have already applied to this drive" 
                      : "Apply for this position"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isEligible ? (
                    <div className="p-4 border rounded-md bg-muted">
                      <h4 className="font-semibold mb-2">Not Eligible</h4>
                      <p className="text-sm text-muted-foreground">
                        {currentStudent.branch !== drive.eligibleBranches.find(b => b === currentStudent.branch) 
                          ? "Your branch is not eligible for this drive." 
                          : "Your percentage is below the minimum requirement."}
                      </p>
                    </div>
                  ) : hasApplied ? (
                    <div>
                      <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-md">
                        <h4 className="font-semibold mb-1">Application Status</h4>
                        <p className="text-sm">
                          {application.status === "rejected" ? (
                            "Your application was not selected for further rounds."
                          ) : application.status === "selected" ? (
                            `Congratulations! You have been selected for Round ${application.currentRound + 1}.`
                          ) : application.currentRound > 0 ? (
                            `You have cleared Round ${application.currentRound}. Waiting for next round details.`
                          ) : (
                            "Your application has been submitted successfully. You will be notified about the next steps."
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Current Status</h4>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge
                            variant={
                              application.status === "selected"
                                ? "default"
                                : application.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                            className={
                              application.status === "selected" 
                                ? "bg-green-500 hover:bg-green-600" 
                                : ""
                            }
                          >
                            {application.status === "rejected"
                              ? "Rejected"
                              : application.status === "selected"
                              ? `Selected - Round ${application.currentRound + 1}`
                              : application.currentRound > 0
                              ? `Cleared Round ${application.currentRound}`
                              : "Application Under Review"}
                          </Badge>
                        </div>

                        <h4 className="font-semibold mb-2">What's Next?</h4>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          {application.status === "rejected" ? (
                            <>
                              <li>Keep applying to other opportunities</li>
                              <li>Work on improving your skills</li>
                              <li>Prepare better for future interviews</li>
                            </>
                          ) : application.status === "selected" ? (
                            <>
                              <li>Check your email for next round details</li>
                              <li>Prepare for the upcoming round</li>
                              <li>Visit the placement cell if you have questions</li>
                            </>
                          ) : (
                            <>
                              <li>Check your email regularly</li>
                              <li>Prepare for potential interviews and tests</li>
                              <li>Visit the placement cell for any questions</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  ) : !isOpen ? (
                    <div className="p-4 border rounded-md bg-muted">
                      <h4 className="font-semibold mb-2">Applications Closed</h4>
                      <p className="text-sm text-muted-foreground">
                        The last date to apply for this drive has passed.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="resume">Upload Resume (Optional)</Label>
                        <div className="mt-1.5">
                          <Label
                            htmlFor="resume"
                            className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
                          >
                            <span className="flex flex-col items-center space-y-2">
                              <FileUp className="w-6 h-6 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {resumeFile ? resumeFile.name : "Click to upload resume (PDF)"}
                              </span>
                            </span>
                            <Input
                              id="resume"
                              type="file"
                              className="hidden"
                              accept=".pdf"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setResumeFile(e.target.files[0]);
                                }
                              }}
                            />
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {currentStudent.resume 
                            ? "Your existing resume will be used if you don't upload a new one." 
                            : "We recommend uploading a resume for better chances."}
                        </p>
                      </div>
                      
                      {drive.applicationLink && (
                        <div className="p-4 border rounded-md bg-muted">
                          <p className="text-sm font-medium">External Application Required</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            This company requires you to fill an external form before submitting your application.
                          </p>
                        </div>
                      )}
                      
                      <Button 
                        className="w-full" 
                        onClick={handleApply}
                        disabled={isApplying || (drive.applicationLink && !resumeFile)}
                      >
                        {isApplying ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DriveDetails;
