import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  NavigationMenu,
  NavigationMenuItem, 
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const AdminNavLinks = () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              to="/admin/dashboard"
              className={cn(
                navigationMenuTriggerStyle(),
                location.pathname === "/admin/dashboard" && "bg-accent"
              )}
            >
              Dashboard
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Manage</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    to="/admin/students"
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">Students</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Manage student profiles and records
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    to="/admin/drives"
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">Drives</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Manage placement drives and opportunities
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    to="/admin/applications"
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">Applications</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Track and manage student applications
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    to="/admin/companies"
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">Companies</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Manage company profiles and relationships
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Analytics</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    to="/admin/reports"
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">Reports</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View detailed placement analytics and reports
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    to="/admin/calendar"
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">Calendar</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Schedule and manage placement events
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );

  const StudentNavLinks = () => (
    <>
      <Link to="/student/dashboard" className={cn(
        "text-white hover:text-accent transition-colors",
        location.pathname === "/student/dashboard" && "text-accent"
      )}>
        Dashboard
      </Link>
      <Link to="/student/drives" className={cn(
        "text-white hover:text-accent transition-colors",
        location.pathname === "/student/drives" && "text-accent"
      )}>
        Drives
      </Link>
      <Link to="/student/resume" className={cn(
        "text-white hover:text-accent transition-colors",
        location.pathname === "/student/resume" && "text-accent"
      )}>
        Resume
      </Link>
      <Link to="/student/calendar" className={cn(
        "text-white hover:text-accent transition-colors",
        location.pathname === "/student/calendar" && "text-accent"
      )}>
        Calendar
      </Link>
    </>
  );

  const MobileNavLinks = () => (
    <nav className="flex flex-col space-y-4">
      <Link to="/" className="text-white hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>
        Home
      </Link>
      {isAuthenticated && user?.role === "admin" && (
        <>
          <Link to="/admin/dashboard" className="text-white hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
          <Link to="/admin/students" className="text-white hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>
            Students
          </Link>
          <Link to="/admin/drives" className="text-white hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>
            Drives
          </Link>
          <Link to="/admin/applications" className="text-white hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>
            Applications
          </Link>
          <Link to="/admin/companies" className="text-white hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>
            Companies
          </Link>
          <Link to="/admin/reports" className="text-white hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>
            Reports
          </Link>
          <Link to="/admin/calendar" className="text-white hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>
            Calendar
          </Link>
        </>
      )}
      {isAuthenticated && user?.role === "student" && (
        <>
          <Link to="/student/dashboard" className="text-white hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
          <Link to="/student/drives" className="text-white hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>
            Drives
          </Link>
          <Link to="/student/resume" className="text-white hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>
            Resume
          </Link>
          <Link to="/student/calendar" className="text-white hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>
            Calendar
          </Link>
        </>
      )}
      {!isAuthenticated && (
        <>
          <Link to="/login" className="text-white hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>
            Login
          </Link>
          <Link to="/signup" className="text-white hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>
            Sign Up
          </Link>
        </>
      )}
    </nav>
  );

  return (
    <header className="bg-primary sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Place<span className="text-accent">Alert</span>
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-accent transition-colors">
              Home
            </Link>
            {isAuthenticated && user?.role === "admin" && <AdminNavLinks />}
            {isAuthenticated && user?.role === "student" && <StudentNavLinks />}
            {!isAuthenticated && (
              <>
                <Link to="/login" className="text-white hover:text-accent transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="text-white hover:text-accent transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
          
          {/* Desktop Auth Section */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:text-accent">
                    <span className="mr-2">{user?.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-accent">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-primary p-6">
                <SheetHeader>
                  <SheetTitle className="text-white">Navigation Menu</SheetTitle>
                  {isAuthenticated && (
                    <SheetDescription className="text-white/70">
                      Logged in as {user?.name}
                    </SheetDescription>
                  )}
                </SheetHeader>
                <div className="mt-6">
                  <MobileNavLinks />
                  {isAuthenticated && (
                    <div className="pt-4 mt-4 border-t border-primary-foreground/10">
                      <Button 
                        variant="ghost" 
                        onClick={handleLogout}
                        className="text-white hover:text-accent w-full justify-start"
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Logout
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
