import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProblemStatementProps {
  question: Question | null;
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

  return (
    <Card className="p-4 bg-card border-border max-h-96 overflow-y-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{question.title}</h3>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Coding
          </Badge>
        </div>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-foreground mb-2">Description</h4>
            <div className="text-muted-foreground whitespace-pre-wrap">
              {question.description}
            </div>
          </div>

          {question.constraints && question.constraints.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-2">Constraints</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                {question.constraints.map((constraint, index) => (
                  <li key={index} className="text-xs">{constraint}</li>
                ))}
              </ul>
            </div>
          )}

          {question.example && (
            <div>
              <h4 className="font-medium text-foreground mb-2">Example</h4>
              <div className="bg-muted/50 p-3 rounded-md space-y-2 text-xs">
                <div><span className="font-medium">Input:</span> {question.example.Input}</div>
                <div><span className="font-medium">Output:</span> {question.example.Output}</div>
                {question.example.Explanation && (
                  <div><span className="font-medium">Explanation:</span> {question.example.Explanation}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProblemStatement;
