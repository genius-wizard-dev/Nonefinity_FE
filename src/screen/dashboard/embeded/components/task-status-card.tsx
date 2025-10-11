import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle, Loader2, RefreshCw } from "lucide-react";

interface TaskStatus {
  status: string;
  ready: boolean;
  successful: boolean;
  failed: boolean;
  meta?: string;
  error?: string;
  result?: {
    user_id: string;
    file_id: string;
    file_name?: string;
    provider: string;
    model_id: string;
    total_chunks: number;
    successful_chunks: number;
  };
}

interface TaskStatusCardProps {
  currentTaskId: string;
  taskStatus: TaskStatus | null;
  loading: boolean;
  onRefreshStatus: () => void;
  onClearTask: () => void;
  getStatusColor: (status: string) => string;
}

export function TaskStatusCard({
  currentTaskId,
  taskStatus,
  loading,
  onRefreshStatus,
  onClearTask,
  getStatusColor,
}: TaskStatusCardProps) {
  const isInProgress =
    taskStatus?.status === "PROGRESS" ||
    taskStatus?.status === "STARTED" ||
    taskStatus?.status === "PENDING";
  const isCompleted = taskStatus?.status === "SUCCESS";

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!taskStatus?.result) return 0;
    const { total_chunks, successful_chunks } = taskStatus.result;
    if (total_chunks === 0) return 0;
    return Math.round((successful_chunks / total_chunks) * 100);
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isInProgress ? (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          ) : isCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Brain className="w-5 h-5" />
          )}
          Current Task
          {isInProgress && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 animate-pulse"
            >
              Processing
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Task ID: {currentTaskId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {taskStatus && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status</span>
              <Badge className={getStatusColor(taskStatus.status)}>
                {taskStatus.status}
              </Badge>
            </div>

            {/* Progress Bar for in-progress tasks */}
            {isInProgress && taskStatus.result && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Processing Progress
                  </span>
                  <span className="font-medium">
                    {getProgressPercentage()}%
                  </span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {taskStatus.result.successful_chunks} of{" "}
                    {taskStatus.result.total_chunks} chunks processed
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-medium">Ready</span>
              <span>{taskStatus.ready ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Successful</span>
              <span>{taskStatus.successful ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Failed</span>
              <span>{taskStatus.failed ? "Yes" : "No"}</span>
            </div>
            {taskStatus.meta && (
              <div className="text-sm text-muted-foreground">
                {taskStatus.meta}
              </div>
            )}
            {taskStatus.error && (
              <Alert variant="destructive">
                <AlertDescription>{taskStatus.error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {taskStatus?.result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Task Results</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-green-700">User ID:</span>
                <span className="ml-2 text-green-600">
                  {taskStatus.result.user_id}
                </span>
              </div>
              <div>
                <span className="font-medium text-green-700">File:</span>
                <span className="ml-2 text-green-600">
                  {taskStatus.result.file_name || taskStatus.result.file_id}
                </span>
              </div>
              <div>
                <span className="font-medium text-green-700">Provider:</span>
                <span className="ml-2 text-green-600">
                  {taskStatus.result.provider}
                </span>
              </div>
              <div>
                <span className="font-medium text-green-700">Model:</span>
                <span className="ml-2 text-green-600">
                  {taskStatus.result.model_id}
                </span>
              </div>
              <div>
                <span className="font-medium text-green-700">
                  Total Chunks:
                </span>
                <span className="ml-2 text-green-600">
                  {taskStatus.result.total_chunks}
                </span>
              </div>
              <div>
                <span className="font-medium text-green-700">
                  Successful Chunks:
                </span>
                <span className="ml-2 text-green-600">
                  {taskStatus.result.successful_chunks}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onRefreshStatus}
            disabled={loading || taskStatus?.status === "SUCCESS"}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {taskStatus?.status === "SUCCESS"
              ? "Completed"
              : loading
              ? "Refreshing..."
              : "Refresh Status"}
          </Button>
          <Button variant="outline" onClick={onClearTask} disabled={loading}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
