import { create } from "zustand";
import { DriveService, PDFService } from "./services";
import type { GooglePDF, GoogleSheet } from "./types";

interface DriveImportStoreState {
  // Data
  sheets: GoogleSheet[];
  pdfs: GooglePDF[];
  searchQuery: string;
  filteredSheets: GoogleSheet[];
  filteredPDFs: GooglePDF[];

  // Pagination
  nextPageTokenSheets: string | null;
  nextPageTokenPDFs: string | null;
  hasMoreSheets: boolean;
  hasMorePDFs: boolean;

  // Loading states
  isLoadingSheets: boolean;
  isLoadingPDFs: boolean;
  isLoadingMoreSheets: boolean;
  isLoadingMorePDFs: boolean;

  // Cache
  lastFetchSheetsTime: number | null;
  lastFetchPDFsTime: number | null;

  // Error
  error: string | null;
}

interface DriveImportStoreActions {
  // Fetch actions
  fetchSheets: (token: string, force?: boolean) => Promise<void>;
  fetchPDFs: (token: string, force?: boolean) => Promise<void>;
  loadMoreSheets: (token: string) => Promise<void>;
  loadMorePDFs: (token: string) => Promise<void>;
  searchSheets: (query: string, token: string) => Promise<void>;
  searchPDFs: (query: string, token: string) => Promise<void>;

  // Search actions
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Reset
  reset: () => void;
}

interface DriveImportStore
  extends DriveImportStoreState,
    DriveImportStoreActions {}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useDriveImportStore = create<DriveImportStore>((set, get) => ({
  // Initial state
  sheets: [],
  pdfs: [],
  searchQuery: "",
  filteredSheets: [],
  filteredPDFs: [],
  nextPageTokenSheets: null,
  nextPageTokenPDFs: null,
  hasMoreSheets: false,
  hasMorePDFs: false,
  isLoadingSheets: false,
  isLoadingPDFs: false,
  isLoadingMoreSheets: false,
  isLoadingMorePDFs: false,
  lastFetchSheetsTime: null,
  lastFetchPDFsTime: null,
  error: null,

  // Fetch sheets
  fetchSheets: async (token: string, force = false) => {
    const { lastFetchSheetsTime, sheets } = get();
    const now = Date.now();

    // Don't fetch if we have recent data and not forced
    if (
      !force &&
      lastFetchSheetsTime &&
      now - lastFetchSheetsTime < CACHE_DURATION &&
      sheets.length > 0
    ) {
      return;
    }

    set({ isLoadingSheets: true, error: null });

    try {
      const result = await DriveService.listSheets(token, undefined, 50);
      const newSheets = result.files || [];
      const { searchQuery } = get();

      set({
        sheets: newSheets,
        filteredSheets: searchQuery
          ? newSheets.filter((sheet) =>
              sheet.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : newSheets,
        nextPageTokenSheets: result.next_page_token || null,
        hasMoreSheets: result.has_more || false,
        isLoadingSheets: false,
        lastFetchSheetsTime: now,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to load sheets from Google Drive";
      set({
        error: errorMessage,
        isLoadingSheets: false,
      });
    }
  },

  // Fetch PDFs
  fetchPDFs: async (token: string, force = false) => {
    const { lastFetchPDFsTime, pdfs } = get();
    const now = Date.now();

    // Don't fetch if we have recent data and not forced
    if (
      !force &&
      lastFetchPDFsTime &&
      now - lastFetchPDFsTime < CACHE_DURATION &&
      pdfs.length > 0
    ) {
      return;
    }

    set({ isLoadingPDFs: true, error: null });

    try {
      const result = await PDFService.listPDFs(token, undefined, 50);
      const newPDFs = result.files || [];
      const { searchQuery } = get();

      set({
        pdfs: newPDFs,
        filteredPDFs: searchQuery
          ? newPDFs.filter((pdf) =>
              pdf.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : newPDFs,
        nextPageTokenPDFs: result.next_page_token || null,
        hasMorePDFs: result.has_more || false,
        isLoadingPDFs: false,
        lastFetchPDFsTime: now,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to load PDFs from Google Drive";
      set({
        error: errorMessage,
        isLoadingPDFs: false,
      });
    }
  },

  // Search sheets
  searchSheets: async (query: string, token: string) => {
    if (!query.trim()) {
      get().fetchSheets(token);
      return;
    }

    set({ isLoadingSheets: true, error: null });

    try {
      const results = await DriveService.searchSheets(query, token);
      set({
        sheets: results,
        filteredSheets: results,
        isLoadingSheets: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to search sheets";
      set({
        error: errorMessage,
        isLoadingSheets: false,
      });
    }
  },

  // Search PDFs
  searchPDFs: async (query: string, token: string) => {
    if (!query.trim()) {
      get().fetchPDFs(token);
      return;
    }

    set({ isLoadingPDFs: true, error: null });

    try {
      const results = await PDFService.searchPDFs(query, token);
      set({
        pdfs: results,
        filteredPDFs: results,
        isLoadingPDFs: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to search PDFs";
      set({
        error: errorMessage,
        isLoadingPDFs: false,
      });
    }
  },

  // Set search query and filter
  setSearchQuery: (query: string) => {
    const { sheets, pdfs } = get();
    const lowerQuery = query.toLowerCase();

    set({
      searchQuery: query,
      filteredSheets: query
        ? sheets.filter((sheet) =>
            sheet.name.toLowerCase().includes(lowerQuery)
          )
        : sheets,
      filteredPDFs: query
        ? pdfs.filter((pdf) => pdf.name.toLowerCase().includes(lowerQuery))
        : pdfs,
    });
  },

  // Clear search
  clearSearch: () => {
    const { sheets, pdfs } = get();
    set({
      searchQuery: "",
      filteredSheets: sheets,
      filteredPDFs: pdfs,
    });
  },

  // Load more sheets
  loadMoreSheets: async (token: string) => {
    const { nextPageTokenSheets, hasMoreSheets, isLoadingMoreSheets, sheets } =
      get();

    if (!hasMoreSheets || !nextPageTokenSheets || isLoadingMoreSheets) {
      return;
    }

    set({ isLoadingMoreSheets: true, error: null });

    try {
      const result = await DriveService.listSheets(
        token,
        nextPageTokenSheets,
        50
      );
      const newSheets = result.files || [];
      const { searchQuery } = get();

      const updatedSheets = [...sheets, ...newSheets];

      set({
        sheets: updatedSheets,
        filteredSheets: searchQuery
          ? updatedSheets.filter((sheet) =>
              sheet.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : updatedSheets,
        nextPageTokenSheets: result.next_page_token || null,
        hasMoreSheets: result.has_more || false,
        isLoadingMoreSheets: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to load more sheets";
      set({
        error: errorMessage,
        isLoadingMoreSheets: false,
      });
    }
  },

  // Load more PDFs
  loadMorePDFs: async (token: string) => {
    const { nextPageTokenPDFs, hasMorePDFs, isLoadingMorePDFs, pdfs } = get();

    if (!hasMorePDFs || !nextPageTokenPDFs || isLoadingMorePDFs) {
      return;
    }

    set({ isLoadingMorePDFs: true, error: null });

    try {
      const result = await PDFService.listPDFs(token, nextPageTokenPDFs, 50);
      const newPDFs = result.files || [];
      const { searchQuery } = get();

      const updatedPDFs = [...pdfs, ...newPDFs];

      set({
        pdfs: updatedPDFs,
        filteredPDFs: searchQuery
          ? updatedPDFs.filter((pdf) =>
              pdf.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : updatedPDFs,
        nextPageTokenPDFs: result.next_page_token || null,
        hasMorePDFs: result.has_more || false,
        isLoadingMorePDFs: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to load more PDFs";
      set({
        error: errorMessage,
        isLoadingMorePDFs: false,
      });
    }
  },

  // Reset store
  reset: () => {
    set({
      sheets: [],
      pdfs: [],
      searchQuery: "",
      filteredSheets: [],
      filteredPDFs: [],
      nextPageTokenSheets: null,
      nextPageTokenPDFs: null,
      hasMoreSheets: false,
      hasMorePDFs: false,
      isLoadingSheets: false,
      isLoadingPDFs: false,
      isLoadingMoreSheets: false,
      isLoadingMorePDFs: false,
      lastFetchSheetsTime: null,
      lastFetchPDFsTime: null,
      error: null,
    });
  },
}));
