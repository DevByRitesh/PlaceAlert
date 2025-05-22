import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Download, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const StudentProfile = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { students, applications, drives } = useData();
  const navigate = useNavigate();

  // Get student details
  const student = students.find(s => s.id === id);

  // Get student's applications
  const studentApplications = applications
    .filter(app => app.studentId === id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
      return;
    }

    if (!student) {
      toast.error("Student not found");
      navigate("/admin/students");
    }
  }, [isAuthenticated, user, navigate, student]);

  if (!student) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Student Profile</h1>
          </div>

          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Personal Details</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">Name</dt>
                      <dd>{student.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Email</dt>
                      <dd className="flex items-center gap-2">
                        {student.email}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.location.href = `mailto:${student.email}`}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Roll Number</dt>
                      <dd>{student.rollNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Mobile Number</dt>
                      <dd>{student.mobileNumber || "Not provided"}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Academic Details</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">Branch</dt>
                      <dd>{student.branch}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Percentage</dt>
                      <dd>{student.percentage}%</dd>
                    </div>
                  </dl>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Placement Status</span>
                      <span className="font-medium">
                        {student.isPlaced ? (
                          <>
                            <Badge className="bg-green-100 text-green-800">Placed</Badge>
                            {student.selectedCount && student.selectedCount > 1 ? (
                              <span className="ml-2">
                                Selected by {student.selectedCount} companies: {student.placedCompanies?.join(", ")}
                              </span>
                            ) : (
                              <span className="ml-2">
                                Placed at {student.placedCompanies?.join(", ")}
                              </span>
                            )}
                          </>
                        ) : (
                          <Badge variant="outline">Not Placed</Badge>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {student.resume && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Resume</h3>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/uploads/${student.resume.split('/').pop()}`, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    View Resume
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Applications History</CardTitle>
              <CardDescription>
                All placement drive applications by this student
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentApplications.length > 0 ? (
                <div className="space-y-4">
                  {studentApplications.map((application) => {
                    const drive = drives.find(d => d.id === application.driveId);
                    if (!drive) return null;

                    return (
                      <div
                        key={application.id}
                        className="border rounded-lg p-4 hover:bg-accent/20 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{drive.companyName}</h4>
                            <p className="text-sm text-muted-foreground">{drive.title}</p>
                          </div>
                          <Badge
                            variant={
                              application.status === "selected"
                                ? "success"
                                : application.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {application.status}
                          </Badge>
                        </div>

                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>Applied on: {format(new Date(application.createdAt), "PPP")}</p>
                          <p>Current Round: {application.currentRound}</p>
                          {application.resumeUrl && (
                            <div className="mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => window.open(`/uploads/${application.resumeUrl.split('/').pop()}`, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                                View Drive Resume
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/drives/applications?driveId=${drive.id}`)}
                          >
                            View Drive Applications
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No applications submitted yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentProfile; 