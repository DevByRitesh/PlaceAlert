import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InterviewResource } from "@/types";
import { BookOpen, Video, FileText, BrainCircuit } from "lucide-react";

type InterviewResourceCardProps = {
  resource: InterviewResource;
};

const InterviewResourceCard = ({ resource }: InterviewResourceCardProps) => {
  const getIcon = () => {
    switch (resource.type) {
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'quiz':
        return <BrainCircuit className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getCategoryColor = () => {
    switch (resource.category) {
      case 'technical':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'aptitude':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'hr':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'soft-skills':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getDifficultyColor = () => {
    switch (resource.difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <h3 className="font-medium">{resource.title}</h3>
          </div>
          <Badge className={getCategoryColor()}>
            {resource.category}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {resource.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="space-x-2">
            <Badge variant="outline" className={getDifficultyColor()}>
              {resource.difficulty}
            </Badge>
            {resource.tags.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(resource.url, '_blank')}
          >
            Open Resource
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewResourceCard; 