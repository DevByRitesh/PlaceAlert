import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Student, 
  Company, 
  PlacementDrive, 
  Application, 
  Notification, 
  Event 
} from "@/types";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import api from "@/utils/api";
import axios from "axios";

type DataContextType = {
  // Students
  students: Student[];
  addStudent: (student: Omit<Student, "id" | "createdAt">) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  // Companies
  companies: Company[];
  addCompany: (company: Omit<Company, "id" | "createdAt">) => Promise<Company>;
  updateCompany: (company: Company) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  
  // Placement Drives
  drives: PlacementDrive[];
  addDrive: (drive: Omit<PlacementDrive, "id" | "createdAt">) => Promise<void>;
  updateDrive: (drive: PlacementDrive) => Promise<void>;
  deleteDrive: (id: string) => Promise<void>;
  
  // Applications
  applications: Application[];
  addApplication: (application: Omit<Application, "id" | "createdAt">) => Promise<void>;
  updateApplication: (id: string, updates: Partial<Application>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  
  // Events
  events: Event[];
  addEvent: (event: Omit<Event, "id" | "createdAt">) => Promise<void>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  // Loading state
  isLoading: boolean;
  refreshData: (force?: boolean) => Promise<void>;
};

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  
  const { user, isAuthenticated } = useAuth();
  
  // Load data when user authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      // Clear data when user is not authenticated
      setStudents([]);
      setCompanies([]);
      setDrives([]);
      setApplications([]);
      setNotifications([]);
      setEvents([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  
  // Refresh all data with debounce
  const refreshData = async (force = false) => {
    // Only apply debounce if not forced
    if (!force) {
      const now = Date.now();
      if (now - lastRefreshTime < 5000) {
        console.log('Skipping refresh - too soon since last refresh');
        return;
      }
      setLastRefreshTime(now);
    }

    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // For students, first get their profile
      let studentId;
      if (user?.role === 'student') {
        try {
          if (!user.id) {
            console.error("User ID is missing");
            toast.error("Authentication error. Please log in again.");
            setIsLoading(false);
            return;
          }

          console.log("Attempting to fetch student profile for user:", user.id);
          const studentRes = await api.get(`/students/user/${user.id}`);
          
          if (studentRes?.data) {
            // Process student data immediately
            const formattedStudent = formatDates([studentRes.data])[0];
            setStudents([formattedStudent]);
            studentId = formattedStudent.id || formattedStudent._id;
            console.log('Found Student ID:', studentId);
          } else {
            console.error("No student profile data received");
            toast.error("Could not find student profile. Please contact support.");
            setIsLoading(false);
            return;
          }
        } catch (error: any) {
          console.error("Error fetching student profile:", error);
          
          // Check for specific error types
          if (error.response?.status === 401) {
            toast.error("Your session has expired. Please log in again.");
          } else if (error.response?.status === 404) {
            toast.error("Student profile not found. Please complete your profile.");
          } else {
            toast.error(error.response?.data?.message || "Failed to load student profile");
          }
          
          setIsLoading(false);
          return;
        }
      }

      // Fetch data in parallel with error handling for each request
      try {
        // Create an array of promises for data fetching
        const promises = [
          // Only fetch all students if admin
          user?.role === 'admin' 
            ? api.get('/students').catch(err => {
                console.error('Error fetching students:', err);
                return { data: [] };
              })
            : Promise.resolve({ data: [] }),
            
          api.get('/companies').catch(err => {
            console.error('Error fetching companies:', err);
            return { data: [] };
          }),
          
          api.get('/drives').catch(err => {
            console.error('Error fetching drives:', err);
            return { data: [] };
          }),
          
          // For applications, ensure admin gets all applications
          user?.role === 'admin' 
            ? api.get('/applications').catch(err => {
                console.error('Error fetching applications:', err);
                return { data: [] };
              })
            : studentId 
              ? api.get(`/applications/student/${studentId}`).catch(err => {
                  console.error('Error fetching student applications:', err);
                  return { data: [] };
                })
              : Promise.resolve({ data: [] }),
              
          api.get('/notifications').catch(err => {
            console.error('Error fetching notifications:', err);
            return { data: [] };
          }),
          
          api.get('/events').catch(err => {
            console.error('Error fetching events:', err);
            return { data: [] };
          })
        ];
        
        // Wait for all promises to resolve
        const [
          studentsRes, 
          companiesRes, 
          drivesRes, 
          applicationsRes, 
          notificationsRes, 
          eventsRes
        ] = await Promise.all(promises);
        
        // Update state with received data, using empty arrays for failed requests
        if (user?.role === 'admin' && studentsRes?.data) {
          setStudents(formatDates(studentsRes.data));
        }
        
        setCompanies(formatDates(companiesRes?.data || []));
        setDrives(formatDates(drivesRes?.data || []));
        
        // Format and set applications data with additional debugging
        const formattedApplications = formatDates(applicationsRes?.data || []);
        console.log('Received applications raw:', applicationsRes?.data);
        console.log('Received applications formatted:', formattedApplications);
        
        // Make sure to properly update the applications state
        if (formattedApplications && formattedApplications.length > 0) {
          setApplications(formattedApplications);
        } else if (user?.role === 'student' && studentId) {
          console.warn(`No applications found for student ID: ${studentId}`);
        }
        
        setNotifications(formatDates(notificationsRes?.data || []));
        setEvents(formatDates(eventsRes?.data || []));
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Some data failed to load. Please refresh the page.");
      }
    } catch (error) {
      console.error("Error in refreshData:", error);
      toast.error("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to convert date strings to Date objects with error handling
  const formatDates = (data: any[] = []) => {
    if (!Array.isArray(data)) {
      console.error("Invalid data format received:", data);
      return [];
    }

    return data.map(item => {
      try {
        const newItem = { ...item };
        
        // Convert MongoDB _id to id if it exists
        if (newItem._id) {
          newItem.id = newItem._id;
          delete newItem._id;
        }
        
        // Convert all date strings to Date objects
        for (const key in newItem) {
          if (
            typeof newItem[key] === 'string' && 
            (key.includes('Date') || key === 'createdAt' || key === 'updatedAt' || key === 'date')
          ) {
            const date = new Date(newItem[key]);
            if (!isNaN(date.getTime())) {
              newItem[key] = date;
            }
          }
        }

        // Ensure application status is properly formatted as a string
        if (newItem.status !== undefined) {
          // Make sure status is a valid string value
          if (!['applied', 'shortlisted', 'selected', 'rejected', 'placed'].includes(newItem.status)) {
            console.warn(`Invalid application status: ${newItem.status}, defaulting to 'applied'`);
            newItem.status = 'applied';
          }
        }
        
        return newItem;
      } catch (error) {
        console.error("Error formatting item:", error);
        return item;
      }
    });
  };
  
  // Student CRUD operations
  const addStudent = async (student: Omit<Student, "id" | "createdAt">) => {
    try {
      const response = await api.post('/students', student);
      setStudents([...students, formatDates([response.data.student])[0]]);
      toast.success("Student added successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add student");
      throw error;
    }
  };
  
  const updateStudent = async (student: Student) => {
    try {
      // Ensure we're sending the correct data format
      const studentData = {
        ...student,
        id: student.id || student._id, // Handle both id formats
        isPlaced: student.isPlaced || false,
        placedCompanies: student.placedCompanies || [],
        selectedCount: student.selectedCount || 0
      };

      console.log('Updating student with data:', studentData);
      
      const response = await api.put(`/students/${studentData.id}`, studentData);
      
      // Update the students state with the response data
      const updatedStudent = formatDates([response.data.student])[0];
      setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
      
      toast.success("Student updated successfully");
    } catch (error: any) {
      console.error("Error updating student:", error);
      const errorMessage = error.response?.data?.message || "Failed to update student";
      toast.error(errorMessage);
      throw error;
    }
  };
  
  const deleteStudent = async (id: string) => {
    try {
      await api.delete(`/students/${id}`);
      setStudents(students.filter(s => s.id !== id));
      toast.success("Student deleted successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete student");
      throw error;
    }
  };
  
  // Company CRUD operations
  const addCompany = async (company: Omit<Company, "id" | "createdAt">) => {
    try {
      const response = await api.post('/companies', company);
      const newCompany = formatDates([response.data.company])[0];
      setCompanies([...companies, newCompany]);
      toast.success("Company added successfully");
      return newCompany;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add company");
      throw error;
    }
  };
  
  const updateCompany = async (company: Company) => {
    try {
      await api.put(`/companies/${company.id}`, company);
      setCompanies(companies.map(c => c.id === company.id ? company : c));
      toast.success("Company updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update company");
      throw error;
    }
  };
  
  const deleteCompany = async (id: string) => {
    try {
      await api.delete(`/companies/${id}`);
      setCompanies(companies.filter(c => c.id !== id));
      toast.success("Company deleted successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete company");
      throw error;
    }
  };
  
  // Placement Drive CRUD operations
  const addDrive = async (drive: Omit<PlacementDrive, "id" | "createdAt">) => {
    try {
      const response = await api.post('/drives', drive);
      const newDrive = formatDates([response.data.drive])[0];
      setDrives([...drives, newDrive]);
      
      // Also update events if the API returns new event
      if (response.data.event) {
        const newEvent = formatDates([response.data.event])[0];
        setEvents([...events, newEvent]);
      }
      
      toast.success("Placement drive added successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add placement drive");
      throw error;
    }
  };
  
  const updateDrive = async (drive: PlacementDrive) => {
    try {
      await api.put(`/drives/${drive.id}`, drive);
      setDrives(drives.map(d => d.id === drive.id ? drive : d));
      
      // Refresh events to get updated event data
      const eventsRes = await api.get('/events');
      setEvents(formatDates(eventsRes.data));
      
      toast.success("Placement drive updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update placement drive");
      throw error;
    }
  };
  
  const deleteDrive = async (id: string) => {
    try {
      await api.delete(`/drives/${id}`);
      setDrives(drives.filter(d => d.id !== id));
      
      // Refresh events to get updated event data after drive deletion
      const eventsRes = await api.get('/events');
      setEvents(formatDates(eventsRes.data));
      
      toast.success("Placement drive deleted successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete placement drive");
      throw error;
    }
  };
  
  // Application CRUD operations
  const addApplication = async (application: Omit<Application, "id" | "createdAt">) => {
    try {
      // Ensure we're sending the correct data format
      const applicationData = {
        ...application,
        studentId: application.studentId.toString(), // Convert to string if it's an ObjectId
        driveId: application.driveId.toString(), // Convert to string if it's an ObjectId
        status: application.status || "applied",
        isPresent: application.isPresent ?? true,
        currentRound: application.currentRound ?? 0
      };

      const response = await api.post('/applications', applicationData);
      const newApplication = formatDates([response.data.application])[0];
      setApplications([...applications, newApplication]);
      toast.success("Application submitted successfully");
    } catch (error: any) {
      console.error("Application submission error:", error);
      toast.error(error.response?.data?.message || "Failed to submit application");
      throw error;
    }
  };
  
  const updateApplication = async (id: string, updates: Partial<Application>) => {
    try {
      // Validate inputs
      if (!id) {
        throw new Error('Application ID is required');
      }

      if (!updates || Object.keys(updates).length === 0) {
        throw new Error('No updates provided');
      }

      // Log the update attempt
      console.log('Attempting to update application:', { id, updates });

      // If status is being updated, use the status endpoint
      if (updates.status) {
        try {
          console.log('Sending status update with:', updates.status);
          const statusResponse = await api.put(`/applications/${id}/status`, { 
            status: updates.status,
            currentRound: updates.currentRound,
            nextRoundDate: updates.nextRoundDate
          });
          
          if (statusResponse.data) {
            // Update local state with status update
            setApplications(prev => 
              prev.map(app => app.id === id ? { ...app, ...statusResponse.data } : app)
            );
            
            // If there are other updates besides status, handle them separately
            const { status, currentRound, nextRoundDate, ...otherUpdates } = updates;
            if (Object.keys(otherUpdates).length > 0) {
              console.log('Sending additional updates:', otherUpdates);
              const fullResponse = await api.put(`/applications/${id}`, otherUpdates);
              if (fullResponse.data) {
                setApplications(prev => 
                  prev.map(app => app.id === id ? { ...app, ...fullResponse.data } : app)
                );
              }
            }
            
            return statusResponse.data;
          }
        } catch (statusError) {
          console.error('Status update failed:', statusError);
          // If status update fails, try the full update
        }
      }

      // For non-status updates or if status update failed, use the full update endpoint
      console.log('Sending full update:', updates);
      const response = await api.put(`/applications/${id}`, updates);
      
      if (!response.data) {
        throw new Error('No data received from update');
      }

      // Update local state
      setApplications(prev => 
        prev.map(app => app.id === id ? { ...app, ...response.data } : app)
      );

      return response.data;
    } catch (error) {
      console.error('Error updating application:', error);
      throw error; // Re-throw the error for handling by the caller
    }
  };
  
  const deleteApplication = async (id: string) => {
    try {
      await api.delete(`/applications/${id}`);
      setApplications(applications.filter(a => a.id !== id));
      toast.success("Application deleted successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete application");
      throw error;
    }
  };
  
  // Notification operations
  const addNotification = async (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    try {
      const response = await api.post('/notifications', notification);
      const newNotification = formatDates([response.data.notification])[0];
      setNotifications([newNotification, ...notifications]);
      toast.success("Notification sent successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send notification");
      throw error;
    }
  };
  
  const markNotificationAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      await api.put(`/notifications/${id}/read`);
      
      setNotifications(notifications.map(n => {
        if (n.id === id) {
          return {
            ...n,
            read: [...n.read, user.id]
          };
        }
        return n;
      }));
    } catch (error: any) {
      console.error("Failed to mark notification as read:", error);
    }
  };
  
  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    
    try {
      await api.put('/notifications/mark-all-read');
      
      // Update all notifications in state
      setNotifications(notifications.map(n => {
        if (!n.read.includes(user.id)) {
          return {
            ...n,
            read: [...n.read, user.id]
          };
        }
        return n;
      }));
      
      toast.success("All notifications marked as read");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to mark all notifications as read");
      console.error("Failed to mark all notifications as read:", error);
    }
  };
  
  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success("Notification deleted successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete notification");
      throw error;
    }
  };
  
  // Event CRUD operations
  const addEvent = async (event: Omit<Event, "id" | "createdAt">) => {
    try {
      const response = await api.post('/events', event);
      const newEvent = formatDates([response.data.event])[0];
      setEvents([...events, newEvent]);
      toast.success("Event added successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add event");
      throw error;
    }
  };
  
  const updateEvent = async (event: Event) => {
    try {
      await api.put(`/events/${event.id}`, event);
      setEvents(events.map(e => e.id === event.id ? event : e));
      toast.success("Event updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update event");
      throw error;
    }
  };
  
  const deleteEvent = async (id: string) => {
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
      toast.success("Event deleted successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete event");
      throw error;
    }
  };
  
  return (
    <DataContext.Provider
      value={{
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        
        companies,
        addCompany,
        updateCompany,
        deleteCompany,
        
        drives,
        addDrive,
        updateDrive,
        deleteDrive,
        
        applications,
        addApplication,
        updateApplication,
        deleteApplication,
        
        notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        
        isLoading,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
