import { toast } from "sonner";
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { EmbeddingService } from "./services";
import type {
  BackendTask,
  CreateFileEmbeddingRequest,
  CreateTextEmbeddingRequest,
  EmbeddingTask,
  EmbeddingTaskFilters,
  EmbeddingType,
  TasksListRequest,
} from "./types";

interface EmbeddingStoreState {
  // Data
  tasks: EmbeddingTask[];
  activeTasks: Map<string, EmbeddingTask>;
  activeToasts: Map<string, string>; // taskId -> toastId mapping

  // Backend tasks data
  backendTasks: BackendTask[];
  totalTasks: number;
  currentPage: number;
  pageSize: number;

  // UI State
  loading: boolean;
  error: string | null;
  filters: EmbeddingTaskFilters;
  showCreateDialog: boolean;
  selectedTask: EmbeddingTask | null;

  // Actions
  createFileEmbedding: (data: CreateFileEmbeddingRequest) => Promise<void>;
  createTextEmbedding: (data: CreateTextEmbeddingRequest) => Promise<void>;
  cancelTask: (taskId: string) => Promise<void>;
  refreshTaskStatus: (taskId: string) => Promise<void>;
  startPolling: (taskId: string) => Promise<void>;

  // New API Actions
  fetchTasks: (params?: TasksListRequest) => Promise<void>;
  refreshTasks: () => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  clearTasks: (
    clearType: "all" | "success" | "failed" | "completed"
  ) => Promise<void>;

  // UI Actions
  setFilters: (filters: Partial<EmbeddingTaskFilters>) => void;
  setShowCreateDialog: (show: boolean) => void;
  setSelectedTask: (task: EmbeddingTask | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Reset
  resetState: () => void;
}

// Helper function to convert backend task_type to frontend EmbeddingType
const getEmbeddingTypeFromBackendTaskType = (
  taskType: string
): EmbeddingType => {
  switch (taskType) {
    case "text_embedding":
      return "text";
    case "embedding":
      return "file";
    case "search":
      return "file"; // Search tasks are typically file-based
    default:
      return "file"; // Default fallback
  }
};

const initialState = {
  tasks: [],
  activeTasks: new Map<string, EmbeddingTask>(),
  activeToasts: new Map<string, string>(),
  backendTasks: [],
  totalTasks: 0,
  currentPage: 0,
  pageSize: 50,
  loading: false,
  error: null,
  filters: {},
  showCreateDialog: false,
  selectedTask: null,
};

export const useEmbeddingStore = create<EmbeddingStoreState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // Create file embedding task
      createFileEmbedding: async (data: CreateFileEmbeddingRequest) => {
        set({ loading: true, error: null });

        try {
          const response = await EmbeddingService.createFileEmbedding(data);

          // Add to active tasks
          const task: EmbeddingTask = {
            task_id: response.task_id,
            status: "PENDING",
            type: "file", // This will be corrected when backend data is fetched
            ready: false,
            successful: false,
            failed: false,
            meta: response.metadata,
            created_at: new Date().toISOString(),
          };

          const currentState = get();
          const newActiveTasks = new Map(currentState.activeTasks);
          newActiveTasks.set(response.task_id, task);

          set({
            activeTasks: newActiveTasks,
            tasks: [task, ...currentState.tasks],
            loading: false,
            error: null,
          });

          // Show toast notification
          const toastId = toast.loading("Embedding task started", {
            description: `Processing file...`,
          }) as string;

          // Store toast ID
          const newActiveToasts = new Map(currentState.activeToasts);
          newActiveToasts.set(response.task_id, toastId);
          set({ activeToasts: newActiveToasts });

          // Start polling in background
          get().startPolling(response.task_id);
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to create file embedding",
          });
          throw error;
        }
      },

      // Create text embedding task
      createTextEmbedding: async (data: CreateTextEmbeddingRequest) => {
        set({ loading: true, error: null });

        try {
          const response = await EmbeddingService.createTextEmbedding(data);

          // Add to active tasks
          const task: EmbeddingTask = {
            task_id: response.task_id,
            status: "PENDING",
            type: "text", // This will be corrected when backend data is fetched
            ready: false,
            successful: false,
            failed: false,
            meta: response.metadata,
            created_at: new Date().toISOString(),
          };

          const currentState = get();
          const newActiveTasks = new Map(currentState.activeTasks);
          newActiveTasks.set(response.task_id, task);

          set({
            activeTasks: newActiveTasks,
            tasks: [task, ...currentState.tasks],
            loading: false,
            error: null,
          });

          // Show toast notification
          const toastId = toast.loading("Text embedding task started", {
            description: `Processing text...`,
          }) as string;

          // Store toast ID
          const newActiveToasts = new Map(currentState.activeToasts);
          newActiveToasts.set(response.task_id, toastId);
          set({ activeToasts: newActiveToasts });

          // Start polling in background
          get().startPolling(response.task_id);
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to create text embedding",
          });
          throw error;
        }
      },

      // Cancel task
      cancelTask: async (taskId: string) => {
        try {
          await EmbeddingService.cancelTask(taskId);

          const currentState = get();
          const newActiveTasks = new Map(currentState.activeTasks);
          const task = newActiveTasks.get(taskId);

          if (task) {
            task.status = "REVOKED";
            task.ready = true;
            task.failed = true;
            newActiveTasks.set(taskId, task);

            // Update tasks list
            const updatedTasks = currentState.tasks.map((t) =>
              t.task_id === taskId ? task : t
            );

            set({
              activeTasks: newActiveTasks,
              tasks: updatedTasks,
            });

            // Dismiss toast
            const toastId = currentState.activeToasts.get(taskId);
            if (toastId) {
              toast.dismiss(toastId);
            }
          }
        } catch (error) {
          console.error("Failed to cancel task:", error);
          throw error;
        }
      },

      // Refresh single task status
      refreshTaskStatus: async (taskId: string) => {
        try {
          const taskData = await EmbeddingService.getTaskStatus(taskId);

          // ✨ Use task_type from polling API if available, otherwise fallback to existing logic
          const currentState = get();
          const existingTask =
            currentState.activeTasks.get(taskId) ||
            currentState.tasks.find((t) => t.task_id === taskId);
          const backendTask = currentState.backendTasks.find(
            (bt) => bt.task_id === taskId
          );

          // ✨ Determine type from polling API first, then fallback
          let taskType: EmbeddingType;
          if (taskData.task_type) {
            taskType = getEmbeddingTypeFromBackendTaskType(taskData.task_type);
          } else if (backendTask) {
            taskType = getEmbeddingTypeFromBackendTaskType(
              backendTask.task_type
            );
          } else {
            taskType = existingTask?.type || "file";
          }

          const task: EmbeddingTask = {
            task_id: taskData.task_id,
            status: taskData.status,
            type: taskType,
            ready: taskData.ready,
            successful: taskData.successful,
            failed: taskData.failed,
            result: taskData.result,
            error: taskData.error,
            meta: taskData.meta,
            created_at: taskData.created_at,
          };

          const newActiveTasks = new Map(currentState.activeTasks);

          if (task.ready) {
            // Task completed, remove from active tasks
            newActiveTasks.delete(taskId);

            // ✨ Update tasks list immediately with completed task
            const updatedTasks = currentState.tasks.map((t) =>
              t.task_id === taskId ? task : t
            );

            set({
              activeTasks: newActiveTasks,
              tasks: updatedTasks,
            });

            // ✨ If task completed successfully, fetch fresh task list from backend
            if (task.successful) {
              setTimeout(() => {
                get()
                  .refreshTasks()
                  .catch((error) => {
                    console.error(
                      "Failed to refresh tasks after completion:",
                      error
                    );
                  });
              }, 1000); // Wait 1 second for backend to process
            }
          } else {
            // Still active
            newActiveTasks.set(taskId, task);
            // Update tasks list
            const updatedTasks = currentState.tasks.map((t) =>
              t.task_id === taskId ? task : t
            );
            set({
              activeTasks: newActiveTasks,
              tasks: updatedTasks,
            });
          }
        } catch (error) {
          console.error("Failed to refresh task status:", error);
          throw error;
        }
      },

      // Start polling for a task
      startPolling: async (taskId: string) => {
        try {
          await EmbeddingService.pollTaskStatus(taskId, {
            interval: 2000,
            maxAttempts: 150,
            onProgress: (task) => {
              const currentState = get();

              // ✨ Use task_type from polling API if available, otherwise preserve existing type
              const existingTask =
                currentState.activeTasks.get(taskId) ||
                currentState.tasks.find((t) => t.task_id === taskId);
              const backendTask = currentState.backendTasks.find(
                (bt) => bt.task_id === taskId
              );

              // ✨ Determine type from polling API first, then fallback
              let taskType: EmbeddingType;
              if ((task as any).task_type) {
                taskType = getEmbeddingTypeFromBackendTaskType(
                  (task as any).task_type
                );
              } else if (backendTask) {
                taskType = getEmbeddingTypeFromBackendTaskType(
                  backendTask.task_type
                );
              } else {
                taskType = existingTask?.type || task.type;
              }

              const correctedTask = {
                ...task,
                type: taskType,
              };

              const newActiveTasks = new Map(currentState.activeTasks);
              newActiveTasks.set(taskId, correctedTask);

              // Update tasks list
              const updatedTasks = currentState.tasks.map((t) =>
                t.task_id === taskId ? correctedTask : t
              );

              set({
                activeTasks: newActiveTasks,
                tasks: updatedTasks,
              });

              // Update toast
              const toastId = currentState.activeToasts.get(taskId);
              if (toastId) {
                toast.dismiss(toastId);
              }

              const progress = task.meta?.progress || 0;
              const newToastId = toast.loading(
                `Embedding task: ${task.status}`,
                {
                  description: `Progress: ${progress}%`,
                }
              ) as string;

              const newActiveToasts = new Map(currentState.activeToasts);
              newActiveToasts.set(taskId, newToastId);
              set({ activeToasts: newActiveToasts });

              // If task is completed, show success/error toast
              if (correctedTask.ready) {
                toast.dismiss(newToastId);

                if (correctedTask.successful) {
                  toast.success("Embedding completed", {
                    description: `Successfully processed ${
                      correctedTask.result &&
                      "total_chunks" in correctedTask.result
                        ? correctedTask.result.total_chunks
                        : 0
                    } chunks`,
                  });

                  // ✨ Update tasks list immediately with completed task before fetching
                  const currentState = get();
                  const updatedTasks = currentState.tasks.map((t) =>
                    t.task_id === taskId ? correctedTask : t
                  );
                  set({ tasks: updatedTasks });

                  // ✨ Then fetch fresh task list from backend (with delay to allow backend to save)
                  setTimeout(() => {
                    get()
                      .refreshTasks()
                      .catch((error) => {
                        console.error(
                          "Failed to refresh tasks after completion:",
                          error
                        );
                      });
                  }, 1000); // Wait 1 second for backend to process
                } else {
                  toast.error("Embedding failed", {
                    description: correctedTask.error || "Unknown error",
                  });
                }

                // Remove from active tasks and toasts
                const currentState = get();
                const newActiveTasks = new Map(currentState.activeTasks);
                const newActiveToasts = new Map(currentState.activeToasts);
                newActiveTasks.delete(taskId);
                newActiveToasts.delete(taskId);
                set({
                  activeTasks: newActiveTasks,
                  activeToasts: newActiveToasts,
                });
              }
            },
          });
        } catch (error) {
          console.error("Polling failed:", error);

          // Update task as failed
          const currentState = get();
          const task = currentState.activeTasks.get(taskId);
          if (task) {
            task.status = "FAILURE";
            task.ready = true;
            task.failed = true;
            task.error =
              error instanceof Error ? error.message : "Unknown error";

            const newActiveTasks = new Map(currentState.activeTasks);
            newActiveTasks.delete(taskId);

            const updatedTasks = currentState.tasks.map((t) =>
              t.task_id === taskId ? task : t
            );

            set({
              activeTasks: newActiveTasks,
              tasks: updatedTasks,
            });

            // Show error toast
            const toastId = currentState.activeToasts.get(taskId);
            if (toastId) {
              toast.dismiss(toastId);
            }

            toast.error("Embedding failed", {
              description:
                error instanceof Error ? error.message : "Unknown error",
            });

            // Remove from active toasts
            const newActiveToasts = new Map(currentState.activeToasts);
            newActiveToasts.delete(taskId);
            set({ activeToasts: newActiveToasts });
          }
        }
      },

      // New API Actions
      fetchTasks: async (params?: TasksListRequest) => {
        set({ loading: true, error: null });

        try {
          const currentState = get();
          const response = await EmbeddingService.getTasks({
            skip:
              params?.skip ?? currentState.currentPage * currentState.pageSize,
            limit: params?.limit ?? currentState.pageSize,
            status: params?.status,
            task_type: params?.task_type,
          });

          // ✨ Convert backend tasks to frontend tasks format
          const frontendTasks: EmbeddingTask[] = response.tasks.map(
            (backendTask) => ({
              task_id: backendTask.task_id,
              status: backendTask.status as any,
              type: getEmbeddingTypeFromBackendTaskType(backendTask.task_type),
              ready:
                backendTask.status === "SUCCESS" ||
                backendTask.status === "FAILURE" ||
                backendTask.status === "ERROR",
              successful: backendTask.status === "SUCCESS",
              failed:
                backendTask.status === "FAILURE" ||
                backendTask.status === "ERROR",
              result: backendTask.metadata?.result || undefined,
              error: backendTask.error || undefined,
              meta: {
                user_id: backendTask.user_id,
                model_name:
                  backendTask.metadata?.model_name ||
                  backendTask.model_id ||
                  "Unknown",
                model_identifier: backendTask.model_id || "Unknown",
                provider: backendTask.provider || "Unknown",
                progress: 100,
                processing_time: 0, // Will be calculated from created_at/updated_at if needed
              },
            })
          );

          set({
            backendTasks: response.tasks,
            tasks: frontendTasks, // ✨ Update frontend tasks
            totalTasks: response.total,
            loading: false,
            error: null,
          });
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error ? error.message : "Failed to fetch tasks",
          });
          console.error("Failed to fetch tasks:", error);
        }
      },

      refreshTasks: async () => {
        const currentState = get();

        // ✨ Fetch tasks with max limit allowed by backend (100)
        await get().fetchTasks({
          skip: currentState.currentPage * currentState.pageSize,
          limit: currentState.pageSize,
        });

        // ✨ After fetching, merge active tasks that might not be in backend yet
        const freshState = get();
        const activeTasksArray = Array.from(currentState.activeTasks.values());

        // Merge: Keep active tasks that are still running and not in backend tasks yet
        const mergedTasks = [...freshState.tasks];
        activeTasksArray.forEach((activeTask) => {
          const existsInFreshTasks = freshState.tasks.find(
            (t) => t.task_id === activeTask.task_id
          );
          if (!existsInFreshTasks) {
            // Add active task to the beginning of the list
            mergedTasks.unshift(activeTask);
          } else {
            // ✨ Update active task with backend data (especially task type)
            const backendTask = freshState.backendTasks.find(
              (bt) => bt.task_id === activeTask.task_id
            );
            if (backendTask) {
              const updatedActiveTask = {
                ...activeTask,
                type: getEmbeddingTypeFromBackendTaskType(
                  backendTask.task_type
                ),
              };
              currentState.activeTasks.set(
                activeTask.task_id,
                updatedActiveTask
              );
            }
          }
        });

        set({
          tasks: mergedTasks,
          activeTasks: currentState.activeTasks,
        });
      },

      // Delete single task
      deleteTask: async (taskId: string) => {
        set({ loading: true, error: null });

        try {
          // ✨ Wait for API call to succeed before updating UI
          const result = await EmbeddingService.deleteTask(taskId);

          // Only update UI if API call was successful
          if (result.deleted) {
            // Remove from backendTasks list
            const currentState = get();
            const updatedTasks = currentState.backendTasks.filter(
              (t) => t._id !== taskId
            );

            set({
              backendTasks: updatedTasks,
              totalTasks: currentState.totalTasks - 1,
              loading: false,
              error: null,
            });

            toast.success("Task deleted successfully");
          } else {
            throw new Error("Task deletion failed");
          }
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error ? error.message : "Failed to delete task",
          });
          toast.error(
            error instanceof Error ? error.message : "Failed to delete task"
          );
          throw error;
        }
      },

      // Clear multiple tasks
      clearTasks: async (
        clearType: "all" | "success" | "failed" | "completed"
      ) => {
        set({ loading: true, error: null });

        try {
          const result = await EmbeddingService.clearTasks(clearType);

          // Refresh tasks list
          await get().refreshTasks();

          set({
            loading: false,
            error: null,
          });

          toast.success(`Successfully deleted ${result.deleted_count} task(s)`);
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error ? error.message : "Failed to clear tasks",
          });
          toast.error(
            error instanceof Error ? error.message : "Failed to clear tasks"
          );
          throw error;
        }
      },

      // UI Actions
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      setShowCreateDialog: (show) => {
        set({ showCreateDialog: show });
      },

      setSelectedTask: (task) => {
        set({ selectedTask: task });
      },

      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error });
      },

      setPage: (page) => {
        set({ currentPage: page });
        get().refreshTasks();
      },

      setPageSize: (pageSize) => {
        // Ensure pageSize doesn't exceed backend limit (100)
        const validPageSize = Math.min(pageSize, 100);
        set({ pageSize: validPageSize, currentPage: 0 });
        get().refreshTasks();
      },

      // Reset state
      resetState: () => {
        // Dismiss all active toasts
        const currentState = get();
        currentState.activeToasts.forEach((toastId) => {
          toast.dismiss(toastId);
        });

        set(initialState);
      },
    })),
    {
      name: "embedding-store",
    }
  )
);

// Optimized selectors with shallow equality to prevent unnecessary re-renders
export const useTasks = () => useEmbeddingStore((state) => state.tasks);
export const useBackendTasks = () =>
  useEmbeddingStore((state) => state.backendTasks);
export const useTotalTasks = () =>
  useEmbeddingStore((state) => state.totalTasks);
export const useCurrentPage = () =>
  useEmbeddingStore((state) => state.currentPage);
export const usePageSize = () => useEmbeddingStore((state) => state.pageSize);
export const useActiveTasks = () =>
  useEmbeddingStore((state) => state.activeTasks);
export const useLoading = () => useEmbeddingStore((state) => state.loading);
export const useError = () => useEmbeddingStore((state) => state.error);
export const useSelectedTask = () =>
  useEmbeddingStore((state) => state.selectedTask);
export const useShowCreateDialog = () =>
  useEmbeddingStore((state) => state.showCreateDialog);

// Combined selectors to reduce re-renders
export const useTasksData = () =>
  useEmbeddingStore(
    useShallow((state) => ({
      tasks: state.tasks,
      backendTasks: state.backendTasks,
      totalTasks: state.totalTasks,
      loading: state.loading,
      error: state.error,
    }))
  );

export const useUIState = () =>
  useEmbeddingStore(
    useShallow((state) => ({
      showCreateDialog: state.showCreateDialog,
      selectedTask: state.selectedTask,
      currentPage: state.currentPage,
      pageSize: state.pageSize,
    }))
  );

// Action selectors with shallow equality to prevent infinite loops
export const useEmbeddingActions = () =>
  useEmbeddingStore(
    useShallow((state) => ({
      createFileEmbedding: state.createFileEmbedding,
      createTextEmbedding: state.createTextEmbedding,
      cancelTask: state.cancelTask,
      refreshTaskStatus: state.refreshTaskStatus,
      fetchTasks: state.fetchTasks,
      refreshTasks: state.refreshTasks,
      deleteTask: state.deleteTask,
      clearTasks: state.clearTasks,
      setShowCreateDialog: state.setShowCreateDialog,
      setSelectedTask: state.setSelectedTask,
      setFilters: state.setFilters,
      setPage: state.setPage,
      setPageSize: state.setPageSize,
      resetState: state.resetState,
    }))
  );
