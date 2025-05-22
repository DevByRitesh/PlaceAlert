
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash, ExternalLink, Building } from "lucide-react";
import { toast } from "sonner";
import { Company } from "@/types";

const AdminCompanies = () => {
  const { user, isAuthenticated } = useAuth();
  const { companies, addCompany, updateCompany, deleteCompany } = useData();
  const navigate = useNavigate();
  
  // State for dialog and form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    website: "",
    location: "",
  });
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setFormData({
        id: company.id,
        name: company.name,
        description: company.description,
        website: company.website || "",
        location: company.location || "",
      });
      setIsEditing(true);
    } else {
      setFormData({
        id: "",
        name: "",
        description: "",
        website: "",
        location: "",
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };
  
  const handleSubmit = () => {
    if (!formData.name || !formData.description) {
      toast.error("Company name and description are required");
      return;
    }
    
    if (isEditing) {
      updateCompany({
        id: formData.id,
        name: formData.name,
        description: formData.description,
        website: formData.website || undefined,
        location: formData.location || undefined,
        createdAt: companies.find(c => c.id === formData.id)!.createdAt
      });
      toast.success("Company updated successfully");
    } else {
      addCompany({
        name: formData.name,
        description: formData.description,
        website: formData.website || undefined,
        location: formData.location || undefined,
      });
      toast.success("Company added successfully");
    }
    
    setIsDialogOpen(false);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
      deleteCompany(id);
      toast.success("Company deleted successfully");
    }
  };
  
  // Filter companies based on search query
  const filteredCompanies = companies
    .filter(company => 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.location && company.location.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Company Management</h1>
            <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Company</span>
            </Button>
          </div>
          
          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="max-w-md">
                <Label htmlFor="search">Search Companies</Label>
                <Input
                  id="search"
                  placeholder="Search by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Companies List */}
          <Card>
            <CardHeader>
              <CardTitle>Companies ({filteredCompanies.length})</CardTitle>
              <CardDescription>
                Manage company information and create placement drives
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCompanies.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompanies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium">{company.name}</TableCell>
                          <TableCell>{company.location || "—"}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {company.description}
                          </TableCell>
                          <TableCell>
                            {company.website ? (
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:underline"
                              >
                                Visit
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenDialog(company)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(company.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => navigate(`/admin/drives/new?company=${company.id}`)}
                              >
                                Create Drive
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No companies found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery 
                      ? "No companies match your search query." 
                      : "Add your first company to start creating placement drives."}
                  </p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Add/Edit Company Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Company" : "Add New Company"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? "Update company information" 
                    : "Add details about the company for placement drives"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-description">Description</Label>
                  <Textarea
                    id="company-description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter company description"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-website">Website (Optional)</Label>
                  <Input
                    id="company-website"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-location">Location (Optional)</Label>
                  <Input
                    id="company-location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="City, Country"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {isEditing ? "Save Changes" : "Add Company"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminCompanies;
