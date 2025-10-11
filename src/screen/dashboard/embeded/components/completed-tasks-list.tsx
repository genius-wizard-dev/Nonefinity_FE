import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface CompletedTask {
  id: string;
  status: string;
  task_type: string;
  model_id: string;
  created_at: string;
}

interface CompletedTasksListProps {
  completedTasks: CompletedTask[];
  onTaskClick: (taskId: string) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}

export function CompletedTasksList({
  completedTasks,
  onTaskClick,
  getStatusIcon,
  getStatusColor,
}: CompletedTasksListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Completed Tasks ({completedTasks.length})
        </CardTitle>
        <CardDescription>Recently completed embedding tasks</CardDescription>
      </CardHeader>
      <CardContent>
        {!completedTasks || completedTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No completed tasks
          </div>
        ) : (
          <div className="space-y-4">
            {completedTasks.slice(0, 10).map((task, index) => (
              <div
                key={`${task.id}-${index}`}
                className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => onTaskClick(task.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <div className="font-medium capitalize">
                        {task.task_type} Task
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {task.model_id} •{" "}
                        {new Date(task.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
