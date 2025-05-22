
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { branches } from "@/types";

const AdminReports = () => {
  const { user, isAuthenticated } = useAuth();
  const { students, drives, applications } = useData();
  const navigate = useNavigate();
  
  // State for filter
  const [year, setYear] = useState(new Date().getFullYear().toString());
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);
  
  // Calculate statistics
  const totalStudents = students.length;
  const placedStudents = students.filter(student => student.isPlaced).length;
  const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;
  
  // Chart colors
  const COLORS = ["#0A2463", "#3E92CC", "#4CAF50", "#F44336", "#FFC107"];
  
  // Generate placement data by branch
  const branchData = branches.map(branch => {
    const studentsInBranch = students.filter(student => student.branch === branch);
    const placedStudentsInBranch = studentsInBranch.filter(student => student.isPlaced);
    
    return {
      name: branch,
      totalStudents: studentsInBranch.length,
      placedStudents: placedStudentsInBranch.length,
      placementRate: studentsInBranch.length > 0 
        ? Math.round((placedStudentsInBranch.length / studentsInBranch.length) * 100)
        : 0
    };
  }).filter(branch => branch.totalStudents > 0);
  
  // Generate application status data
  const applicationStatusData = [
    { 
      name: "Applied", 
      value: applications.filter(app => app.status === "applied").length 
    },
    { 
      name: "Shortlisted", 
      value: applications.filter(app => app.status === "shortlisted").length 
    },
    { 
      name: "Selected", 
      value: applications.filter(app => app.status === "selected").length 
    },
    { 
      name: "Rejected", 
      value: applications.filter(app => app.status === "rejected").length 
    }
  ];
  
  // Generate monthly application data
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  const monthlyApplicationData = months.map((month, index) => {
    const applicationsInMonth = applications.filter(app => {
      const appDate = new Date(app.createdAt);
      return appDate.getMonth() === index && appDate.getFullYear().toString() === year;
    });
    
    return {
      name: month,
      applications: applicationsInMonth.length
    };
  });
  
  // Available years for filter (start from current year and go back 5 years)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Placement Analytics</h1>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Year:</span>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-muted-foreground text-sm">Total Students</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{placedStudents}</div>
                <p className="text-muted-foreground text-sm">Placed Students</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{placementRate}%</div>
                <p className="text-muted-foreground text-sm">Placement Rate</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{drives.length}</div>
                <p className="text-muted-foreground text-sm">Total Drives</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Branch-wise Placement</CardTitle>
                <CardDescription>Placement rate across different branches</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={branchData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="placedStudents" name="Placed" fill="#0A2463" />
                    <Bar dataKey="totalStudents" name="Total Students" fill="#3E92CC" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Distribution of application statuses</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={applicationStatusData.filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {applicationStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Monthly Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Applications ({year})</CardTitle>
              <CardDescription>Application trends throughout the year</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyApplicationData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="applications" 
                    name="Applications" 
                    stroke="#0A2463" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminReports;
