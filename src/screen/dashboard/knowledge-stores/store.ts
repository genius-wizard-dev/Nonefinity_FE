import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { KnowledgeStoreService } from "./services";
import type {
  KnowledgeStore,
  KnowledgeStoreCreateRequest,
  KnowledgeStoreFilters,
  KnowledgeStoreInfoResponse,
  KnowledgeStorePagination,
  KnowledgeStoreUpdateRequest,
  ScrollDataPoint,
  ScrollDataRequest,
} from "./types";

interface KnowledgeStoreState {
  // Data
  knowledgeStores: KnowledgeStore[];
  selectedKnowledgeStore: KnowledgeStore | null;
  collectionInfo: KnowledgeStoreInfoResponse | null;

  // Scroll Data
  scrollData: ScrollDataPoint[];
  scrollId: string | null;
  hasMore: boolean;
  totalScrolled: number;

  // Form state for knowledge store creation
  formData: {
    name: string;
    description: string;
    dimension: number;
    distance: "Cosine" | "Dot" | "Euclid";
  };

  // UI State
  loading: boolean;
  error: string | null;
  filters: KnowledgeStoreFilters;
  pagination: {
    skip: number;
    limit: number;
    total: number;
  };

  // Form validation
  nameValidation: {
    isChecking: boolean;
    isAvailable: boolean | null;
    message: string;
  };

  // Actions
  fetchKnowledgeStores: (params?: {
    pagination?: Partial<KnowledgeStorePagination>;
    filters?: KnowledgeStoreFilters;
  }) => Promise<void>;

  fetchKnowledgeStore: (id: string) => Promise<void>;

  createKnowledgeStore: (data: KnowledgeStoreCreateRequest) => Promise<void>;

  updateKnowledgeStore: (
    id: string,
    data: KnowledgeStoreUpdateRequest
  ) => Promise<void>;

  deleteKnowledgeStore: (id: string) => Promise<void>;

  fetchCollectionInfo: (id: string) => Promise<void>;

  checkNameAvailability: (name: string) => Promise<void>;

  // Scroll data actions
  fetchScrollData: (id: string, data: ScrollDataRequest) => Promise<void>;
  loadMoreScrollData: (id: string) => Promise<void>;
  resetScrollData: () => void;

  // Form actions
  setFormData: (data: Partial<KnowledgeStoreState["formData"]>) => void;
  resetFormData: () => void;

  // UI actions
  setSelectedKnowledgeStore: (knowledgeStore: KnowledgeStore | null) => void;
  setFilters: (filters: Partial<KnowledgeStoreFilters>) => void;
  setPagination: (
    pagination: Partial<KnowledgeStoreState["pagination"]>
  ) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Reset actions
  resetState: () => void;
}

const initialState = {
  knowledgeStores: [],
  selectedKnowledgeStore: null,
  collectionInfo: null,
  scrollData: [],
  scrollId: null,
  hasMore: false,
  totalScrolled: 0,
  formData: {
    name: "",
    description: "",
    dimension: 384,
    distance: "Cosine" as const,
  },
  loading: false,
  error: null,
  filters: {},
  pagination: {
    skip: 0,
    limit: 50,
    total: 0,
  },
  nameValidation: {
    isChecking: false,
    isAvailable: null,
    message: "",
  },
};

export const useKnowledgeStoreStore = create<KnowledgeStoreState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch knowledge stores with pagination and filters
      fetchKnowledgeStores: async (params = {}) => {
        set({ loading: true, error: null });

        try {
          const { pagination = {}, filters = {} } = params;
          const currentState = get();

          const paginationParams = {
            skip: pagination.skip ?? currentState.pagination.skip,
            limit: pagination.limit ?? currentState.pagination.limit,
          };

          const filtersParams = {
            ...currentState.filters,
            ...filters,
          };

          const response = await KnowledgeStoreService.list(
            paginationParams,
            filtersParams
          );

          set({
            knowledgeStores: response.knowledge_stores,
            pagination: {
              skip: response.skip,
              limit: response.limit,
              total: response.total,
            },
            filters: filtersParams,
            loading: false,
            error: null,
          });
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch knowledge stores",
          });
        }
      },

      // Fetch single knowledge store
      fetchKnowledgeStore: async (id: string) => {
        set({ loading: true, error: null });

        try {
          const knowledgeStore = await KnowledgeStoreService.getById(id);
          set({
            selectedKnowledgeStore: knowledgeStore,
            loading: false,
            error: null,
          });
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch knowledge store",
          });
        }
      },

      // Create knowledge store
      createKnowledgeStore: async (data: KnowledgeStoreCreateRequest) => {
        set({ loading: true, error: null });

        try {
          const newKnowledgeStore = await KnowledgeStoreService.create(data);

          // Add to the list
          const currentState = get();
          set({
            knowledgeStores: [
              newKnowledgeStore,
              ...currentState.knowledgeStores,
            ],
            pagination: {
              ...currentState.pagination,
              total: currentState.pagination.total + 1,
            },
            loading: false,
            error: null,
          });
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to create knowledge store",
          });
        }
      },

      // Update knowledge store
      updateKnowledgeStore: async (
        id: string,
        data: KnowledgeStoreUpdateRequest
      ) => {
        set({ loading: true, error: null });

        try {
          const updatedKnowledgeStore = await KnowledgeStoreService.update(
            id,
            data
          );

          // Update in the list
          const currentState = get();
          const updatedList = currentState.knowledgeStores.map((ks) =>
            ks.id === id ? updatedKnowledgeStore : ks
          );

          set({
            knowledgeStores: updatedList,
            selectedKnowledgeStore:
              currentState.selectedKnowledgeStore?.id === id
                ? updatedKnowledgeStore
                : currentState.selectedKnowledgeStore,
            loading: false,
            error: null,
          });
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to update knowledge store",
          });
        }
      },

      // Delete knowledge store
      deleteKnowledgeStore: async (id: string) => {
        set({ loading: true, error: null });

        try {
          await KnowledgeStoreService.delete(id);

          // Remove from the list
          const currentState = get();
          const updatedList = currentState.knowledgeStores.filter(
            (ks) => ks.id !== id
          );

          set({
            knowledgeStores: updatedList,
            selectedKnowledgeStore:
              currentState.selectedKnowledgeStore?.id === id
                ? null
                : currentState.selectedKnowledgeStore,
            pagination: {
              ...currentState.pagination,
              total: Math.max(0, currentState.pagination.total - 1),
            },
            loading: false,
            error: null,
          });
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete knowledge store",
          });
        }
      },

      // Fetch collection info
      fetchCollectionInfo: async (id: string) => {
        set({ loading: true, error: null });

        try {
          const info = await KnowledgeStoreService.getInfo(id);
          set({
            collectionInfo: info,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error("Failed to fetch collection info:", error);
          set({
            collectionInfo: null,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch collection info",
          });
        }
      },

      // Check name availability
      checkNameAvailability: async (name: string) => {
        set({
          nameValidation: {
            isChecking: true,
            isAvailable: null,
            message: "",
          },
        });

        try {
          const response = await KnowledgeStoreService.checkName(name);
          set({
            nameValidation: {
              isChecking: false,
              isAvailable: response.available,
              message: response.available
                ? "Name is available"
                : "Name is already taken",
            },
          });
        } catch (error) {
          set({
            nameValidation: {
              isChecking: false,
              isAvailable: false,
              message:
                error instanceof Error ? error.message : "Failed to check name",
            },
          });
        }
      },

      // Fetch scroll data (initial load)
      fetchScrollData: async (id: string, data: ScrollDataRequest) => {
        set({ loading: true, error: null });

        try {
          const response = await KnowledgeStoreService.scrollData(id, data);
          set({
            scrollData: response.points,
            scrollId: response.scroll_id,
            hasMore: response.has_more,
            totalScrolled: response.total_scrolled,
            loading: false,
            error: null,
          });
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch scroll data",
          });
        }
      },

      // Load more scroll data (append to existing)
      loadMoreScrollData: async (id: string) => {
        const currentState = get();
        if (!currentState.scrollId || !currentState.hasMore) return;

        set({ loading: true, error: null });

        try {
          const response = await KnowledgeStoreService.scrollData(id, {
            limit: 100,
            scroll_id: currentState.scrollId,
          });

          set({
            scrollData: [...currentState.scrollData, ...response.points],
            scrollId: response.scroll_id,
            hasMore: response.has_more,
            totalScrolled: currentState.totalScrolled + response.points.length,
            loading: false,
            error: null,
          });
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to load more scroll data",
          });
        }
      },

      // Reset scroll data
      resetScrollData: () => {
        set({
          scrollData: [],
          scrollId: null,
          hasMore: false,
          totalScrolled: 0,
        });
      },

      // Form actions
      setFormData: (data) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
        }));
      },

      resetFormData: () => {
        set({
          formData: initialState.formData,
          nameValidation: initialState.nameValidation,
        });
      },

      // UI actions
      setSelectedKnowledgeStore: (knowledgeStore) => {
        set({ selectedKnowledgeStore: knowledgeStore });
      },

      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      setPagination: (pagination) => {
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        }));
      },

      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error });
      },

      // Reset state
      resetState: () => {
        set(initialState);
      },
    }),
    {
      name: "knowledge-store-store",
    }
  )
);
