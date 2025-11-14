import { getClerkToken } from "@/consts/endpoint";
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { FileService } from "../file-management/services";
import type { FileItem } from "../file-management/types";
import { ModelService } from "../models/service";
import type { Model } from "../models/type";
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
    models: Model[];
    embeddingModels: Model[];
    availableFiles: FileItem[];
    selectedKnowledgeStore: KnowledgeStore | null;
    collectionInfo: KnowledgeStoreInfoResponse | null;
    // Caching
    lastFetchTime: number; // epoch ms of last successful fetch for list

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

    fetchKnowledgeByDimension: (dimension: number) => Promise<void>;

    // New actions for create data dialog
    fetchEmbeddingModels: () => Promise<void>;
    fetchAvailableFiles: () => Promise<void>;
    fetchStoresByDimension: (dimension: number) => Promise<void>;

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
    models: [] as Model[],
    embeddingModels: [] as Model[],
    availableFiles: [] as FileItem[],
    selectedKnowledgeStore: null,
    collectionInfo: null,
    scrollData: [],
    scrollId: null,
    hasMore: false,
    totalScrolled: 0,
    lastFetchTime: 0,
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
        subscribeWithSelector((set, get) => ({
            ...initialState,

            // Fetch knowledge stores with pagination and filters (SWR-style cache)
            fetchKnowledgeStores: async (params = {}) => {
                const TTL_MS = 30_000; // 30s TTL
                const currentState = get();
                if (currentState.loading) return; // Prevent concurrent calls

                set({ loading: true, error: null });

                try {
                    const { pagination = {}, filters = {} } = params;

                    const paginationParams = {
                        skip: pagination.skip ?? currentState.pagination.skip,
                        limit:
                            pagination.limit ?? currentState.pagination.limit,
                    };

                    const filtersParams = {
                        ...currentState.filters,
                        ...filters,
                    };

                    const now = Date.now();
                    const isFresh =
                        now - (currentState.lastFetchTime || 0) < TTL_MS;
                    const usingDefaultPage =
                        paginationParams.skip ===
                            currentState.pagination.skip &&
                        paginationParams.limit ===
                            currentState.pagination.limit;
                    const filtersUnchanged =
                        filters === undefined ||
                        Object.keys(filters).length === 0;

                    if (
                        isFresh &&
                        usingDefaultPage &&
                        filtersUnchanged &&
                        currentState.knowledgeStores.length > 0
                    ) {
                        // Serve cache immediately, then revalidate in background
                        set({ loading: false });
                        (async () => {
                            try {
                                const response =
                                    await KnowledgeStoreService.list(
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
                                    error: null,
                                    lastFetchTime: Date.now(),
                                });
                            } catch (e) {
                                console.warn(
                                    "Background revalidation (knowledge stores) failed:",
                                    e
                                );
                            }
                        })();
                        return;
                    }

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
                        lastFetchTime: Date.now(),
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
                    const knowledgeStore = await KnowledgeStoreService.getById(
                        id
                    );
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
                    const newKnowledgeStore =
                        await KnowledgeStoreService.create(data);

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
            fetchModels: async () => {
                set({ loading: true, error: null });
                try {
                    const models = await ModelService.listModels({
                        type: "embedding",
                        active_only: true, // ✨ Only fetch active models
                    });
                    set({ models: models?.models || [], loading: false });
                } catch (error) {
                    set({
                        error:
                            error instanceof Error
                                ? error.message
                                : "Failed to fetch models",
                        loading: false,
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
                    const updatedKnowledgeStore =
                        await KnowledgeStoreService.update(id, data);

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
                    // Delete the knowledge store (backend will automatically delete related tasks)
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
                            total: Math.max(
                                0,
                                currentState.pagination.total - 1
                            ),
                        },
                        loading: false,
                        error: null,
                    });
                } catch (error: any) {
                    const errorMessage =
                        error?.response?.data?.detail ||
                        error?.message ||
                        "Failed to delete knowledge store";

                    set({
                        loading: false,
                        error: errorMessage,
                    });

                    // Error will be handled by component using toast
                    throw error;
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
                    const response = await KnowledgeStoreService.checkName(
                        name
                    );
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
                                error instanceof Error
                                    ? error.message
                                    : "Failed to check name",
                        },
                    });
                }
            },

            // Fetch scroll data (initial load)
            fetchScrollData: async (id: string, data: ScrollDataRequest) => {
                set({ loading: true, error: null });

                try {
                    const response = await KnowledgeStoreService.scrollData(
                        id,
                        data
                    );
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
                    const response = await KnowledgeStoreService.scrollData(
                        id,
                        {
                            limit: 100,
                            scroll_id: currentState.scrollId,
                        }
                    );

                    set({
                        scrollData: [
                            ...currentState.scrollData,
                            ...response.points,
                        ],
                        scrollId: response.scroll_id,
                        hasMore: response.has_more,
                        totalScrolled:
                            currentState.totalScrolled + response.points.length,
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

            // Fetch knowledge by dimension
            fetchKnowledgeByDimension: async (dimension: number) => {
                set({ loading: true, error: null });
                try {
                    const response =
                        await KnowledgeStoreService.getKnowledgeByDimension(
                            dimension
                        );
                    set({
                        knowledgeStores: response, // response is already an array
                        loading: false,
                        error: null,
                    });
                } catch (error) {
                    set({
                        loading: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Failed to fetch knowledge by dimension",
                    });
                }
            },

            // Fetch embedding models
            fetchEmbeddingModels: async () => {
                const currentState = get();
                if (currentState.embeddingModels.length > 0) return; // Don't fetch if already loaded

                set({ loading: true, error: null });
                try {
                    const response = await ModelService.listModels({
                        type: "embedding",
                        active_only: true, // ✨ Only fetch active models
                    });
                    set({
                        embeddingModels: response?.models || [],
                        loading: false,
                        error: null,
                    });
                } catch (error) {
                    set({
                        loading: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Failed to fetch embedding models",
                    });
                }
            },

            // Fetch available files
            fetchAvailableFiles: async () => {
                const currentState = get();
                if (currentState.availableFiles.length > 0) return; // Don't fetch if already loaded

                set({ loading: true, error: null });
                try {
                    const token = await getClerkToken();
                    if (!token) {
                        throw new Error("No authentication token available");
                    }
                    const files = await FileService.getAllowExtractFiles(token);
                    set({
                        availableFiles: files,
                        loading: false,
                        error: null,
                    });
                } catch (error) {
                    set({
                        loading: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Failed to fetch available files",
                    });
                }
            },

            // Fetch stores by dimension
            fetchStoresByDimension: async (dimension: number) => {
                set({ loading: true, error: null });
                try {
                    const response =
                        await KnowledgeStoreService.getKnowledgeByDimension(
                            dimension
                        );
                    set({
                        knowledgeStores: response, // response is already an array
                        loading: false,
                        error: null,
                    });
                } catch (error) {
                    set({
                        loading: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Failed to fetch stores by dimension",
                    });
                }
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
        })),
        {
            name: "knowledge-store-store",
        }
    )
);

// Selectors to prevent unnecessary re-renders
export const useKnowledgeStores = () =>
    useKnowledgeStoreStore((state) => state.knowledgeStores);
export const useEmbeddingModels = () =>
    useKnowledgeStoreStore((state) => state.embeddingModels);
export const useAvailableFiles = () =>
    useKnowledgeStoreStore((state) => state.availableFiles);
export const useLoading = () =>
    useKnowledgeStoreStore((state) => state.loading);
export const useError = () => useKnowledgeStoreStore((state) => state.error);
export const useSelectedKnowledgeStore = () =>
    useKnowledgeStoreStore((state) => state.selectedKnowledgeStore);

// Individual action selectors to prevent infinite loops
export const useFetchKnowledgeStores = () =>
    useKnowledgeStoreStore((state) => state.fetchKnowledgeStores);
export const useFetchEmbeddingModels = () =>
    useKnowledgeStoreStore((state) => state.fetchEmbeddingModels);
export const useFetchAvailableFiles = () =>
    useKnowledgeStoreStore((state) => state.fetchAvailableFiles);
export const useFetchStoresByDimension = () =>
    useKnowledgeStoreStore((state) => state.fetchStoresByDimension);
export const useSetSelectedKnowledgeStore = () =>
    useKnowledgeStoreStore((state) => state.setSelectedKnowledgeStore);
export const useSetLoading = () =>
    useKnowledgeStoreStore((state) => state.setLoading);
export const useSetError = () =>
    useKnowledgeStoreStore((state) => state.setError);
export const useResetState = () =>
    useKnowledgeStoreStore((state) => state.resetState);

// Memoized action selectors for better performance
export const useKnowledgeStoreActions = () =>
    useKnowledgeStoreStore((state) => ({
        fetchKnowledgeStores: state.fetchKnowledgeStores,
        fetchEmbeddingModels: state.fetchEmbeddingModels,
        fetchAvailableFiles: state.fetchAvailableFiles,
        fetchStoresByDimension: state.fetchStoresByDimension,
        setSelectedKnowledgeStore: state.setSelectedKnowledgeStore,
        setLoading: state.setLoading,
        setError: state.setError,
        resetState: state.resetState,
    }));
