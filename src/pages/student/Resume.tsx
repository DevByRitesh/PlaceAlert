import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ResumeChecker = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Redirect if not authenticated or not student
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "student") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };
  
  const handleAnalyzeResume = async () => {
    if (!resumeText && !resumeFile) {
      toast.error("Please enter resume text or upload a resume file");
      return;
    }
    
    setAnalyzing(true);
    
    try {
      // Simulate ATS scoring process
      // In a real application, this would call an actual ATS analysis service
      const score = Math.floor(Math.random() * 30) + 65; // Random score between 65-95
      const technicalScore = Math.floor(Math.random() * 20) + 70;
      const communicationScore = Math.floor(Math.random() * 20) + 70;
      const experienceScore = Math.floor(Math.random() * 20) + 65;
      const skillsScore = Math.floor(Math.random() * 15) + 75;
      
      // Generate suggestions based on score range
      const suggestionsList = [];
      
      if (score < 70) {
        suggestionsList.push(
          "Add more industry-specific keywords related to your target role",
          "Use bullet points instead of paragraphs for better readability",
          "Include measurable achievements with specific metrics",
          "Remove graphics, tables, and unusual formatting"
        );
      } else if (score < 85) {
        suggestionsList.push(
          "Quantify your accomplishments with numbers and percentages",
          "Ensure your contact information is at the top and easily visible",
          "Match keywords from the job description more closely",
          "Consider removing outdated experience (>10 years)"
        );
      } else {
        suggestionsList.push(
          "Further optimize by customizing resume for each application",
          "Consider adding relevant certifications or courses",
          "Ensure consistent formatting throughout the document"
        );
      }

      // Save scores to database
      const response = await fetch(`${API_BASE_URL}/api/resume-scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          atsScore: score,
          technicalScore,
          communicationScore,
          experienceScore,
          skillsScore,
          overallScore: Math.round((score + technicalScore + communicationScore + experienceScore + skillsScore) / 5),
          feedback: suggestionsList.join('\n')
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save resume scores');
      }
      
      setAtsScore(score);
      setSuggestions(suggestionsList);
      toast.success("Resume analysis complete!");
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate("/student/dashboard")}
              className="mb-4"
            >
              Back to Dashboard
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Resume Checker</h1>
            <p className="text-muted-foreground">
              Optimize your resume for Applicant Tracking Systems (ATS)
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>ATS Resume Checker</CardTitle>
                  <CardDescription>
                    Check how well your resume performs with applicant tracking systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="text">Enter Text</TabsTrigger>
                      <TabsTrigger value="upload">Upload Resume</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="text" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="resume-text">Paste your resume content</Label>
                        <Textarea 
                          id="resume-text"
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          placeholder="Copy and paste your resume content here..."
                          rows={12}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="upload" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="resume-file">Upload your resume (PDF, DOC, DOCX)</Label>
                        <div className="border-2 border-dashed rounded-md p-8 text-center">
                          <Input
                            id="resume-file"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="resume-file"
                            className="flex flex-col items-center justify-center cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-10 w-10 text-muted-foreground mb-2"
                            >
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            
                            {resumeFile ? (
                              <div>
                                <p className="font-medium">{resumeFile.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Click to change file
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="font-medium">Click to upload your resume</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Supports PDF, DOC, DOCX (max 5MB)
                                </p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleAnalyzeResume} 
                    disabled={analyzing || (!resumeText && !resumeFile)}
                    className="w-full"
                  >
                    {analyzing ? "Analyzing..." : "Analyze Resume"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>ATS Compatibility Score</CardTitle>
                  <CardDescription>
                    How well your resume performs against ATS systems
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {atsScore !== null ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-2">
                          <span className="text-3xl font-bold">{atsScore}%</span>
                        </div>
                        <p className={`text-sm ${
                          atsScore >= 85 
                            ? "text-green-600" 
                            : atsScore >= 70 
                              ? "text-amber-600" 
                              : "text-red-600"
                        }`}>
                          {atsScore >= 85 
                            ? "Excellent" 
                            : atsScore >= 70 
                              ? "Good" 
                              : "Needs Improvement"}
                        </p>
                      </div>
                      
                      <Progress value={atsScore} className="h-2" />
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Improvement Suggestions</h3>
                        <ul className="space-y-2">
                          {suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4 text-secondary mt-0.5 shrink-0"
                              >
                                <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                                <path d="M12 8v4" />
                                <path d="M12 16h.01" />
                              </svg>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">
                        Submit your resume for ATS compatibility analysis
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Resume Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">ATS Optimization</h3>
                    <ul className="text-sm space-y-1 list-disc pl-4">
                      <li>Use standard section headings</li>
                      <li>Include keywords from job descriptions</li>
                      <li>Avoid tables, images, and fancy formatting</li>
                      <li>Use standard, readable fonts</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Content Tips</h3>
                    <ul className="text-sm space-y-1 list-disc pl-4">
                      <li>Quantify achievements with metrics</li>
                      <li>Focus on relevant experience</li>
                      <li>Be concise and specific</li>
                      <li>Proofread for grammar and spelling</li>
                    </ul>
                  </div>
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

export default ResumeChecker;
