import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  CardFooter,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Edit, Download, Mail } from "lucide-react";
import { toast } from "sonner";
import { Student, branches } from "@/types";

const AdminStudents = () => {
  const { user, isAuthenticated } = useAuth();
  const { students, companies, applications, updateStudent, drives } = useData();
  const navigate = useNavigate();
  
  // State for filtering and editing
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // all, placed, unplaced
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isPlaced, setIsPlaced] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);
  
  // Set up student for editing
  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsPlaced(student.isPlaced);
    setSelectedCompanies(student.placedCompanies || []);
    setSelectedCount(student.selectedCount || 0);
    setIsEditDialogOpen(true);
  };
  
  // Get companies where student has applied
  const getStudentAppliedCompanies = (studentId: string) => {
    return applications
      .filter(app => app.studentId === studentId)
      .map(app => {
        const drive = drives.find(d => d.id === app.driveId);
        return drive ? {
          id: drive.id,
          name: drive.companyName,
          role: drive.title
        } : null;
      })
      .filter((company): company is { id: string; name: string; role: string } => company !== null);
  };
  
  // Save student updates
  const handleSaveStudentChanges = () => {
    if (!selectedStudent) return;
    
    const updatedStudent = {
      ...selectedStudent,
      isPlaced: isPlaced,
      placedCompanies: isPlaced ? selectedCompanies : [],
      selectedCount: isPlaced ? selectedCount : 0
    };
    
    updateStudent(updatedStudent);
    setIsEditDialogOpen(false);
    toast.success(`Student ${selectedStudent.name} updated successfully`);
  };
  
  // Filter students based on search query, branch, and placement status
  const filteredStudents = students
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBranch = filterBranch === "all" || student.branch === filterBranch;
      
      const matchesStatus = filterStatus === "all" || 
                          (filterStatus === "placed" && student.isPlaced) ||
                          (filterStatus === "unplaced" && !student.isPlaced);
      
      return matchesSearch && matchesBranch && matchesStatus;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  
  // Get application count for a student
  const getApplicationCount = (studentId: string) => {
    return applications.filter(app => app.studentId === studentId).length;
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Student Management</h1>
          
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Students</CardTitle>
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
                  <Label htmlFor="branch">Branch</Label>
                  <Select value={filterBranch} onValueChange={setFilterBranch}>
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Filter by branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Placement Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="placed">Placed</SelectItem>
                      <SelectItem value="unplaced">Unplaced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle>Students ({filteredStudents.length})</CardTitle>
              <CardDescription>
                Manage student placement status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.branch}</TableCell>
                          <TableCell>{student.percentage}%</TableCell>
                          <TableCell>
                            {student.isPlaced ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                Placed at {student.placedCompanies.join(", ")}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not Placed</Badge>
                            )}
                          </TableCell>
                          <TableCell>{getApplicationCount(student.id)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditStudent(student)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {student.resume && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => window.open(student.resume, '_blank')}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => window.location.href = `mailto:${student.email}`}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No students found matching your filters.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterBranch("all");
                      setFilterStatus("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Edit Student Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Student Status</DialogTitle>
                <DialogDescription>
                  Update placement status for {selectedStudent?.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="placement-status">Placement Status</Label>
                  <Select value={isPlaced ? "placed" : "unplaced"} onValueChange={(value) => setIsPlaced(value === "placed")}>
                    <SelectTrigger id="placement-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placed">Placed</SelectItem>
                      <SelectItem value="unplaced">Not Placed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {isPlaced && selectedStudent && (
                  <div className="space-y-2">
                    <Label htmlFor="companies">Companies Selected</Label>
                    <div className="space-y-2">
                      {getStudentAppliedCompanies(selectedStudent.id).map((company) => (
                        <div key={company.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`company-${company.id}`}
                            aria-label={`Select ${company.name}`}
                            checked={selectedCompanies.includes(company.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCompanies([...selectedCompanies, company.name]);
                              } else {
                                setSelectedCompanies(selectedCompanies.filter(c => c !== company.name));
                              }
                            }}
                          />
                          <Label htmlFor={`company-${company.id}`}>
                            {company.name} ({company.role})
                          </Label>
                        </div>
                      ))}
                      {getStudentAppliedCompanies(selectedStudent.id).length === 0 && (
                        <p className="text-sm text-muted-foreground">No applications found for this student.</p>
                      )}
                    </div>
                    
                    <div className="pt-4">
                      <Label htmlFor="selected-count">Number of Selections</Label>
                      <Input 
                        id="selected-count" 
                        type="number" 
                        min="0"
                        value={selectedCount} 
                        onChange={(e) => setSelectedCount(parseInt(e.target.value) || 0)} 
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        This number represents how many companies have selected this student
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveStudentChanges}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminStudents;
