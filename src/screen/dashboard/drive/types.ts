// GoogleSheet interface represents a Google Sheet from the API
export interface GoogleSheet {
  id: string;
  name: string;
}

// GooglePDF interface represents a PDF file from the API
export interface GooglePDF {
  id: string;
  name: string;
}

// Backend API response types
export interface ListSheetsResponse {
  files: GoogleSheet[];
  next_page_token: string | null;
  has_more: boolean;
}

export interface ListPDFsResponse {
  files: GooglePDF[];
  next_page_token: string | null;
  has_more: boolean;
}

// Backend returns array of GoogleSheet directly, not wrapped in object

// Store state types for Sheets
export interface DriveStoreState {
  sheets: GoogleSheet[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  searchResults: GoogleSheet[];
  isSearching: boolean;
  searchTimeout: NodeJS.Timeout | null;
  nextPageToken: string | null;
  hasMore: boolean;
  lastFetchTime: number | null;
}

// Store state types for PDFs
export interface PDFStoreState {
  pdfs: GooglePDF[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  searchResults: GooglePDF[];
  isSearching: boolean;
  searchTimeout: NodeJS.Timeout | null;
  nextPageToken: string | null;
  hasMore: boolean;
  lastFetchTime: number | null;
}

// Store action types for Sheets
export interface DriveStoreActions {
  fetchSheets: (
    token: string,
    pageToken?: string,
    pageSize?: number,
    force?: boolean
  ) => Promise<void>;
  searchSheets: (query: string, token: string) => Promise<void>;
  clearSearch: () => void;
  clearError: () => void;
  loadMoreSheets: (token: string) => Promise<void>;
  reset: () => void;
}

// Store action types for PDFs
export interface PDFStoreActions {
  fetchPDFs: (
    token: string,
    pageToken?: string,
    pageSize?: number,
    force?: boolean
  ) => Promise<void>;
  searchPDFs: (query: string, token: string) => Promise<void>;
  clearSearch: () => void;
  clearError: () => void;
  loadMorePDFs: (token: string) => Promise<void>;
  reset: () => void;
}

// View mode type for sheet display
export type ViewMode = "grid" | "list";

