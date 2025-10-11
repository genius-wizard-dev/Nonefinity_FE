import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmbeddingToast } from "@/components/ui/embedding-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@clerk/clerk-react";
import { XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CreateEmbeddingForm,
  EmbeddingHeader,
  TaskStatusCard,
} from "./components";
import { useEmbeddingStore } from "./store";

export default function EmbeddingPage() {
  const { getToken } = useAuth();

  const {
    models,
    allowExtractFiles,
    loading,
    filesLoading,
    error,
    currentTaskId,
    taskStatus,
    fetchModels,
    fetchAllowExtractFiles,
    createEmbedding,
    getTaskStatus,
    clearCurrentTask,
    stopPolling,
    clearError,
  } = useEmbeddingStore();

  const [embeddingForm, setEmbeddingForm] = useState({
    file_id: "",
    model_id: "",
    metadata: {},
  });

  const [isCreating, setIsCreating] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const token = await getToken();
      if (token) {
        await Promise.all([fetchModels(), fetchAllowExtractFiles(token)]);
      }
    };
    loadData();
  }, [getToken, fetchModels, fetchAllowExtractFiles]);

  // Watch for task status changes and show toasts
  useEffect(() => {
    if (taskStatus && previousStatus !== taskStatus.status) {
      const progress = taskStatus.result
        ? Math.round(
            (taskStatus.result.successful_chunks /
              taskStatus.result.total_chunks) *
              100
          )
        : 0;

      switch (taskStatus.status) {
        case "PENDING":
        case "STARTED":
        case "PROGRESS":
          toast.custom(
            () => (
              <EmbeddingToast
                status={taskStatus.status}
                progress={progress}
                totalChunks={taskStatus.result?.total_chunks || 0}
                successfulChunks={taskStatus.result?.successful_chunks || 0}
              />
            ),
            {
              duration: Infinity, // Keep showing until status changes
              id: "embedding-progress", // Use same ID to replace previous toast
            }
          );
          break;
        case "SUCCESS":
        case "FAILURE":
        case "REVOKED":
          toast.custom(
            () => (
              <EmbeddingToast
                status={taskStatus.status}
                progress={progress}
                totalChunks={taskStatus.result?.total_chunks || 0}
                successfulChunks={taskStatus.result?.successful_chunks || 0}
              />
            ),
            {
              duration: 5000,
              id: "embedding-progress",
            }
          );
          break;
      }
      setPreviousStatus(taskStatus.status);
    }
  }, [taskStatus, previousStatus]);

  // Track polling status
  useEffect(() => {
    setIsPolling(
      !!currentTaskId &&
        taskStatus?.status !== "SUCCESS" &&
        taskStatus?.status !== "FAILURE"
    );
  }, [currentTaskId, taskStatus]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      // Stop polling when component unmounts
      stopPolling();
      // Dismiss the embedding toast
      toast.dismiss("embedding-progress");
    };
  }, [stopPolling]);

  // Dismiss toast when polling stops
  useEffect(() => {
    if (!isPolling) {
      toast.dismiss("embedding-progress");
    }
  }, [isPolling]);

  const handleCreateEmbedding = async () => {
    if (!embeddingForm.file_id) {
      toast.error("Please select a file");
      return;
    }

    setIsCreating(true);

    try {
      const formData = {
        file_id: embeddingForm.file_id,
        ...(embeddingForm.model_id &&
          embeddingForm.model_id !== "default" && {
            model_id: embeddingForm.model_id,
          }),
        metadata: embeddingForm.metadata,
      };

      await createEmbedding(formData);
      toast.success("Embedding task created successfully!");

      setEmbeddingForm({ file_id: "", model_id: "", metadata: {} });
    } catch (error) {
      console.error("Failed to create embedding task:", error);
      toast.error("Failed to create embedding task");
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "FAILURE":
        return "bg-red-100 text-red-800";
      case "PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "STARTED":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "RETRY":
        return "bg-orange-100 text-orange-800";
      case "REVOKED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <EmbeddingHeader
        loading={loading}
        onRefreshModels={fetchModels}
        onRefreshFiles={fetchAllowExtractFiles}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              <XCircle className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Embedding</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* Create Embedding Tab */}
        <TabsContent value="create" className="space-y-6">
          <CreateEmbeddingForm
            embeddingForm={embeddingForm}
            setEmbeddingForm={setEmbeddingForm}
            models={models}
            allowExtractFiles={allowExtractFiles}
            filesLoading={filesLoading}
            loading={loading}
            isCreating={isCreating || isPolling}
            onCreateEmbedding={handleCreateEmbedding}
          />
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {/* Current Task Status & Results */}
          {currentTaskId && (
            <div className="max-w-4xl mx-auto">
              <TaskStatusCard
                currentTaskId={currentTaskId}
                taskStatus={
                  taskStatus
                    ? { ...taskStatus, error: taskStatus.error ?? undefined }
                    : null
                }
                loading={loading}
                onRefreshStatus={() => {
                  // Only refresh if not already successful
                  if (!taskStatus || taskStatus.status !== "SUCCESS") {
                    getTaskStatus(currentTaskId);
                  }
                }}
                onClearTask={clearCurrentTask}
                getStatusColor={getStatusColor}
              />
            </div>
          )}
          {/* Completed Tasks */}
          {/* <CompletedTasksList
            completedTasks={completedTasks}
            onTaskClick={handleTaskClick}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
          /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
