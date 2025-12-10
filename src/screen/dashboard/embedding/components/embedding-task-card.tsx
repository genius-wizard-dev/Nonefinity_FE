import { LogoSpinner } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Clock,
  Database,
  File,
  FileText,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBackendTasks, useEmbeddingActions } from "../store";
import type { EmbeddingTask } from "../types";
import { DeleteTaskModal } from "./delete-task-modal";

interface EmbeddingTaskCardProps {
  task: EmbeddingTask;
}

export function EmbeddingTaskCard({ task }: EmbeddingTaskCardProps) {
  const { cancelTask, setSelectedTask, deleteTask } = useEmbeddingActions();
  const backendTasks = useBackendTasks();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Find corresponding backend task to get the MongoDB ID
  const backendTask = backendTasks.find((t) => t.task_id === task.task_id);

  const getStatusConfig = () => {
    switch (task.status) {
      case "PENDING":
        return {
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          badge: "bg-yellow-100 text-yellow-800",
          label: "Pending",
        };
      case "STARTED":
      case "PROGRESS":
        return {
          icon: <LogoSpinner className="w-5 h-5" />,
          badge: "bg-blue-100 text-blue-800",
          label: "Processing",
        };
      case "SUCCESS":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
          badge: "bg-green-100 text-green-800",
          label: "Success",
        };
      case "FAILURE":
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          badge: "bg-red-100 text-red-800",
          label: "Failed",
        };
      case "REVOKED":
        return {
          icon: <X className="w-5 h-5 text-gray-500" />,
          badge: "bg-gray-100 text-gray-800",
          label: "Cancelled",
        };
      default:
        return {
          icon: <Brain className="w-5 h-5 text-gray-500" />,
          badge: "bg-gray-100 text-gray-800",
          label: task.status,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const isProcessing = task.status === "STARTED" || task.status === "PROGRESS";
  const progress = task.meta?.progress || 0;
  const totalChunks =
    task.result && "total_chunks" in task.result
      ? task.result.total_chunks
      : task.meta?.chunks_count || 0;
  const successfulChunks =
    task.result && "successful_chunks" in task.result
      ? task.result.successful_chunks
      : task.meta?.chunks_processed || 0;

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await cancelTask(task.task_id);
    } catch (error) {
      console.error("Failed to cancel task:", error);
    }
  };

  const handleCardClick = () => {
    setSelectedTask(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    // Determine which ID to use for deletion
    let taskIdToDelete: string | null = null;

    if (backendTask?._id) {
      // Use MongoDB ID if available
      taskIdToDelete = backendTask._id;
    } else if (task.task_id) {
      // Fallback to Celery task ID
      taskIdToDelete = task.task_id;
      console.warn(
        "Using Celery task_id as fallback for deletion:",
        task.task_id
      );
    }

    if (!taskIdToDelete) {
      console.error("Cannot delete task: No valid ID found", {
        backendTask,
        taskId: task.task_id,
      });
      throw new Error("No valid task ID found");
    }

    await deleteTask(taskIdToDelete);
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer border-border bg-card"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {statusConfig.icon}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  {backendTask?.metadata?.file_name ||
                    task.meta?.model_name ||
                    "Embedding Task"}
                </h3>
                <Badge variant="secondary" className={statusConfig.badge}>
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Task ID: {task.task_id.substring(0, 16)}...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isProcessing && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cancel task</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {task.ready && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteClick}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {backendTask
                        ? "Delete task"
                        : "Delete task (MongoDB ID not found)"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Progress Bar */}
        {isProcessing && totalChunks > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {successfulChunks} of {totalChunks} chunks processed
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {task.meta?.provider && (
            <div>
              <span className="text-muted-foreground">Provider:</span>
              <p className="font-medium text-foreground capitalize">
                {task.meta.provider}
              </p>
            </div>
          )}
          {task.meta?.model_name && (
            <div>
              <span className="text-muted-foreground">Model:</span>
              <p className="font-medium text-foreground">
                {task.meta.model_name}
              </p>
            </div>
          )}
          {task.type && (
            <div>
              <span className="text-muted-foreground">Type:</span>
              <p className="font-medium text-foreground capitalize flex items-center gap-1">
                <File className="w-3 h-3" />
                {task.type}
              </p>
            </div>
          )}
          {backendTask?.created_at && (
            <div>
              <span className="text-muted-foreground">Created:</span>
              <p className="font-medium text-foreground">
                {new Date(backendTask.created_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Success Stats - Detailed Embedded Data */}
        {task.status === "SUCCESS" &&
          task.result &&
          "total_chunks" in task.result && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-3 space-y-3">
              {/* Chunks Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <Brain className="w-4 h-4" />
                  <span className="font-medium">
                    {task.result.successful_chunks} / {task.result.total_chunks}{" "}
                    chunks embedded
                  </span>
                </div>
                {task.result.knowledge_store_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to knowledge store page
                      if (
                        task.result &&
                        "knowledge_store_id" in task.result &&
                        task.result.knowledge_store_id
                      ) {
                        navigate(
                          `/dashboard/knowledge-stores/${task.result.knowledge_store_id}`
                        );
                      }
                    }}
                    className="text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900"
                  >
                    <Database className="w-4 h-4 mr-1" />
                    View Data
                  </Button>
                )}
              </div>

              {/* Embedded Data Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Knowledge Store Name (not collection name) */}
                {backendTask?.metadata?.knowledge_store_name && (
                  <div className="flex items-start gap-2">
                    <Database className="w-3 h-3 text-green-600 dark:text-green-500 mt-0.5" />
                    <div>
                      <p className="text-green-600 dark:text-green-500 font-medium">
                        Knowledge Store
                      </p>
                      <p className="text-green-700 dark:text-green-400">
                        {backendTask.metadata.knowledge_store_name}
                      </p>
                    </div>
                  </div>
                )}
                {/* File Name (not file ID) */}
                {backendTask?.metadata?.file_name && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-3 h-3 text-green-600 dark:text-green-500 mt-0.5" />
                    <div>
                      <p className="text-green-600 dark:text-green-500 font-medium">
                        Source File
                      </p>
                      <p className="text-green-700 dark:text-green-400 truncate max-w-[150px]">
                        {backendTask.metadata.file_name}
                      </p>
                    </div>
                  </div>
                )}
                {/* Provider */}
                {task.meta?.provider && (
                  <div className="flex items-start gap-2">
                    <Brain className="w-3 h-3 text-green-600 dark:text-green-500 mt-0.5" />
                    <div>
                      <p className="text-green-600 dark:text-green-500 font-medium">
                        Provider
                      </p>
                      <p className="text-green-700 dark:text-green-400 capitalize">
                        {task.meta.provider}
                      </p>
                    </div>
                  </div>
                )}
                {/* Model Name (not model ID) */}
                {task.meta?.model_name && (
                  <div className="flex items-start gap-2">
                    <Brain className="w-3 h-3 text-green-600 dark:text-green-500 mt-0.5" />
                    <div>
                      <p className="text-green-600 dark:text-green-500 font-medium">
                        Model
                      </p>
                      <p className="text-green-700 dark:text-green-400 truncate max-w-[150px]">
                        {task.meta.model_name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Error Message */}
        {task.status === "FAILURE" && task.error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  Error
                </p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                  {task.error}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Delete Task Modal */}
      <DeleteTaskModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleConfirmDelete}
        taskInfo={{
          taskId: backendTask?._id || task.task_id,
          fileName: backendTask?.metadata?.file_name,
          status: task.status,
        }}
      />
    </Card>
  );
}
