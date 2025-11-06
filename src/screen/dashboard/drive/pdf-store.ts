import { create } from "zustand";
import { PDFService } from "./services";
import type {
  GooglePDF,
  PDFStoreActions,
  PDFStoreState,
} from "./types";

interface PDFStore extends PDFStoreState, PDFStoreActions {}

export const usePDFStore = create<PDFStore>((set, get) => ({
  pdfs: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  searchResults: [],
  isSearching: false,
  searchTimeout: null,
  nextPageToken: null,
  hasMore: false,
  lastFetchTime: null,

  fetchPDFs: async (
    token: string,
    pageToken?: string,
    pageSize: number = 50,
    force = false
  ) => {
    const { lastFetchTime } = get();
    const now = Date.now();

    // Don't fetch if we have recent data (within 30 seconds) and not forced
    if (!force && !pageToken && lastFetchTime && now - lastFetchTime < 30000) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const result = await PDFService.listPDFs(token, pageToken, pageSize);

      if (pageToken) {
        // Append to existing PDFs for pagination (load more)
        set((state) => ({
          pdfs: [...state.pdfs, ...result.files],
          nextPageToken: result.next_page_token,
          hasMore: result.has_more,
          isLoading: false,
          isLoadingMore: false,
          lastFetchTime: now,
          error: null,
        }));
      } else {
        // Replace PDFs for initial load
        set({
          pdfs: result.files,
          nextPageToken: result.next_page_token,
          hasMore: result.has_more,
          isLoading: false,
          isLoadingMore: false,
          lastFetchTime: now,
          error: null,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to fetch PDFs";
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  searchPDFs: async (query: string, token: string) => {
    const { searchTimeout } = get();

    // Always clear existing timeout first
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      set({ searchTimeout: null });
    }

    // If query is empty, clear search immediately
    if (!query || query.trim() === "") {
      set({
        searchResults: [],
        isSearching: false,
        searchTimeout: null,
        error: null,
      });
      return;
    }

    // Trim query for consistency
    const trimmedQuery = query.trim();

    // Set loading state immediately for user feedback
    set({ isSearching: true, error: null });

    // Create new timeout for debounce
    const timeoutId = setTimeout(async () => {
      try {
        const pdfs = await PDFService.searchPDFs(trimmedQuery, token);

        // Only update if this is still the current search
        const currentTimeout = get().searchTimeout;
        if (currentTimeout === timeoutId) {
          set({
            searchResults: pdfs,
            isSearching: false,
            searchTimeout: null,
            error: null,
          });
        }
      } catch (error: any) {
        console.error("Search error:", error);
        const errorMessage =
          error?.response?.data?.message || "Failed to search PDFs";

        // Only update error if this is still the current search
        const currentTimeout = get().searchTimeout;
        if (currentTimeout === timeoutId) {
          set({
            error: errorMessage,
            isSearching: false,
            searchTimeout: null,
          });
        }
      }
    }, 300); // 300ms debounce

    set({ searchTimeout: timeoutId });
  },

  clearSearch: () => {
    const { searchTimeout } = get();
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    set({
      searchResults: [],
      isSearching: false,
      searchTimeout: null,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  loadMorePDFs: async (token: string) => {
    const { nextPageToken, hasMore, isLoading, isLoadingMore } = get();

    // Prevent multiple simultaneous load more requests
    if (!hasMore || !nextPageToken || isLoading || isLoadingMore) {
      return;
    }

    // Set loading more state (not isLoading to avoid reloading the whole page)
    set({ isLoadingMore: true, error: null });

    try {
      const result = await PDFService.listPDFs(token, nextPageToken, 100);

      // Append to existing PDFs for pagination
      set((state) => ({
        pdfs: [...state.pdfs, ...result.files],
        nextPageToken: result.next_page_token,
        hasMore: result.has_more,
        isLoadingMore: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to load more PDFs";
      set({
        error: errorMessage,
        isLoadingMore: false,
      });
    }
  },

  reset: () => {
    const { searchTimeout } = get();
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    set({
      pdfs: [],
      isLoading: false,
      isLoadingMore: false,
      error: null,
      searchResults: [],
      isSearching: false,
      searchTimeout: null,
      nextPageToken: null,
      hasMore: false,
      lastFetchTime: null,
    });
  },
}));

