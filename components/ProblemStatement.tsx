import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProblemStatementProps {
  question: string;
}

const ProblemStatement = ({ question }: ProblemStatementProps) => {
  if (!question) {
    return (
      <Card className="p-4 bg-card border-border">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="h-6 bg-muted rounded w-1/4"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  const lines = question.split('\n');
  const title = lines[0];
  const difficulty = lines[1];
  const body = lines.slice(2).join('\n');

  return (
    <Card className="p-4 bg-card border-border">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            {difficulty}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          {body.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ProblemStatement;
