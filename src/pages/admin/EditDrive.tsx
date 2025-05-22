import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { branches, Branch } from "@/types";
import { toast } from "sonner";

const EditDrive = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { drives, updateDrive } = useData();
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<Branch[]>([]);
  const [minimumPercentage, setMinimumPercentage] = useState("");
  const [applicationLink, setApplicationLink] = useState("");
  const [ctcMin, setCtcMin] = useState("");
  const [ctcMax, setCtcMax] = useState("");
  const [numberOfRounds, setNumberOfRounds] = useState("1");
  const [driveDate, setDriveDate] = useState<Date | undefined>(new Date());
  const [lastDateToApply, setLastDateToApply] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load drive data
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
      return;
    }
    
    const drive = drives.find(d => d.id === id);
    if (!drive) {
      toast.error("Drive not found");
      navigate("/admin/drives");
      return;
    }
    
    // Populate form with drive data
    setTitle(drive.title);
    setDescription(drive.description);
    setRequirements(drive.requirements);
    setSelectedBranches(drive.eligibleBranches as Branch[]);
    setMinimumPercentage(drive.minimumPercentage?.toString() || "60");
    setApplicationLink(drive.applicationLink || "");
    setCtcMin(drive.ctcRange?.min?.toString() || "");
    setCtcMax(drive.ctcRange?.max?.toString() || "");
    setNumberOfRounds(drive.numberOfRounds?.toString() || "1");
    setDriveDate(new Date(drive.driveDate));
    setLastDateToApply(new Date(drive.lastDateToApply));
  }, [id, drives, isAuthenticated, user, navigate]);
  
  const handleBranchToggle = (branch: Branch) => {
    setSelectedBranches(prev => 
      prev.includes(branch)
        ? prev.filter(b => b !== branch)
        : [...prev, branch]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !requirements || 
        selectedBranches.length === 0 || !minimumPercentage || 
        !driveDate || !lastDateToApply || !ctcMin || !ctcMax || !numberOfRounds) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate CTC range
    if (parseFloat(ctcMin) >= parseFloat(ctcMax)) {
      toast.error("Minimum CTC must be less than Maximum CTC");
      return;
    }
    
    const drive = drives.find(d => d.id === id);
    if (!drive) {
      toast.error("Drive not found");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedDrive = {
        ...drive,
        title,
        description,
        requirements,
        eligibleBranches: selectedBranches,
        minimumPercentage: parseFloat(minimumPercentage),
        ctcRange: {
          min: parseFloat(ctcMin),
          max: parseFloat(ctcMax)
        },
        numberOfRounds: parseInt(numberOfRounds),
        applicationLink: applicationLink || undefined,
        driveDate,
        lastDateToApply,
      };
      
      await updateDrive(updatedDrive);
      toast.success("Drive updated successfully");
      navigate("/admin/drives");
    } catch (error) {
      console.error("Error updating drive:", error);
      toast.error("Failed to update drive");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/drives")}
              className="mb-4"
            >
              Back to Drives
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Edit Placement Drive</h1>
          </div>
          
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Drive Details</CardTitle>
              <CardDescription>
                Update the placement drive details
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input 
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Software Engineer"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea 
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the job role and responsibilities"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea 
                    id="requirements"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="List the skills and qualifications required"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="space-y-4">
                  <Label>Eligible Branches</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {branches.map((branch) => (
                      <div key={branch} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`branch-${branch}`}
                          checked={selectedBranches.includes(branch)}
                          onCheckedChange={() => handleBranchToggle(branch)}
                        />
                        <label 
                          htmlFor={`branch-${branch}`}
                          className="text-sm cursor-pointer"
                        >
                          {branch}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="percentage">Minimum Percentage</Label>
                  <Input 
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={minimumPercentage}
                    onChange={(e) => setMinimumPercentage(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ctcRange">CTC Range (in LPA)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input 
                        id="ctcMin"
                        type="number"
                        min="0"
                        step="0.1"
                        value={ctcMin}
                        onChange={(e) => setCtcMin(e.target.value)}
                        placeholder="Min CTC"
                        required
                      />
                    </div>
                    <div>
                      <Input 
                        id="ctcMax"
                        type="number"
                        min="0"
                        step="0.1"
                        value={ctcMax}
                        onChange={(e) => setCtcMax(e.target.value)}
                        placeholder="Max CTC"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="numberOfRounds">Number of Rounds</Label>
                  <Input 
                    id="numberOfRounds"
                    type="number"
                    min="1"
                    value={numberOfRounds}
                    onChange={(e) => setNumberOfRounds(e.target.value)}
                    placeholder="Enter number of rounds"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="applicationLink">Application Link (Optional)</Label>
                  <Input 
                    id="applicationLink"
                    value={applicationLink}
                    onChange={(e) => setApplicationLink(e.target.value)}
                    placeholder="https://forms.example.com/application"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Drive Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {driveDate ? format(driveDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={driveDate}
                          onSelect={setDriveDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Last Date to Apply</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {lastDateToApply ? format(lastDateToApply, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={lastDateToApply}
                          onSelect={setLastDateToApply}
                          disabled={(date) => 
                            date < new Date() || 
                            (driveDate && date > driveDate)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating Drive..." : "Update Drive"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EditDrive; 