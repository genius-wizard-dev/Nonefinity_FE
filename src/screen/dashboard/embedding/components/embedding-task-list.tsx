import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, Zap } from "lucide-react";
import { memo, useMemo } from "react";
import { useTasksData } from "../store";
import type {
  BackendTask,
  EmbeddingTask,
  EmbeddingTaskFilters,
} from "../types";
import { EmbeddingTaskCard } from "./embedding-task-card";

interface EmbeddingTaskListProps {
  filters?: EmbeddingTaskFilters;
  onClearFilters?: () => void;
}

// Helper to convert BackendTask to EmbeddingTask
const convertBackendTaskToEmbeddingTask = (
  backendTask: BackendTask
): EmbeddingTask => {
  return {
    task_id: backendTask.task_id,
    status: backendTask.status as any,
    type: backendTask.task_type === "text_embedding" ? "text" : "file",
    ready: ["SUCCESS", "FAILURE", "CANCELLED", "REVOKED", "ERROR"].includes(
      backendTask.status
    ),
    successful: backendTask.status === "SUCCESS",
    failed: ["FAILURE", "ERROR"].includes(backendTask.status),
    result: backendTask.metadata?.result,
    error: backendTask.error || undefined,
    meta: {
      user_id: backendTask.user_id,
      model_name: backendTask.metadata?.model_name || "",
      model_identifier: backendTask.model_id || "",
      provider: backendTask.provider || "",
      file_id: backendTask.file_id || undefined,
      ...backendTask.metadata,
    },
    created_at: backendTask.created_at,
    knowledge_store_name: backendTask.metadata?.collection_name,
  };
};

export const EmbeddingTaskList = memo(function EmbeddingTaskList({
  filters = {},
  onClearFilters,
}: EmbeddingTaskListProps) {
  const { tasks: localTasks, backendTasks, loading } = useTasksData();

  // Combine and convert backend tasks
  const allTasks = useMemo(() => {
    const convertedBackendTasks = backendTasks.map(
      convertBackendTaskToEmbeddingTask
    );
    // Merge with local tasks, avoid duplicates
    const localTaskIds = new Set(localTasks.map((t) => t.task_id));
    const uniqueBackendTasks = convertedBackendTasks.filter(
      (t) => !localTaskIds.has(t.task_id)
    );
    return [...localTasks, ...uniqueBackendTasks];
  }, [localTasks, backendTasks]);

  const tasks = allTasks;

  // Filter tasks based on filters
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by status
    if (filters.status) {
      result = result.filter((task) => task.status === filters.status);
    }

    // Filter by type
    if (filters.type) {
      result = result.filter((task) => task.type === filters.type);
    }

    // Filter by search query
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (task) =>
          task.task_id.toLowerCase().includes(searchLower) ||
          task.file_name?.toLowerCase().includes(searchLower) ||
          task.model_name?.toLowerCase().includes(searchLower) ||
          task.meta?.model_name?.toLowerCase().includes(searchLower) ||
          task.meta?.provider?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [tasks, filters]);

  // Sort tasks by created_at (newest first)
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  }, [filteredTasks]);

  // Group tasks by status
  const activeTasksCount = useMemo(
    () =>
      sortedTasks.filter(
        (task) =>
          task.status === "PENDING" ||
          task.status === "STARTED" ||
          task.status === "PROGRESS"
      ).length,
    [sortedTasks]
  );

  const completedTasksCount = useMemo(
    () => sortedTasks.filter((task) => task.status === "SUCCESS").length,
    [sortedTasks]
  );

  const failedTasksCount = useMemo(
    () => sortedTasks.filter((task) => task.status === "FAILURE").length,
    [sortedTasks]
  );

  // Check if there are any active filters
  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.type
  );

  // Show skeleton when loading
  if (loading) {
    return <EmbeddingTaskListSkeleton />;
  }

  // If no tasks at all and no filters, let the toolbar handle the empty state
  if (tasks.length === 0 && !hasActiveFilters) {
    return null;
  }

  // If tasks exist but none match filters, show filtered empty state
  if (sortedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Inbox className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Tasks Match Your Filters
        </h3>
        <p className="text-muted-foreground max-w-md">
          No tasks match your current search criteria. Try adjusting your
          filters or search terms.
        </p>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => {
              onClearFilters?.();
            }}
          >
            Clear All Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold text-foreground">
                {sortedTasks.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-foreground">
                {activeTasksCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground">
                {completedTasksCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
              <Zap className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-foreground">
                {failedTasksCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedTasks.map((task) => (
          <EmbeddingTaskCard key={task.task_id} task={task} />
        ))}
      </div>
    </div>
  );
});

// Skeleton component for loading state
function EmbeddingTaskListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border border-border">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Task Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex justify-between text-xs">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
