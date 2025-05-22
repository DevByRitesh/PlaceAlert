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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { branches } from "@/types";
import { Plus, Search, Edit, Trash, Eye } from "lucide-react";
import { toast } from "sonner";

const AdminDrives = () => {
  const { user, isAuthenticated } = useAuth();
  const { drives, applications, deleteDrive } = useData();
  const navigate = useNavigate();
  
  // State for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, upcoming, ongoing, past
  const [filterBranch, setFilterBranch] = useState("all");
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);
  
  // Filter drives based on search query, status, and branch
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
      } else if (filterStatus === "ongoing") {
        matchesStatus = lastDateToApply < today && driveDate >= today;
      } else if (filterStatus === "past") {
        matchesStatus = driveDate < today;
      }
      
      const matchesBranch = filterBranch === "all" || 
                          drive.eligibleBranches.includes(filterBranch as any);
      
      return matchesSearch && matchesStatus && matchesBranch;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  // Count applications for each drive
  const getApplicationCount = (driveId: string) => {
    return applications.filter(app => app.driveId === driveId).length;
  };
  
  // Handle drive deletion
  const handleDeleteDrive = (id: string) => {
    const applicationCount = getApplicationCount(id);
    if (applicationCount > 0) {
      toast.error("Cannot delete drive with existing applications");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this drive? This action cannot be undone.")) {
      deleteDrive(id);
      toast.success("Drive deleted successfully");
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Manage Placement Drives</h1>
            <Button onClick={() => navigate("/admin/drives/new")} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Drive</span>
            </Button>
          </div>
          
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Drives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Drives</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="past">Past</SelectItem>
                    </SelectContent>
                  </Select>
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
              </div>
            </CardContent>
          </Card>
          
          {/* Drives list */}
          <Card>
            <CardHeader>
              <CardTitle>Placement Drives ({filteredDrives.length})</CardTitle>
              <CardDescription>
                Manage all placement drives from here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDrives.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Drive Date</TableHead>
                        <TableHead>Last Date to Apply</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDrives.map((drive) => {
                        const applicationCount = getApplicationCount(drive.id);
                        const isUpcoming = new Date(drive.lastDateToApply) >= new Date();
                        const isPast = new Date(drive.driveDate) < new Date();
                        
                        return (
                          <TableRow key={drive.id}>
                            <TableCell className="font-medium">{drive.companyName}</TableCell>
                            <TableCell>{drive.title}</TableCell>
                            <TableCell>{format(new Date(drive.driveDate), "dd MMM yyyy")}</TableCell>
                            <TableCell>
                              {format(new Date(drive.lastDateToApply), "dd MMM yyyy")}
                              {isUpcoming && (
                                <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                                  Open
                                </Badge>
                              )}
                              {isPast && (
                                <Badge className="ml-2 bg-gray-100 text-gray-800 hover:bg-gray-100">
                                  Closed
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{applicationCount}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => navigate(`/admin/drives/applications?driveId=${drive.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => navigate(`/admin/drives/edit/${drive.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDeleteDrive(drive.id)}
                                >
                                  <Trash className="h-4 w-4" />
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
                  <p className="text-muted-foreground">No drives found matching your filters.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("all");
                      setFilterBranch("all");
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
      
      <Footer />
    </div>
  );
};

export default AdminDrives;
