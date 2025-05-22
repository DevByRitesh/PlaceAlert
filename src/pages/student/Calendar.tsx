
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

const StudentCalendar = () => {
  const { user, isAuthenticated } = useAuth();
  const { students, events, drives, applications } = useData();
  const navigate = useNavigate();
  
  // State for calendar
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Redirect if not authenticated or not student
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "student") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);
  
  // For a real application, we'd use the actual logged in student
  // For now, let's use the first student in our sample data
  const currentStudent = students[0];
  
  // Get student applications
  const studentApplications = applications.filter(app => app.studentId === currentStudent?.id);
  
  // Filter events relevant to the student
  // Include: global events, drive events for applied drives, and related dates for applied drives
  const relevantEvents = [
    // All regular events
    ...events.filter(event => !event.driveId),
    
    // Events for drives student has applied to
    ...events.filter(event => {
      if (!event.driveId) return false;
      return studentApplications.some(app => app.driveId === event.driveId);
    }),
    
    // Create pseudo-events for important drive dates
    ...drives
      .filter(drive => studentApplications.some(app => app.driveId === drive.id))
      .flatMap(drive => [
        {
          id: `${drive.id}-lastdate`,
          title: `Last Date to Apply: ${drive.companyName}`,
          description: `Last date to apply for ${drive.title} at ${drive.companyName}`,
          date: new Date(drive.lastDateToApply),
          driveId: drive.id,
          createdAt: new Date()
        },
        {
          id: `${drive.id}-drivedate`,
          title: `Drive Day: ${drive.companyName}`,
          description: `Placement drive for ${drive.title} at ${drive.companyName}`,
          date: new Date(drive.driveDate),
          driveId: drive.id,
          createdAt: new Date()
        }
      ])
  ];
  
  // Get events for selected date
  const eventsForSelectedDate = relevantEvents
    .filter(event => {
      if (!selectedDate) return false;
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === selectedDate.getFullYear() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getDate() === selectedDate.getDate()
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Get dates with events for highlighting in calendar
  const datesWithEvents = relevantEvents.map(event => new Date(event.date));
  
  // Find drive details for an event
  const getDriveForEvent = (event: any) => {
    if (!event.driveId) return null;
    return drives.find(drive => drive.id === event.driveId);
  };
  
  // Get upcoming events (next 7 days)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingEvents = relevantEvents
    .filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Placement Calendar</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar View */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>View your upcoming placement events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border shadow-sm"
                    modifiers={{
                      hasEvent: (date) => 
                        datesWithEvents.some(eventDate => 
                          eventDate.getFullYear() === date.getFullYear() && 
                          eventDate.getMonth() === date.getMonth() && 
                          eventDate.getDate() === date.getDate()
                        )
                    }}
                    modifiersClassNames={{
                      hasEvent: "bg-primary/10 font-bold text-primary"
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Events for Selected Date */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Events for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Today"}
                </CardTitle>
                <CardDescription>
                  {eventsForSelectedDate.length} 
                  {eventsForSelectedDate.length === 1 ? " event" : " events"} scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsForSelectedDate.length > 0 ? (
                  <div className="space-y-4">
                    {eventsForSelectedDate.map((event) => {
                      const relatedDrive = getDriveForEvent(event);
                      
                      return (
                        <div 
                          key={event.id} 
                          className="p-4 border rounded-lg hover:bg-accent/20 transition-colors"
                        >
                          <h3 className="font-medium">{event.title}</h3>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </p>
                          )}
                          
                          {relatedDrive && (
                            <div className="mt-2">
                              <Button 
                                variant="link" 
                                className="p-0 h-auto text-sm" 
                                onClick={() => navigate(`/student/drives/${relatedDrive.id}`)}
                              >
                                View drive details
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No events scheduled for this date.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate("/student/drives")}
                    >
                      Browse Drives
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Upcoming Events Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => {
                    const eventDate = new Date(event.date);
                    const isToday = eventDate.toDateString() === today.toDateString();
                    const relatedDrive = getDriveForEvent(event);
                    
                    return (
                      <div 
                        key={event.id} 
                        className="p-4 border rounded-lg hover:bg-accent/20 transition-colors"
                      >
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <h3 className="font-medium">{event.title}</h3>
                          <Badge className={isToday ? "bg-primary" : ""}>
                            {isToday ? "Today" : format(eventDate, "E, MMM d")}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        )}
                        
                        {relatedDrive && (
                          <div className="mt-2">
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-sm" 
                              onClick={() => navigate(`/student/drives/${relatedDrive.id}`)}
                            >
                              View drive details
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No upcoming events in the next 7 days.</p>
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

export default StudentCalendar;
