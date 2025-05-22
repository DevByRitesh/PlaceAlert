import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Search, Eye, ArrowLeft } from "lucide-react";

const AdminApplications = () => {
  const { user, isAuthenticated } = useAuth();
  const { applications, students, drives } = useData();
  const navigate = useNavigate();

  // State for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDrive, setFilterDrive] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  // Get unique company names for filter
  const uniqueDrives = [...new Set(drives.map(drive => drive.id))];

  // Filter and sort applications
  const filteredApplications = applications
    .filter(application => {
      const student = students.find(s => s.id === application.studentId);
      const drive = drives.find(d => d.id === application.driveId);
      
      if (!student || !drive) return false;

      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drive.companyName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === "all" || application.status === filterStatus;
      const matchesDrive = filterDrive === "all" || application.driveId === filterDrive;

      return matchesSearch && matchesStatus && matchesDrive;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return sortOrder === "desc"
          ? b.status.localeCompare(a.status)
          : a.status.localeCompare(b.status);
      }
    });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/dashboard")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">All Applications</h1>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name or roll number..."
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
                  <Label htmlFor="drive">Drive</Label>
                  <Select value={filterDrive} onValueChange={setFilterDrive}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by drive" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Drives</SelectItem>
                      {uniqueDrives.map(driveId => {
                        const drive = drives.find(d => d.id === driveId);
                        return (
                          <SelectItem key={driveId} value={driveId}>
                            {drive?.companyName || "Unknown"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sort">Sort By</Label>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={(value: "date" | "status") => setSortBy(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    >
                      {sortOrder === "desc" ? "↓" : "↑"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Applications ({filteredApplications.length})</CardTitle>
              <CardDescription>
                Manage all placement drive applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Drive</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Round</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => {
                      const student = students.find(s => s.id === application.studentId);
                      const drive = drives.find(d => d.id === application.driveId);
                      
                      if (!student || !drive) return null;

                      return (
                        <TableRow key={application.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.rollNumber}</TableCell>
                          <TableCell>{drive.companyName}</TableCell>
                          <TableCell>{drive.title}</TableCell>
                          <TableCell>
                            <Badge variant={
                              application.status === "selected" 
                                ? "default"
                                : application.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>Round {application.currentRound}</TableCell>
                          <TableCell>
                            {new Date(application.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/admin/drives/applications?driveId=${drive.id}`)}
                              >
                                View Details
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
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminApplications; 