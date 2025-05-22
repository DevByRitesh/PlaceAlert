import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search, Eye, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Application } from "@/types";
import { updateApplicationRound } from "@/utils/api";
import api from "@/utils/api";

// Create a more flexible Application type for state management
interface ApplicationState extends Omit<Application, 'currentRound' | 'nextRoundDate'> {
  currentRound?: number | null | undefined;
  nextRoundDate?: Date | null | undefined;
}

// For TypeScript safety when updating application state
type ApplicationUpdate = {
  status?: "applied" | "shortlisted" | "rejected" | "selected" | "placed";
  isPresent?: boolean;
  currentRound?: number | null | undefined;
  nextRoundDate?: Date | null | undefined;
};

const DriveApplications = () => {
  const [searchParams] = useSearchParams();
  const driveId = searchParams.get("driveId");
  const { user, isAuthenticated } = useAuth();
  const { drives, applications, students, updateApplication, isLoading, addNotification, refreshData } = useData();
  const navigate = useNavigate();
  
  // State for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRound, setFilterRound] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationState | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Local state for applications to allow direct updates
  const [localApplications, setLocalApplications] = useState<Application[]>([]);
  
  // Get drive details
  const drive = drives.find(d => d.id === driveId);
  
  // Sync applications from context to local state
  useEffect(() => {
    setLocalApplications(applications);
  }, [applications]);
  
  // Handle authentication and role check
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);
  
  // Set data loaded state when drives are loaded
  useEffect(() => {
    if (!isLoading && drives.length > 0) {
      setIsDataLoaded(true);
    }
  }, [isLoading, drives]);
    
  // Handle drive not found after data is loaded
  useEffect(() => {
    if (isDataLoaded && !drive && driveId) {
      toast.error("Drive not found");
      navigate("/admin/drives");
    }
  }, [drive, driveId, isDataLoaded, navigate]);
  
  // Filter applications
  const filteredApplications = localApplications
    .filter(app => app.driveId === driveId)
    .filter(app => {
      const student = students.find(s => s.id === app.studentId);
      if (!student) return false;
      
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()); // Using email instead of rollNumber
      
      const matchesStatus = filterStatus === "all" || app.status === filterStatus;
      const matchesRound = filterRound === "all" || 
                           (app.currentRound !== undefined && 
                            app.currentRound.toString() === filterRound);
      
      return matchesSearch && matchesStatus && matchesRound;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Get maximum round number
  const maxRound = Math.max(
    ...localApplications
      .filter(app => app.driveId === driveId)
      .map(app => app.currentRound ?? 0), // Add null/undefined handling
    1
  );

  // Handle application update
  const handleUpdateApplication = async (application: ApplicationState, updates: ApplicationUpdate) => {
    try {
      console.log('Updating application with:', updates);
      
      // First update status if provided
      if (updates.status) {
        console.log('Updating status:', updates.status);
        try {
          const student = students.find(s => s.id === application.studentId);
          
          if (student) {
            let updateData: Partial<Application> = { status: updates.status };
            
            // Only increment shortlisted count when first selected for round 1
            if (updates.status === 'selected' && 
                updates.currentRound === 1 && 
                application.status !== 'selected') {
              // Get current shortlisted count
              const currentShortlistedCount = student.shortlistedCount || 0;
              updateData.shortlistedCount = currentShortlistedCount + 1;
              console.log('Incrementing shortlisted count to:', currentShortlistedCount + 1);
            }
            // If status is being changed to placed, increment the selection count
            else if (updates.status === 'placed') {
              updateData.selectedCount = (student.selectedCount || 0) + 1;
            }
            
            await updateApplication(application.id, updateData);
            console.log('Status update successful');
            
            // Update local state immediately
            setLocalApplications(prevApplications => 
              prevApplications.map(a => 
                a.id === application.id 
                  ? { ...a, status: updates.status! } 
                  : a
              )
            );
          }
        } catch (error) {
          console.error('Status update failed, continuing with other updates');
          // Don't throw here, try to continue with other updates
        }
      }
      
      // Then update round separately if provided
      if (updates.currentRound !== undefined && updates.currentRound !== null) {
        const roundNumber = parseInt(updates.currentRound.toString(), 10);
        console.log('Updating round separately:', roundNumber);
        
        try {
          const student = students.find(s => s.id === application.studentId);
          
          // When updating rounds, maintain the current status and counts
          const roundUpdateData: Partial<Application> = { 
            currentRound: roundNumber,
            nextRoundDate: updates.nextRoundDate,
            status: application.status // Maintain current status
          };
          
          // Maintain the shortlisted count when updating rounds
          if (student && student.shortlistedCount !== undefined) {
            roundUpdateData.shortlistedCount = student.shortlistedCount;
            console.log('Maintaining shortlisted count at:', student.shortlistedCount);
          }
          
          await updateApplication(application.id, roundUpdateData);
          console.log('Round update successful');
          
          // Update local state immediately
          setLocalApplications(prevApplications => 
            prevApplications.map(a => 
              a.id === application.id 
                ? { ...a, currentRound: roundNumber, nextRoundDate: updates.nextRoundDate } 
                : a
            )
          );
        } catch (error) {
          console.error('Round update failed, trying direct method:', error);
          
          // Try direct round update as fallback
          try {
            await updateApplicationRound(application.id, roundNumber);
            
            // Update local state to reflect this change
            setLocalApplications(prevApplications => 
              prevApplications.map(a => 
                a.id === application.id 
                  ? { ...a, currentRound: roundNumber } 
                  : a
              )
            );
            
            console.log('Direct round update successful');
          } catch (directError) {
            console.error('Direct round update also failed:', directError);
            toast.error("Failed to update round even with direct method. Please try again later.");
          }
        }
      }
      
      // Get student and drive details for notification
      const student = students.find(s => s.id === application.studentId);
      const drive = drives.find(d => d.id === application.driveId);

      if (student && drive && updates.status) {
        // Create notification message based on status
        const title = `Application Status Update - ${drive.companyName}`;
        let message = "";

        switch (updates.status) {
          case "selected":
            message = `Congratulations! You have been selected for Round ${updates.currentRound || application.currentRound || 0} of ${drive.companyName}'s placement drive.`;
            break;
          case "shortlisted":
            message = `You have been shortlisted for ${drive.companyName}'s placement drive.`;
            break;
          case "rejected":
            message = `We regret to inform you that your application for ${drive.companyName}'s placement drive has been rejected.`;
            break;
          case "placed":
            message = `Congratulations! You have been placed at ${drive.companyName}!`;
            break;
          default:
            message = `Your application status for ${drive.companyName}'s placement drive has been updated to ${updates.status}.`;
        }

        // Send notification to the student
        await addNotification({
          title,
          message,
          recipients: [student.id]
        });
      }
      
      // Add a success message to confirm the update
      toast.success("Application status updated successfully");
      
      // Refresh data to ensure UI is in sync
      await refreshData();
      
      setIsUpdateDialogOpen(false);
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application");
    }
  };

  // Open update dialog
  const openUpdateDialog = (application: Application) => {
    setSelectedApplication(application as ApplicationState);
    setIsUpdateDialogOpen(true);
  };
  
  // Get attendance badge variant
  const getAttendanceBadgeVariant = (isPresent: boolean) => {
    return isPresent ? "secondary" : "destructive"; // Changed from "success" to "secondary"
  };

  // Handle attendance update
  const handleAttendanceUpdate = async (application: Application, isPresent: boolean) => {
    try {
      // Update local state immediately for instant UI feedback
      setLocalApplications(prevApplications => 
        prevApplications.map(a => 
          a.id === application.id 
            ? { ...a, isPresent } 
            : a
        )
      );

      // If student is marked absent, update their status to rejected
      if (!isPresent) {
        const student = students.find(s => s.id === application.studentId);
        const drive = drives.find(d => d.id === application.driveId);

        if (student && drive) {
          // Create notification for absent student
          await addNotification({
            title: `Attendance Update - ${drive.companyName}`,
            message: `You were marked absent for ${drive.companyName}'s placement drive. Your application has been rejected.`,
            recipients: [student.id]
          });

          // Update application status to rejected along with attendance
          const updatedApp = await updateApplication(application.id, { 
            status: 'rejected',
            isPresent: false
          });

          // Update local state with the response
          if (updatedApp) {
            setLocalApplications(prevApplications => 
              prevApplications.map(a => 
                a.id === application.id 
                  ? { ...a, ...updatedApp } 
                  : a
              )
            );
          }
        }
      } else {
        // Just update attendance if marking as present
        const updatedApp = await updateApplication(application.id, { isPresent: true });
        
        // Update local state with the response
        if (updatedApp) {
          setLocalApplications(prevApplications => 
            prevApplications.map(a => 
              a.id === application.id 
                ? { ...a, ...updatedApp } 
                : a
            )
          );
        }
      }

      // Force refresh data to ensure everything is in sync
      await refreshData(true);

      toast.success(`Attendance ${isPresent ? 'marked' : 'updated'} successfully`);
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance');
      
      // Revert local state on error
      setLocalApplications(prevApplications => 
        prevApplications.map(a => 
          a.id === application.id 
            ? { ...a, isPresent: !isPresent } 
            : a
        )
      );
    }
  };
  
  // Show loading state while data is being fetched
  if (isLoading || !isDataLoaded) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">Loading drive applications...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Show not found state
  if (!drive) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-muted">
          <div className="container mx-auto px-4 py-8">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/drives")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Drives
            </Button>
            <Card>
              <CardHeader>
                <CardTitle>Drive Not Found</CardTitle>
                <CardDescription>
                  The drive you're looking for doesn't exist or has been removed.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
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
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/drives")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Drives
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Applications for {drive.companyName}</h1>
            <p className="text-muted-foreground mt-2">{drive.title}</p>
          </div>
          
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name or email..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="selected">Selected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="round">Round</Label>
                  <Select value={filterRound} onValueChange={setFilterRound}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by round" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rounds</SelectItem>
                      {Array.from({ length: maxRound }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          Round {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Applications ({filteredApplications.length})</CardTitle>
              <CardDescription>
                Manage student applications for this drive
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Current Round</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map(application => {
                        const student = students.find(s => s.id === application.studentId);
                        if (!student) return null;
                        
                        return (
                          <TableRow key={application.id}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.branch}</TableCell>
                            <TableCell>Round {application.currentRound ?? 0}</TableCell>
                            <TableCell>
                              <Badge variant={application.status === "selected" ? "default" : "secondary"}>
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                              <Switch
                                checked={application.isPresent}
                                onCheckedChange={(checked) => 
                                    handleAttendanceUpdate(application, checked)
                                }
                              />
                                <Badge variant={getAttendanceBadgeVariant(application.isPresent)}>
                                  {application.isPresent ? "Present" : "Absent"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openUpdateDialog(application)}
                                  disabled={!application.isPresent}
                                >
                                  Update Status
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => navigate(`/admin/students/${student.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No applications found matching your filters.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("all");
                      setFilterRound("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Update Application Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              Update the status and round for this application
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selectedApplication.status}
                  onValueChange={(value: "applied" | "shortlisted" | "rejected" | "selected" | "placed") => {
                    if (selectedApplication) {
                      const updated = {
                        ...selectedApplication,
                        status: value,
                        currentRound: value === "selected" ? selectedApplication.currentRound : 0
                      };
                      setSelectedApplication(updated as ApplicationState);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="selected">Selected</SelectItem>
                    <SelectItem value="placed">Placed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedApplication.status === "shortlisted" && (
                <div className="space-y-2">
                  <Label>Next Round Date</Label>
                  <Input
                    type="datetime-local"
                    value={selectedApplication.nextRoundDate ? new Date(selectedApplication.nextRoundDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => {
                      if (selectedApplication) {
                        const updated = {
                          ...selectedApplication,
                          nextRoundDate: e.target.value ? new Date(e.target.value) : undefined
                        };
                        setSelectedApplication(updated as ApplicationState);
                      }
                    }}
                  />
                </div>
              )}

              {selectedApplication.status === "selected" && (
                <div className="space-y-2">
                  <Label>Current Round</Label>
                  <Select
                    value={(selectedApplication.currentRound ?? 0).toString()}
                    onValueChange={(value) => {
                      if (selectedApplication) {
                        const updated = {
                          ...selectedApplication,
                          currentRound: parseInt(value),
                          status: 'selected' // Maintain selected status when changing rounds
                        };
                        setSelectedApplication(updated as ApplicationState);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: maxRound + 2 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          Round {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedApplication) {
                  // Make sure currentRound is a number
                  const roundValue = selectedApplication.currentRound !== undefined && 
                                     selectedApplication.currentRound !== null
                    ? parseInt(selectedApplication.currentRound.toString(), 10)
                    : null;
                    
                  console.log('Preparing update with round value:', roundValue);
                  
                  handleUpdateApplication(
                    selectedApplication, 
                    {
                      status: selectedApplication.status,
                      currentRound: roundValue,
                      nextRoundDate: selectedApplication.nextRoundDate || null
                    }
                  );
                }
              }}
              disabled={!selectedApplication || !selectedApplication.isPresent}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default DriveApplications; 