import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ModelService } from "./service";
import type {
  CreateModelRequest,
  Model,
  ModelCredential,
  ModelFilters,
  ModelListParams,
  ModelStats,
  UpdateModelRequest,
} from "./type";

interface ModelState {
  // Data
  models: Model[];
  selectedModel: Model | null;
  stats: ModelStats | null;
  modelCredentials: ModelCredential[];
  modelCredentialLoading: boolean;
  // Form state for model creation
  formData: {
    credential_id: string;
    name: string;
    model: string;
    type: "chat" | "embedding";
    description: string;
    is_active: boolean;
  };
  // UI State - separate loading states
  loading: boolean; // for initial fetch
  error: string | null;
  filters: ModelFilters;
  pagination: {
    skip: number;
    limit: number;
    total: number;
  };

  // Model actions
  fetchModels: (params?: ModelListParams) => Promise<void>;
  fetchModelStats: () => Promise<void>;
  fetchDefaultModel: (modelType: "chat" | "embedding") => Promise<void>;
  fetchModel: (modelId: string) => Promise<void>;
  createModel: (data: CreateModelRequest) => Promise<void>;
  updateModel: (modelId: string, data: UpdateModelRequest) => Promise<void>;
  deleteModel: (modelId: string) => Promise<void>;
  fetchModelsByCredential: (credentialId: string) => Promise<void>;
  fetchModelCredential: (credentialId: string) => Promise<void>;
  // Form actions
  setFormData: (field: string, value: any) => void;
  resetFormData: () => void;
  // UI actions
  setSelectedModel: (model: Model | null) => void;
  setFilters: (filters: Partial<ModelFilters>) => void;
  setPagination: (
    pagination: Partial<{ skip: number; limit: number; total: number }>
  ) => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  models: [],
  selectedModel: null,
  stats: null,
  loading: false,
  error: null,
  filters: {
    type: "all" as const,
    credential_id: undefined,
    active_only: false,
    search: "",
  },
  pagination: {
    skip: 0,
    limit: 20,
    total: 0,
  },
  modelCredentials: [],
  modelCredentialLoading: false,
  formData: {
    credential_id: "",
    name: "",
    model: "",
    type: "chat" as const,
    description: "",
    is_active: true,
  },
};

export const useModelStore = create<ModelState>()(
  devtools(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Model actions
      fetchModels: async (params?: ModelListParams) => {
        set({ loading: true, error: null });
        try {
          const { filters, pagination } = get();
          const queryParams: ModelListParams = {
            skip: pagination.skip,
            limit: pagination.limit,
            ...(filters.type !== "all" && { type: filters.type }),
            ...(filters.credential_id && {
              credential_id: filters.credential_id,
            }),
            ...(filters.active_only !== undefined && {
              active_only: filters.active_only,
            }),
            ...params,
          };

          const response = await ModelService.listModels(queryParams);
          if (response) {
            set({
              models: response.models,
              pagination: {
                skip: response.skip,
                limit: response.limit,
                total: response.total,
              },
              loading: false,
            });
          } else {
            set({ models: [], loading: false });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch models",
            loading: false,
          });
        }
      },

      fetchModelStats: async () => {
        // Don't set loading for stats - it's a background operation
        try {
          const stats = await ModelService.getModelStats();
          if (stats) {
            set({ stats });
          }
        } catch (error) {
          console.error("Failed to fetch model stats:", error);
        }
      },

      fetchDefaultModel: async (modelType: "chat" | "embedding") => {
        set({ loading: true, error: null });
        try {
          const model = await ModelService.getDefaultModel(modelType);
          if (model) {
            set({ selectedModel: model, loading: false });
          } else {
            set({ selectedModel: null, loading: false });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch default model",
            loading: false,
          });
        }
      },

      fetchModel: async (modelId: string) => {
        set({ loading: true, error: null });
        try {
          const model = await ModelService.getModel(modelId);
          if (model) {
            set({ selectedModel: model, loading: false });
          } else {
            set({ selectedModel: null, loading: false });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch model",
            loading: false,
          });
        }
      },

      createModel: async (data: CreateModelRequest) => {
        set({ error: null });
        try {
          const result = await ModelService.createModel(data);
          if (result.success) {
            // Refresh the models list and stats
            await get().fetchModels();
            get().fetchModelStats();
          } else {
            set({
              error: result.error || "Failed to create model",
            });
            throw new Error(result.error || "Failed to create model");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to create model",
          });
          throw error;
        }
      },

      updateModel: async (modelId: string, data: UpdateModelRequest) => {
        set({ error: null });

        // Store original models for rollback
        const originalModels = get().models;
        const originalSelectedModel = get().selectedModel;

        // Optimistic update - update UI immediately
        set((state) => ({
          models: state.models.map((model) =>
            model.id === modelId ? { ...model, ...data } : model
          ),
          selectedModel:
            state.selectedModel?.id === modelId
              ? { ...state.selectedModel, ...data }
              : state.selectedModel,
        }));

        try {
          const result = await ModelService.updateModel(modelId, data);
          if (result.success) {
            // Success - optionally refresh stats if needed
            get().fetchModelStats();
          } else {
            // Revert on error
            set({
              models: originalModels,
              selectedModel: originalSelectedModel,
              error: result.error || "Failed to update model",
            });
            throw new Error(result.error || "Failed to update model");
          }
        } catch (error) {
          // Revert on error
          set({
            models: originalModels,
            selectedModel: originalSelectedModel,
            error:
              error instanceof Error ? error.message : "Failed to update model",
          });
          throw error;
        }
      },

      deleteModel: async (modelId: string) => {
        set({ error: null });

        // Store original models for rollback
        const originalModels = get().models;

        // Optimistic update - remove from UI immediately
        set((state) => ({
          models: state.models.filter((model) => model.id !== modelId),
        }));

        // Clear selected model if it was deleted
        if (get().selectedModel?.id === modelId) {
          set({ selectedModel: null });
        }

        try {
          const result = await ModelService.deleteModel(modelId);
          if (result.success) {
            // Success - refresh stats
            get().fetchModelStats();
          } else {
            // Revert on error
            set({
              models: originalModels,
              error: result.error || "Failed to delete model",
            });
            throw new Error(result.error || "Failed to delete model");
          }
        } catch (error) {
          // Revert on error
          set({
            models: originalModels,
            error:
              error instanceof Error ? error.message : "Failed to delete model",
          });
          throw error;
        }
      },

      fetchModelsByCredential: async (credentialId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await ModelService.getModelsByCredential(
            credentialId
          );
          if (response) {
            set({
              models: response.models,
              pagination: {
                skip: response.skip,
                limit: response.limit,
                total: response.total,
              },
              loading: false,
            });
          } else {
            set({ models: [], loading: false });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch models by credential",
            loading: false,
          });
        }
      },

      fetchModelCredential: async (credentialId: string) => {
        set({ modelCredentialLoading: true, error: null });
        try {
          const response = await ModelService.getModelCredential(credentialId);
          if (response) {
            set({ modelCredentials: response, modelCredentialLoading: false });
          } else {
            set({ modelCredentials: [], modelCredentialLoading: false });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch model credential",
            modelCredentialLoading: false,
          });
        }
      },

      // Form actions
      setFormData: (field: string, value: any) => {
        set((state) => ({
          formData: { ...state.formData, [field]: value },
        }));

        // If credential_id changes, fetch model credentials and reset model field
        if (field === "credential_id") {
          if (value) {
            get().fetchModelCredential(value);
          }
          // Reset model field when credential changes
          set((state) => ({
            formData: { ...state.formData, model: "" },
          }));
        }
      },

      resetFormData: () => {
        set({
          formData: {
            credential_id: "",
            name: "",
            model: "",
            type: "chat",
            description: "",
            is_active: true,
          },
          modelCredentials: [],
        });
      },

      // UI actions
      setSelectedModel: (model) => set({ selectedModel: model }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
          pagination: { ...state.pagination, skip: 0 }, // Reset to first page when filters change
        })),

      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),

      // Utility actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      reset: () => set(initialState),
    }),
    {
      name: "model-store",
    }
  )
);

// Selectors
export const useModelSelectors = () => {
  const store = useModelStore();

  return {
    // Data selectors
    models: store.models,
    selectedModel: store.selectedModel,
    stats: store.stats,
    modelCredentials: store.modelCredentials,
    modelCredentialLoading: store.modelCredentialLoading,
    formData: store.formData,

    // UI selectors
    loading: store.loading,
    error: store.error,
    filters: store.filters,
    pagination: store.pagination,

    // Computed selectors
    filteredModels: (store.models || []).filter((model) => {
      const { type, credential_id, active_only, search } = store.filters;

      if (type !== "all" && model.type !== type) return false;
      if (credential_id && model.credential_id !== credential_id) return false;
      if (active_only && !model.is_active) return false;
      if (
        search &&
        !model.name.toLowerCase().includes(search.toLowerCase()) &&
        !model.model.toLowerCase().includes(search.toLowerCase())
      )
        return false;

      return true;
    }),

    chatModels: (store.models || []).filter((model) => model.type === "chat"),
    embeddingModels: (store.models || []).filter(
      (model) => model.type === "embedding"
    ),
    activeModels: (store.models || []).filter((model) => model.is_active),
  };
};
