import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ProblemStatement = () => {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Two Sum</h3>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            Easy
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Given an array of integers <code className="text-xs bg-muted px-1 py-0.5 rounded">nums</code> and an integer <code className="text-xs bg-muted px-1 py-0.5 rounded">target</code>, 
            return indices of the two numbers such that they add up to <code className="text-xs bg-muted px-1 py-0.5 rounded">target</code>.
          </p>
          
          <p>
            You may assume that each input would have exactly one solution, and you may not use the same element twice.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Example:</h4>
          <div className="bg-muted/50 p-3 rounded text-xs font-mono space-y-1">
            <div><span className="text-muted-foreground">Input:</span> nums = [2,7,11,15], target = 9</div>
            <div><span className="text-muted-foreground">Output:</span> [0,1]</div>
            <div><span className="text-muted-foreground">Explanation:</span> nums[0] + nums[1] == 9, so return [0, 1]</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProblemStatement;
