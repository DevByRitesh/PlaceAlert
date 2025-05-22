
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Student, Branch } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { toast } from "sonner";
import { branches } from "@/types";

const NotificationManager = () => {
  const { students, addNotification } = useData();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState<"all" | "placed" | "unplaced" | "selected">("all");
  const [selectedBranch, setSelectedBranch] = useState<Branch | "all">("all");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter students based on selected branch
  const filteredStudents = selectedBranch === "all"
    ? students
    : students.filter(student => student.branch === selectedBranch);

  const handleRecipientTypeChange = (value: "all" | "placed" | "unplaced" | "selected") => {
    setRecipientType(value);
    setSelectedStudents([]);
  };

  const handleBranchChange = (value: string) => {
    // This handles the type conversion properly
    setSelectedBranch(value as Branch | "all");
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !message) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Determine recipients based on selection
      const recipients = 
        recipientType === "selected" 
          ? selectedStudents 
          : recipientType;
      
      addNotification({
        title,
        message,
        recipients
      });
      
      // Reset form
      setTitle("");
      setMessage("");
      setRecipientType("all");
      setSelectedBranch("all");
      setSelectedStudents([]);
      
      toast.success("Notification sent successfully");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Send Notification</CardTitle>
        <CardDescription>
          Send notifications to students based on their status or select specific students
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message"
              rows={4}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Recipients</Label>
            <RadioGroup 
              value={recipientType} 
              onValueChange={(value) => handleRecipientTypeChange(value as "all" | "placed" | "unplaced" | "selected")}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All Students</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="placed" id="placed" />
                <Label htmlFor="placed">Placed Students Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unplaced" id="unplaced" />
                <Label htmlFor="unplaced">Unplaced Students Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="selected" />
                <Label htmlFor="selected">Selected Students</Label>
              </div>
            </RadioGroup>
          </div>
          
          {recipientType === "selected" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Filter by Branch</Label>
                <Select value={selectedBranch} onValueChange={handleBranchChange}>
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select Students</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectAllStudents}
                  >
                    {selectedStudents.length === filteredStudents.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                
                <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <div key={student.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                        <Checkbox 
                          id={`student-${student.id}`}
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => handleStudentToggle(student.id)}
                        />
                        <label 
                          htmlFor={`student-${student.id}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          <div className="font-medium">{student.name}</div>
                          <div className="text-muted-foreground text-xs">{student.branch} - {student.isPlaced ? "Placed" : "Unplaced"}</div>
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No students found</p>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Selected {selectedStudents.length} of {filteredStudents.length} students
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || (recipientType === "selected" && selectedStudents.length === 0)}
          >
            {isSubmitting ? "Sending..." : "Send Notification"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NotificationManager;
