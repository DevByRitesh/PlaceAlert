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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { branches, Branch } from "@/types";
import { toast } from "sonner";

const CreateDrive = () => {
  const { user, isAuthenticated } = useAuth();
  const { companies, addDrive, addCompany } = useData();
  const navigate = useNavigate();
  
  // Form state
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  
  // New company state
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyDescription, setNewCompanyDescription] = useState("");
  const [newCompanyWebsite, setNewCompanyWebsite] = useState("");
  const [newCompanyLocation, setNewCompanyLocation] = useState("");
  
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<Branch[]>([]);
  const [minimumPercentage, setMinimumPercentage] = useState("60");
  const [applicationLink, setApplicationLink] = useState("");
  const [ctcMin, setCtcMin] = useState("");
  const [ctcMax, setCtcMax] = useState("");
  const [numberOfRounds, setNumberOfRounds] = useState("1");
  const [driveDate, setDriveDate] = useState<Date | undefined>(new Date());
  const [lastDateToApply, setLastDateToApply] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);
  
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
    
    setIsSubmitting(true);
    let selectedCompanyId = companyId;
    let selectedCompanyName = "";

    // Validate company selection before the try block
    if (activeTab === "existing") {
      if (!companyId) {
        toast.error("Please select a company");
        setIsSubmitting(false);
        return;
      }
      
      const selectedCompany = companies.find(c => c.id === companyId);
      if (!selectedCompany) {
        toast.error("Please select a valid company");
        setIsSubmitting(false);
        return;
      }
      selectedCompanyName = selectedCompany.name;
    } else if (!newCompanyName) {
      toast.error("Please enter a company name");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // If creating a new company
      if (activeTab === "new") {
        // Add new company - await the promise to get the actual company object
        const newCompany = await addCompany({
          name: newCompanyName,
          description: newCompanyDescription,
          website: newCompanyWebsite || undefined,
          location: newCompanyLocation || undefined,
        });
        
        selectedCompanyId = newCompany.id;
        selectedCompanyName = newCompany.name;
      }
      
      // Create the drive
      const newDrive = {
        companyId: selectedCompanyId,
        companyName: selectedCompanyName,
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
        driveDate: driveDate!,
        lastDateToApply: lastDateToApply!
      };
      
      await addDrive(newDrive);
      toast.success("Drive created successfully");
      navigate("/admin/drives");
    } catch (error) {
      console.error("Error creating drive:", error);
      toast.error("Failed to create drive");
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
              onClick={() => navigate("/admin/dashboard")}
              className="mb-4"
            >
              Back to Dashboard
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Create New Placement Drive</h1>
          </div>
          
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Drive Details</CardTitle>
              <CardDescription>
                Fill in the details for the new placement drive
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "existing" | "new")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="existing">Select Existing Company</TabsTrigger>
                      <TabsTrigger value="new">Add New Company</TabsTrigger>
                    </TabsList>
                    <TabsContent value="existing" className="mt-4">
                      <Select value={companyId} onValueChange={setCompanyId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem 
                              key={`company-${company.id}`} 
                              value={company.id}
                            >
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TabsContent>
                    <TabsContent value="new" className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={newCompanyName}
                          onChange={(e) => setNewCompanyName(e.target.value)}
                          placeholder="Enter company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyDescription">Company Description</Label>
                        <Textarea
                          id="companyDescription"
                          value={newCompanyDescription}
                          onChange={(e) => setNewCompanyDescription(e.target.value)}
                          placeholder="Describe the company"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyWebsite">Website (Optional)</Label>
                          <Input
                            id="companyWebsite"
                            value={newCompanyWebsite}
                            onChange={(e) => setNewCompanyWebsite(e.target.value)}
                            placeholder="https://example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companyLocation">Location (Optional)</Label>
                          <Input
                            id="companyLocation"
                            value={newCompanyLocation}
                            onChange={(e) => setNewCompanyLocation(e.target.value)}
                            placeholder="City, Country"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                
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
                  {isSubmitting ? "Creating Drive..." : "Create Drive"}
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

export default CreateDrive;
