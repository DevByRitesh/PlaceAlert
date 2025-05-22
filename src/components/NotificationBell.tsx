import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { format } from "date-fns";
import { toast } from "sonner";

const NotificationBell = () => {
  const { user } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, students } = useData();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  
  // Find the current user's student record
  const currentStudent = user?.role === "student"
    ? students.find(s => s.userId === user?.id)
    : null;
  
  // Filter notifications for this user
  const userNotifications = notifications
    .filter(notification => {
      if (!user) return false;
      
      if (notification.recipients === "all") return true;
      
      if (user.role === "student" && currentStudent) {
        if (notification.recipients === "placed" && currentStudent.isPlaced) return true;
        if (notification.recipients === "unplaced" && !currentStudent.isPlaced) return true;
        
        // Check if notification is for specific students
        if (Array.isArray(notification.recipients)) {
          return notification.recipients.includes(currentStudent.id);
        }
      }
      
      return user.role === "admin";
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Count unread notifications
  useEffect(() => {
    if (!user) return;
    
    const unread = userNotifications.filter(
      notification => !notification.read.includes(user.id)
    ).length;
    
    setUnreadCount(unread);
  }, [userNotifications, user]);
  
  // Mark notification as read when clicked
  const handleNotificationClick = async (notificationId: string) => {
    if (!user) return;
    
    await markNotificationAsRead(notificationId);
  };
  
  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!user || isMarkingAllRead) return;
    
    setIsMarkingAllRead(true);
    try {
      await markAllNotificationsAsRead();
      setOpen(false); // Close the popover after marking all as read
    } finally {
      setIsMarkingAllRead(false);
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllRead}
            >
              {isMarkingAllRead ? "Marking..." : "Mark all as read"}
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-auto">
          {userNotifications.length > 0 ? (
            <div className="space-y-2">
              {userNotifications.map(notification => {
                const isRead = notification.read.includes(user?.id || "");
                
                return (
                  <div 
                    key={notification.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      isRead ? 'bg-background' : 'bg-accent/40 hover:bg-accent/50'
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">No notifications</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
