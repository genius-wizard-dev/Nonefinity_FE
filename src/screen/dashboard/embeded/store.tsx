import { create } from "zustand";
import { FileService } from "../file-management/services";
import { EmbeddingService } from "./service";
import type {
  EmbeddingFormData,
  EmbeddingStoreState,
  SearchFormData,
} from "./type";

export const useEmbeddingStore = create<EmbeddingStoreState>((set, get) => ({
  // Initial state
  models: [],
  // activeTasks: [],
  completedTasks: [],
  allowExtractFiles: [],
  loading: false,
  filesLoading: false,
  error: null,
  currentTaskId: null,
  taskStatus: null,
  pollingInterval: null,

  // Fetch models
  fetchModels: async () => {
    set({ loading: true, error: null });
    try {
      const models = await EmbeddingService.getModels();
      set({ models, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch models",
        loading: false,
      });
    }
  },

  // Fetch active tasks
  // fetchActiveTasks: async () => {
  //   set({ loading: true, error: null });
  //   try {
  //     const response = await EmbeddingService.getActiveTasks();
  //     if (response) {
  //       // Ensure active_tasks is always an array
  //       const activeTasks = Array.isArray(response.active_tasks)
  //         ? response.active_tasks
  //         : [];

  //       set({
  //         activeTasks,
  //         loading: false,
  //       });
  //     } else {
  //       set({ activeTasks: [], loading: false });
  //     }
  //   } catch (error) {
  //     set({
  //       error:
  //         error instanceof Error
  //           ? error.message
  //           : "Failed to fetch active tasks",
  //       loading: false,
  //     });
  //   }
  // },

  // Fetch allow extract files
  fetchAllowExtractFiles: async (token?: string) => {
    set({ filesLoading: true, error: null });
    try {
      if (!token) {
        set({
          error: "No token provided for allow extract files",
          filesLoading: false,
        });
        return;
      }

      const files = await FileService.getAllowExtractFiles(token);
      set({ allowExtractFiles: files, filesLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch allow extract files",
        filesLoading: false,
      });
    }
  },

  // Create embedding task
  createEmbedding: async (data: EmbeddingFormData) => {
    set({ error: null });
    try {
      const result = await EmbeddingService.createEmbedding(data);
      if (result.success && result.taskId) {
        // Start polling for this task
        get().startPolling(result.taskId);
      } else {
        set({
          error: result.error || "Failed to create embedding task",
        });
        throw new Error(result.error || "Failed to create embedding task");
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create embedding task",
      });
      throw error;
    }
  },

  // Create search task
  createSearch: async (data: SearchFormData) => {
    set({ error: null });
    try {
      const result = await EmbeddingService.createSearch(data);
      if (result.success && result.taskId) {
        // Set as current task
        set({ currentTaskId: result.taskId });
        // Refresh active tasks
        // await get().fetchActiveTasks();
      } else {
        set({
          error: result.error || "Failed to create search task",
        });
        throw new Error(result.error || "Failed to create search task");
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create search task",
      });
      throw error;
    }
  },

  // Get task status
  getTaskStatus: async (taskId: string) => {
    set({ error: null });
    try {
      const status = await EmbeddingService.getTaskStatus(taskId);
      if (status) {
        set({ taskStatus: status });

        // If task is completed or failed, stop polling and move to completed tasks
        if (status.status === "SUCCESS" || status.status === "FAILURE") {
          get().stopPolling();

          // Add to completed tasks
          const completedTask = {
            id: taskId,
            task_type: "embedding" as const,
            status: (status.status === "SUCCESS" ? "completed" : "failed") as
              | "completed"
              | "failed",
            progress: 100,
            model_id: status.result?.model_id || "unknown",
            created_at: new Date().toISOString(),
            error_message: status.error || undefined,
          };

          set({
            completedTasks: [...get().completedTasks, completedTask],
          });
        }
      } else {
        set({
          error: "Failed to fetch task status",
        });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch task status",
      });
    }
  },

  // Cancel task
  cancelTask: async (taskId: string) => {
    set({ error: null });
    try {
      const result = await EmbeddingService.cancelTask(taskId);
      if (result.success) {
        // Remove from active tasks
        // const { activeTasks } = get();
        // set({
        //   activeTasks: activeTasks.filter((t) => t.id !== taskId),
        // });

        // Clear current task if it's the one being cancelled
        if (get().currentTaskId === taskId) {
          set({ currentTaskId: null, taskStatus: null });
        }
      } else {
        set({
          error: result.error || "Failed to cancel task",
        });
        throw new Error(result.error || "Failed to cancel task");
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to cancel task",
      });
      throw error;
    }
  },

  // Set current task
  setCurrentTask: (taskId: string | null) => {
    set({ currentTaskId: taskId });
    if (taskId) {
      // Fetch status and result for the current task
      get().getTaskStatus(taskId);
    } else {
      set({ taskStatus: null });
    }
  },

  // Clear current task
  clearCurrentTask: () => {
    set({ currentTaskId: null, taskStatus: null });
    get().stopPolling();
  },

  // Start polling for task status
  startPolling: (taskId: string) => {
    // Clear any existing polling
    get().stopPolling();

    // Set current task
    set({ currentTaskId: taskId });

    // Start polling every 15 seconds
    const interval = setInterval(() => {
      get().getTaskStatus(taskId);
    }, 15000);

    set({ pollingInterval: interval });

    // Initial status check
    get().getTaskStatus(taskId);
  },

  // Stop polling
  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  },

  // Utility actions
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
