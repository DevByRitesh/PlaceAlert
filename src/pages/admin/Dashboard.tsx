import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import NotificationBell from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Bell, Plus } from "lucide-react";

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { students, drives, applications } = useData();
  const navigate = useNavigate();
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);
  
  // Calculate statistics
  const totalStudents = students.length;
  const totalDrives = drives.length;
  const totalApplications = applications.length;
  const placedStudents = students.filter(student => student.isPlaced).length;
  const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;
  
  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    // Calculate average rounds per application
    const roundsData = applications.reduce((acc, app) => {
      acc.totalRounds += app.currentRound || 0;
      acc.totalApps += 1;
      return acc;
    }, { totalRounds: 0, totalApps: 0 });
    
    const avgRounds = roundsData.totalApps > 0 
      ? (roundsData.totalRounds / roundsData.totalApps).toFixed(1)
      : 0;

    // Calculate success rate (selected / total applications)
    const selectedApps = applications.filter(app => app.status === 'selected').length;
    const successRate = totalApplications > 0 
      ? Math.round((selectedApps / totalApplications) * 100)
      : 0;

    // Calculate average applications per student
    const avgApplications = totalStudents > 0 
      ? (totalApplications / totalStudents).toFixed(1)
      : 0;

    return {
      avgRounds,
      successRate,
      avgApplications
    };
  }, [applications, totalStudents, totalApplications]);
  
  // Calculate monthly drives data with success rate
  const monthlyDrives = useMemo(() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    // Initialize counts for each month
    const monthlyCounts = months.map(name => ({ 
      name, 
      drives: 0,
      applications: 0,
      selected: 0
    }));
    
    // Count drives and applications for each month
    drives.forEach(drive => {
      const driveDate = new Date(drive.driveDate);
      const monthIndex = driveDate.getMonth();
      monthlyCounts[monthIndex].drives += 1;
      
      // Count applications and selections for this drive
      const driveApplications = applications.filter(app => app.driveId === drive.id);
      monthlyCounts[monthIndex].applications += driveApplications.length;
      monthlyCounts[monthIndex].selected += driveApplications.filter(app => app.status === 'selected').length;
    });
    
    return monthlyCounts;
  }, [drives, applications]);
  
  // Calculate branch-wise placement data with more metrics
  const branchPlacementData = useMemo(() => {
    // Get unique branches
    const branches = [...new Set(students.map(student => student.branch))];
    
    // Calculate placement stats for each branch
    return branches.map(branch => {
      const branchStudents = students.filter(student => student.branch === branch);
      const total = branchStudents.length;
      const placed = branchStudents.filter(student => student.isPlaced).length;
      
      // Calculate average applications per student in this branch
      const branchApplications = applications.filter(app => 
        branchStudents.some(student => student.id === app.studentId)
      );
      const avgApplications = total > 0 ? (branchApplications.length / total).toFixed(1) : 0;
      
      // Calculate success rate for this branch
      const selectedApps = branchApplications.filter(app => app.status === 'selected').length;
      const successRate = branchApplications.length > 0 
        ? Math.round((selectedApps / branchApplications.length) * 100)
        : 0;
      
      return {
        name: branch,
        placed,
        total,
        avgApplications: parseFloat(avgApplications),
        successRate
      };
    });
  }, [students, applications]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center space-x-2">
              <NotificationBell />
              <Button onClick={() => navigate("/admin/notifications")} variant="outline" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Manage Notifications</span>
              </Button>
              <Button onClick={() => navigate("/admin/drives/new")} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Create Drive</span>
              </Button>
            </div>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              title="Total Students" 
              value={totalStudents} 
              description="Registered students"
            />
            <StatCard 
              title="Placement Drives" 
              value={totalDrives} 
              description="Active and upcoming"
            />
            <StatCard 
              title="Total Applications" 
              value={totalApplications} 
              description="Across all drives"
            />
            <StatCard 
              title="Placement Rate" 
              value={`${placementRate}%`} 
              description={`${placedStudents} out of ${totalStudents} placed`}
            />
            <StatCard 
              title="Success Rate" 
              value={`${performanceMetrics.successRate}%`} 
              description="Selected applications rate"
            />
            <StatCard 
              title="Avg. Applications" 
              value={performanceMetrics.avgApplications} 
              description="Per student"
            />
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Drives, applications, and selections</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyDrives}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="drives" 
                      name="Drives" 
                      stroke="#0A2463" 
                      fill="#0A2463" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="applications" 
                      name="Applications" 
                      stroke="#3E92CC" 
                      fill="#3E92CC" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="selected" 
                      name="Selected" 
                      stroke="#4CAF50" 
                      fill="#4CAF50" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Branch Performance</CardTitle>
                <CardDescription>Placement and application metrics by branch</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={branchPlacementData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#0A2463" />
                    <YAxis yAxisId="right" orientation="right" stroke="#3E92CC" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="successRate" name="Success Rate %" fill="#0A2463" />
                    <Bar yAxisId="right" dataKey="avgApplications" name="Avg. Applications" fill="#3E92CC" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Recent Applications</span>
                  <Button variant="outline" size="sm" onClick={() => navigate("/admin/applications")}>
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Student</th>
                        <th className="px-4 py-2 text-left">Company</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Round</th>
                        <th className="px-4 py-2 text-left">Applied On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((application) => {
                          const student = students.find(s => s.id === application.studentId);
                          const drive = drives.find(d => d.id === application.driveId);
                          
                          return (
                            <tr key={application.id} className="border-b last:border-0">
                              <td className="px-4 py-3 text-sm">{student?.name || "Unknown"}</td>
                              <td className="px-4 py-3 text-sm">{drive?.companyName || "Unknown"}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  application.status === "selected" 
                                    ? "bg-green-100 text-green-800" 
                                    : application.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : application.status === "shortlisted"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">Round {application.currentRound || 0}</td>
                              <td className="px-4 py-3 text-sm">
                                {new Date(application.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Average Rounds per Application</h4>
                  <div className="text-2xl font-bold">{performanceMetrics.avgRounds}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Success Rate</h4>
                  <div className="text-2xl font-bold">{performanceMetrics.successRate}%</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Average Applications per Student</h4>
                  <div className="text-2xl font-bold">{performanceMetrics.avgApplications}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="p-4 h-auto flex flex-col items-center justify-center gap-2 border-dashed"
              onClick={() => navigate("/admin/students")}
            >
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <span className="font-medium">Manage Students</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="p-4 h-auto flex flex-col items-center justify-center gap-2 border-dashed"
              onClick={() => navigate("/admin/drives")}
            >
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                  <line x1="16" x2="16" y1="2" y2="6"></line>
                  <line x1="8" x2="8" y1="2" y2="6"></line>
                  <line x1="3" x2="21" y1="10" y2="10"></line>
                </svg>
              </div>
              <span className="font-medium">Manage Drives</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="p-4 h-auto flex flex-col items-center justify-center gap-2 border-dashed"
              onClick={() => navigate("/admin/companies")}
            >
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <span className="font-medium">Manage Companies</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="p-4 h-auto flex flex-col items-center justify-center gap-2 border-dashed"
              onClick={() => navigate("/admin/reports")}
            >
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8v13H3V8"></path>
                  <path d="M1 3h22v5H1z"></path>
                  <path d="M10 12h4"></path>
                </svg>
              </div>
              <span className="font-medium">Reports & Analytics</span>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
