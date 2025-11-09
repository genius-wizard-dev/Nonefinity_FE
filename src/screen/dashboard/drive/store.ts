import { create } from "zustand";
import { DriveService } from "./services";
import type {
  DriveStoreActions,
  DriveStoreState,
  GoogleSheet,
} from "./types";

interface DriveStore extends DriveStoreState, DriveStoreActions {}

export const useDriveStore = create<DriveStore>((set, get) => ({
  sheets: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  searchResults: [],
  isSearching: false,
  searchTimeout: null,
  nextPageToken: null,
  hasMore: false,
  lastFetchTime: null,

  fetchSheets: async (
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
      const result = await DriveService.listSheets(token, pageToken, pageSize);

      if (pageToken) {
        // Append to existing sheets for pagination (load more)
        set((state) => ({
          sheets: [...state.sheets, ...result.files],
          nextPageToken: result.next_page_token,
          hasMore: result.has_more,
          isLoading: false,
          isLoadingMore: false,
          lastFetchTime: now,
          error: null,
        }));
      } else {
        // Replace sheets for initial load
        set({
          sheets: result.files,
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
        error?.response?.data?.message || "Failed to fetch sheets";
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  searchSheets: async (query: string, token: string) => {
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
        const sheets = await DriveService.searchSheets(trimmedQuery, token);

        // Only update if this is still the current search
        const currentTimeout = get().searchTimeout;
        if (currentTimeout === timeoutId) {
          set({
            searchResults: sheets,
            isSearching: false,
            searchTimeout: null,
            error: null,
          });
        }
      } catch (error: any) {
        console.error("Search error:", error);
        const errorMessage =
          error?.response?.data?.message || "Failed to search sheets";

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

  loadMoreSheets: async (token: string) => {
    const { nextPageToken, hasMore, isLoading, isLoadingMore } = get();

    // Prevent multiple simultaneous load more requests
    if (!hasMore || !nextPageToken || isLoading || isLoadingMore) {
      return;
    }

    // Set loading more state (not isLoading to avoid reloading the whole page)
    set({ isLoadingMore: true, error: null });

    try {
      const result = await DriveService.listSheets(token, nextPageToken, 100);

      // Append to existing sheets for pagination
      set((state) => ({
        sheets: [...state.sheets, ...result.files],
        nextPageToken: result.next_page_token,
        hasMore: result.has_more,
        isLoadingMore: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to load more sheets";
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
      sheets: [],
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

