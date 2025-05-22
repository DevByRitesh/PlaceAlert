import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { branches } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import api from "@/utils/api";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const ProfileUpdate = () => {
  const [branch, setBranch] = useState("");
  const [percentage, setPercentage] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast: useToastToast } = useToast();
  
  // Redirect if not authenticated or not student
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "student") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch current student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await api.get('/auth/student/profile');
        if (response.data?.student) {
          setBranch(response.data.student.branch);
          setPercentage(response.data.student.percentage.toString());
          setRollNumber(response.data.student.rollNumber);
          setMobileNumber(response.data.student.mobileNumber);
        }
      } catch (error) {
        console.error("Failed to fetch student data:", error);
        toast.error("Failed to load profile data");
      }
    };

    if (isAuthenticated && user?.role === "student") {
      fetchStudentData();
    }
  }, [isAuthenticated, user]);
  
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!branch || !percentage) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await api.patch('/auth/student/profile', {
        branch,
        percentage: parseFloat(percentage),
        rollNumber,
        mobileNumber,
      });
      
      toast.success("Profile updated successfully!");
      navigate("/student/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground mt-2">
              Update your profile information and manage your account settings
            </p>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Account Settings</CardTitle>
              <CardDescription>
                Make changes to your account settings and profile information
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="profile" className="text-base">Profile Details</TabsTrigger>
                  <TabsTrigger value="password" className="text-base">Change Password</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="rollNumber" className="text-base">Roll Number</Label>
                        <Input
                          id="rollNumber"
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobileNumber" className="text-base">Mobile Number</Label>
                        <Input
                          id="mobileNumber"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          required
                          pattern="[0-9]{10}"
                          title="Please enter a valid 10-digit mobile number"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="branch" className="text-base">Branch</Label>
                        <Select value={branch} onValueChange={setBranch} required>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select your branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((b) => (
                              <SelectItem key={b} value={b}>
                                {b}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="percentage" className="text-base">Percentage</Label>
                        <Input 
                          id="percentage"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="85.5"
                          value={percentage}
                          onChange={(e) => setPercentage(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/student/dashboard")}
                      className="h-11 px-8"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="h-11 px-8"
                      onClick={handleUpdate}
                    >
                      {isSubmitting ? "Updating..." : "Update Profile"}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="password" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-base">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-base">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-base">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="h-11 px-8"
                      onClick={handlePasswordChange}
                    >
                      {isSubmitting ? "Updating..." : "Change Password"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfileUpdate; 