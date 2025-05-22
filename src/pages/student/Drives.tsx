
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DriveCard from "@/components/DriveCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

const StudentDrives = () => {
  const { user, isAuthenticated } = useAuth();
  const { students, drives, applications } = useData();
  const navigate = useNavigate();
  
  // State for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, upcoming, past, applied
  
  // Redirect if not authenticated or not student
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "student") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);
  
  // For a real application, we'd use the actual logged in student
  // For now, let's use the first student in our sample data
  const currentStudent = students[0];
  
  // Get student applications
  const studentApplications = applications.filter(app => app.studentId === currentStudent?.id);
  
  // Check if student has already applied to a drive
  const hasApplied = (driveId: string) => {
    return studentApplications.some(app => app.driveId === driveId);
  };
  
  // Check if student is eligible for a drive
  const isEligible = (drive: any) => {
    return drive.eligibleBranches.includes(currentStudent.branch as any) &&
           currentStudent.percentage >= drive.minimumPercentage;
  };
  
  // Filter drives based on search query, status, and eligibility
  const filteredDrives = drives
    .filter(drive => {
      const matchesSearch = drive.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           drive.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const today = new Date();
      const driveDate = new Date(drive.driveDate);
      const lastDateToApply = new Date(drive.lastDateToApply);
      
      let matchesStatus = true;
      
      if (filterStatus === "upcoming") {
        matchesStatus = lastDateToApply >= today;
      } else if (filterStatus === "past") {
        matchesStatus = lastDateToApply < today;
      } else if (filterStatus === "applied") {
        matchesStatus = hasApplied(drive.id);
      } else if (filterStatus === "eligible") {
        matchesStatus = isEligible(drive) && lastDateToApply >= today;
      }
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by application deadline (closest first)
      return new Date(a.lastDateToApply).getTime() - new Date(b.lastDateToApply).getTime();
    });
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Placement Drives</h1>
          
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by company or position..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status">Filter</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Filter drives" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Drives</SelectItem>
                      <SelectItem value="upcoming">Upcoming Drives</SelectItem>
                      <SelectItem value="eligible">Eligible for Me</SelectItem>
                      <SelectItem value="applied">Applied Drives</SelectItem>
                      <SelectItem value="past">Past Drives</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Drives List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrives.length > 0 ? (
              filteredDrives.map(drive => (
                <DriveCard
                  key={drive.id}
                  drive={drive}
                  isEligible={isEligible(drive)}
                  hasApplied={hasApplied(drive.id)}
                  onApply={() => navigate(`/student/drives/${drive.id}`)}
                  showDetails={true}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <h3 className="text-lg font-medium mb-2">No drives found</h3>
                <p className="text-muted-foreground mb-6">
                  {filterStatus === "eligible" 
                    ? "There are no upcoming drives matching your eligibility criteria." 
                    : filterStatus === "applied"
                    ? "You haven't applied to any drives yet."
                    : "No drives match your search criteria."}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudentDrives;
