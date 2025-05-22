import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlacementDrive, Application } from "@/types";
import { format } from "date-fns";
import { Calendar, Clock, CheckCircle2, Clock3, XCircle, Users } from "lucide-react";

type DriveCardProps = {
  drive: PlacementDrive;
  isEligible?: boolean;
  hasApplied?: boolean;
  onApply?: () => void;
  showDetails?: boolean;
  application?: Application | undefined;
  isStudentDashboard?: boolean;
};

const DriveCard = ({ 
  drive, 
  isEligible = true, 
  hasApplied = false, 
  onApply, 
  showDetails = false,
  application,
  isStudentDashboard = false
}: DriveCardProps) => {
  const isPast = new Date(drive.driveDate) < new Date();
  const isApplicationClosed = new Date(drive.lastDateToApply) < new Date();
  
  // Handle both old and new CTC formats
  const getCtcDisplay = () => {
    if (drive.ctcRange) {
      return `${drive.ctcRange.min} - ${drive.ctcRange.max} LPA`;
    }
    // Fallback for old format
    return `${drive.ctc} LPA`;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{drive.title}</CardTitle>
            <CardDescription className="text-base mt-1">{drive.companyName}</CardDescription>
          </div>
          {isStudentDashboard && application && (
            <Badge variant={application.status === 'selected' ? 'default' : 'secondary'}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          <span>Drive Date: {format(new Date(drive.driveDate), "PPP")}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          <span>Last Date to Apply: {format(new Date(drive.lastDateToApply), "PPP")}</span>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          <span>Number of Rounds: {drive.numberOfRounds || 1}</span>
        </div>
        
        {showDetails && (
          <>
            <div className="text-sm">
              <p className="font-medium mb-1">Description:</p>
              <p className="text-muted-foreground">
                {drive.description.length > 150 
                  ? `${drive.description.substring(0, 150)}...` 
                  : drive.description}
              </p>
            </div>
            
            <div className="text-sm">
              <p className="font-medium mb-1">Requirements:</p>
              <p className="text-muted-foreground">
                {drive.requirements.length > 150 
                  ? `${drive.requirements.substring(0, 150)}...` 
                  : drive.requirements}
              </p>
            </div>
            
            <div className="text-sm">
              <p className="font-medium mb-1">Eligible Branches:</p>
              <div className="flex flex-wrap gap-2">
                {drive.eligibleBranches.map((branch) => (
                  <Badge key={branch} variant="secondary">
                    {branch}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="text-sm">
              <p className="font-medium mb-1">Minimum Percentage:</p>
              <p className="text-muted-foreground">{drive.minimumPercentage}%</p>
            </div>
            
            <div className="text-sm">
              <p className="font-medium mb-1">CTC Range:</p>
              <p className="text-muted-foreground">{getCtcDisplay()}</p>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {showDetails ? (
          <Button variant="outline" onClick={onApply}>
            View Details
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link to={`/student/drives/${drive.id}`}>View Details</Link>
          </Button>
        )}
        
        {!isStudentDashboard && !isPast && !isApplicationClosed && (
          <Button 
            onClick={onApply} 
            disabled={!isEligible || hasApplied}
          >
            {hasApplied ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Applied
              </>
            ) : !isEligible ? (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Not Eligible
              </>
            ) : (
              <>
                <Clock3 className="mr-2 h-4 w-4" />
                Apply Now
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DriveCard;
