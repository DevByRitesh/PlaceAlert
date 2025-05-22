import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { toast } from "sonner";
import api from "@/utils/api";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string, 
    email: string, 
    password: string, 
    role: "admin" | "student", 
    branch?: string, 
    percentage?: number,
    rollNumber?: string,
    mobileNumber?: string
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if token exists and fetch user data
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data?.user) {
          setUser({
            ...response.data.user,
            password: "", // Don't store password
            createdAt: new Date()
          });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Only remove token if it's an authentication error
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data?.token && response.data?.user) {
        localStorage.setItem("token", response.data.token);
        
        setUser({
          ...response.data.user,
          password: "", // Don't store password
          createdAt: new Date()
        });
        
        toast.success("Login successful!");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: "admin" | "student",
    branch?: string,
    percentage?: number,
    rollNumber?: string,
    mobileNumber?: string
  ) => {
    setIsLoading(true);
    try {
      const userData = { name, email, password, role };
      
      if (role === "student") {
        Object.assign(userData, { branch, percentage, rollNumber, mobileNumber });
      }
      
      const response = await api.post('/auth/signup', userData);
      
      if (response.data?.token && response.data?.user) {
        localStorage.setItem("token", response.data.token);
        
        setUser({
          ...response.data.user,
          password: "", // Don't store password
          createdAt: new Date()
        });
        
        toast.success("Signup successful!");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Signup failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
