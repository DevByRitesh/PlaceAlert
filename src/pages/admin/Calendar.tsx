
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Calendar as CalendarIcon, Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Event } from "@/types";

const AdminCalendar = () => {
  const { user, isAuthenticated } = useAuth();
  const { events, addEvent, updateEvent, deleteEvent, drives } = useData();
  const navigate = useNavigate();
  
  // State for calendar and form
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isViewEventsDialogOpen, setIsViewEventsDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventDate, setNewEventDate] = useState<Date | undefined>(new Date());
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);
  
  // Get events for selected date
  const eventsForSelectedDate = events
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
  
  // Handle event actions
  const handleAddEvent = () => {
    if (!newEventTitle || !newEventDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (editingEvent) {
      updateEvent({
        ...editingEvent,
        title: newEventTitle,
        description: newEventDescription,
        date: newEventDate
      });
      toast.success("Event updated successfully");
    } else {
      addEvent({
        title: newEventTitle,
        description: newEventDescription,
        date: newEventDate
      });
      toast.success("Event added successfully");
    }
    
    resetForm();
    setIsAddEventDialogOpen(false);
  };
  
  const handleDeleteEvent = (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteEvent(id);
      toast.success("Event deleted successfully");
    }
  };
  
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setNewEventTitle(event.title);
    setNewEventDescription(event.description || "");
    setNewEventDate(new Date(event.date));
    setIsAddEventDialogOpen(true);
  };
  
  const resetForm = () => {
    setNewEventTitle("");
    setNewEventDescription("");
    setNewEventDate(new Date());
    setEditingEvent(null);
  };
  
  // Get dates with events for highlighting in calendar
  const datesWithEvents = events.map(event => new Date(event.date));
  
  // Find drive details for an event
  const getDriveForEvent = (event: Event) => {
    if (!event.driveId) return null;
    return drives.find(drive => drive.id === event.driveId);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Placement Calendar</h1>
            <Button onClick={() => {
              resetForm();
              setIsAddEventDialogOpen(true);
            }} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Event</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar View */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Select a date to view or add events</CardDescription>
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
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEditEvent(event)}
                                disabled={!!event.driveId}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteEvent(event.id)}
                                disabled={!!event.driveId}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
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
                                onClick={() => navigate(`/admin/drives?id=${relatedDrive.id}`)}
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
                      onClick={() => {
                        setNewEventDate(selectedDate);
                        setIsAddEventDialogOpen(true);
                      }}
                    >
                      Add Event
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Add/Edit Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event" : "Add New Event"}
            </DialogTitle>
            <DialogDescription>
              {editingEvent 
                ? "Make changes to the selected event" 
                : "Add a new event to the placement calendar"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Enter event title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-description">Description (Optional)</Label>
              <Textarea
                id="event-description"
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                placeholder="Enter event description"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEventDate ? format(newEventDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newEventDate}
                    onSelect={setNewEventDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>
              {editingEvent ? "Update Event" : "Add Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default AdminCalendar;
