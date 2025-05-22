import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // If user's role is not allowed, redirect to appropriate dashboard
    const dashboard = user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard";
    return <Navigate to={dashboard} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 