
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotificationManager from "@/components/admin/NotificationManager";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

const AdminNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const { notifications, deleteNotification } = useData();
  const navigate = useNavigate();
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/dashboard")}
              className="mb-4"
            >
              Back to Dashboard
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Notification Management</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Form */}
            <div>
              <NotificationManager />
            </div>
            
            {/* Sent Notifications */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Sent Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((notification) => (
                          <div key={notification.id} className="border rounded-md p-4 relative">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <span className="sr-only">Delete</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </Button>
                            <h3 className="font-medium mb-1">{notification.title}</h3>
                            <p className="text-sm mb-2">{notification.message}</p>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>
                                {typeof notification.recipients === "string" 
                                  ? notification.recipients === "all" 
                                    ? "All students" 
                                    : `${notification.recipients} students only`
                                  : `${notification.recipients.length} selected students`}
                              </span>
                              <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">No notifications sent yet</p>
                  )}
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

export default AdminNotifications;
