import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import CreateDrive from "./pages/admin/CreateDrive";
import EditDrive from "./pages/admin/EditDrive";
import DriveApplications from "./pages/admin/DriveApplications";
import AdminNotifications from "./pages/admin/Notifications";
import AdminDrives from "./pages/admin/Drives";
import AdminStudents from "./pages/admin/Students";
import StudentProfile from "./pages/admin/StudentProfile";
import AdminCalendar from "./pages/admin/Calendar";
import AdminCompanies from "./pages/admin/Companies";
import AdminReports from "./pages/admin/Reports";
import AdminApplications from "./pages/admin/Applications";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import ResumeChecker from "./pages/student/Resume";
import StudentDrives from "./pages/student/Drives";
import StudentCalendar from "./pages/student/Calendar";
import DriveDetails from "./pages/student/DriveDetails";
import ProfileUpdate from "./pages/student/ProfileUpdate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/applications" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminApplications />
                </ProtectedRoute>
              } />
              <Route path="/admin/drives" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDrives />
                </ProtectedRoute>
              } />
              <Route path="/admin/drives/new" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <CreateDrive />
                </ProtectedRoute>
              } />
              <Route path="/admin/drives/edit/:id" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <EditDrive />
                </ProtectedRoute>
              } />
              <Route path="/admin/drives/applications" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DriveApplications />
                </ProtectedRoute>
              } />
              <Route path="/admin/students" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminStudents />
                </ProtectedRoute>
              } />
              <Route path="/admin/students/:id" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <StudentProfile />
                </ProtectedRoute>
              } />
              <Route path="/admin/calendar" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminCalendar />
                </ProtectedRoute>
              } />
              <Route path="/admin/notifications" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminNotifications />
                </ProtectedRoute>
              } />
              <Route path="/admin/companies" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminCompanies />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminReports />
                </ProtectedRoute>
              } />
              
              {/* Student Routes */}
              <Route path="/student/dashboard" element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/student/resume" element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ResumeChecker />
                </ProtectedRoute>
              } />
              <Route path="/student/drives" element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDrives />
                </ProtectedRoute>
              } />
              <Route path="/student/drives/:driveId" element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <DriveDetails />
                </ProtectedRoute>
              } />
              <Route path="/student/calendar" element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentCalendar />
                </ProtectedRoute>
              } />
              <Route path="/student/profile-update" element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ProfileUpdate />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
