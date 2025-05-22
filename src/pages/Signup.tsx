import { useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { branches } from "@/types";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [branch, setBranch] = useState("");
  const [percentage, setPercentage] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [role, setRole] = useState<"admin" | "student">("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signup, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return URL from location state
  const from = (location.state as { from?: Location })?.from?.pathname || 
    (user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
  
  // If already logged in, redirect to the return URL or dashboard
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (role === "student") {
      if (!rollNumber.trim()) {
        newErrors.rollNumber = "Roll number is required";
      } else if (!/^[A-Za-z0-9]+$/.test(rollNumber)) {
        newErrors.rollNumber = "Roll number should contain only letters and numbers";
      }

      if (!mobileNumber.trim()) {
        newErrors.mobileNumber = "Mobile number is required";
      } else if (!/^\d{10}$/.test(mobileNumber)) {
        newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
      }

      if (!branch) {
        newErrors.branch = "Branch is required";
      }

      if (!percentage) {
        newErrors.percentage = "Percentage is required";
      } else {
        const percentageNum = parseFloat(percentage);
        if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
          newErrors.percentage = "Percentage must be between 0 and 100";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return;
    }
    
    if (role === "student") {
      if (!branch) {
        setErrors(prev => ({ ...prev, branch: "Branch is required" }));
        return;
      }
      if (!percentage) {
        setErrors(prev => ({ ...prev, percentage: "Percentage is required" }));
        return;
      }
      if (!rollNumber) {
        setErrors(prev => ({ ...prev, rollNumber: "Roll number is required" }));
        return;
      }
      if (!mobileNumber) {
        setErrors(prev => ({ ...prev, mobileNumber: "Mobile number is required" }));
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      await signup(
        name,
        email,
        password,
        role,
        branch,
        parseFloat(percentage),
        rollNumber,
        mobileNumber
      );
      // After successful signup, navigate to the return URL
      navigate(from, { replace: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage?.includes("email")) {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else {
        setErrors(prev => ({ ...prev, submit: errorMessage || "Signup failed" }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center p-4 bg-muted">
        <div className="w-full max-w-md">
          <Tabs defaultValue="student" className="w-full" onValueChange={(value) => setRole(value as "admin" | "student")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="student">Student Signup</TabsTrigger>
              <TabsTrigger value="admin">Admin Signup</TabsTrigger>
            </TabsList>
            
            <TabsContent value="student">
              <Card>
                <CardHeader>
                  <CardTitle>Create Student Account</CardTitle>
                  <CardDescription>
                    Enter your details to create a student account
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    {errors.form && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{errors.form}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rollNumber">Roll Number</Label>
                      <Input 
                        id="rollNumber"
                        placeholder="Enter your roll number"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        required
                        className={errors.rollNumber ? "border-red-500" : ""}
                      />
                      {errors.rollNumber && <p className="text-sm text-red-500">{errors.rollNumber}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber">Mobile Number</Label>
                      <Input 
                        id="mobileNumber"
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                        className={errors.mobileNumber ? "border-red-500" : ""}
                      />
                      {errors.mobileNumber && <p className="text-sm text-red-500">{errors.mobileNumber}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch</Label>
                      <Select value={branch} onValueChange={setBranch} required>
                        <SelectTrigger className={errors.branch ? "border-red-500" : ""}>
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
                      {errors.branch && <p className="text-sm text-red-500">{errors.branch}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="percentage">Percentage</Label>
                      <Input 
                        id="percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Enter your percentage"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        required
                        className={errors.percentage ? "border-red-500" : ""}
                      />
                      {errors.percentage && <p className="text-sm text-red-500">{errors.percentage}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={errors.password ? "border-red-500" : ""}
                      />
                      {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input 
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={errors.confirmPassword ? "border-red-500" : ""}
                      />
                      {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Creating Account..." : "Create Account"}
                    </Button>
                    <div className="mt-4 text-center text-sm">
                      Already have an account?{" "}
                      <Link to="/login" className="text-secondary hover:underline">
                        Login
                      </Link>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle>Create Admin Account</CardTitle>
                  <CardDescription>
                    Enter your details to create an admin account
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    {errors.form && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{errors.form}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="admin-name">Full Name</Label>
                      <Input 
                        id="admin-name"
                        placeholder="Admin Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email</Label>
                      <Input 
                        id="admin-email"
                        type="email"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input 
                        id="admin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-confirm-password">Confirm Password</Label>
                      <Input 
                        id="admin-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Creating Account..." : "Create Account"}
                    </Button>
                    <div className="mt-4 text-center text-sm">
                      Already have an account?{" "}
                      <Link to="/login" className="text-secondary hover:underline">
                        Login
                      </Link>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Signup;
