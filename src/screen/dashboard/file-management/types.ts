// FileItem interface represents a file object in the app, mapped from the server's snake_case fields
export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  sourceFile: string; // 'upload' or 'drive'
  createdAt: string;
  updatedAt: string;
  modified: Date; // For UI compatibility
  thumbnail?: string; // For UI compatibility
  owner?: string;
  bucket?: string;
  path?: string;
  ext?: string;
  tags?: string[];
}

// Backend API response types matching the server structure
export interface BackendFileItem {
  id: string;
  owner_id: string;
  bucket: string;
  file_path: string;
  file_name: string;
  file_ext: string;
  file_type: string;
  file_size: number;
  source_file: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface UploadUrlRequest {
  file_name: string;
  file_size: number;
  file_type: string;
}

export interface UploadUrlResponse {
  upload_url: string;
  object_name: string;
  expires_in: number;
}

export interface UploadMetadataRequest {
  object_name: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

export interface FileStatsResponse {
  total_files: number;
  total_size: number;
  total_size_mb: number;
  file_types: Record<string, number>;
}

export interface BatchDeleteRequest {
  file_ids: string[];
}

export interface BatchDeleteResponse {
  successful: string[];
  failed: Array<{
    file_id: string;
    error: string;
  }>;
}

// Upload related types
export interface UploadFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  id: string;
}

export interface UploadProgress {
  completed: number;
  total: number;
  current?: string;
}

// Search and filter types
export interface SearchFilters {
  query: string;
  fileType?: string;
  dateFrom?: string;
  dateTo?: string;
  sizeMin?: number;
  sizeMax?: number;
  owner?: string;
  tags?: string[];
  limit?: number;
}

// File statistics types
export interface FileStats {
  total_files: number;
  total_size_mb: number;
  file_types: Record<string, number>;
  totalFiles?: number;
  totalSize?: number;
  totalUsers?: number;
  filesByType?: Record<string, number>;
  filesByMonth?: Record<string, number>;
  storageUsage?: {
    used: number;
    available: number;
    percentage: number;
  };
  recentActivity?: {
    uploadsToday: number;
    deletesToday: number;
    uploadsThisWeek: number;
    deletesThisWeek: number;
  };
  topFileTypes?: Array<{
    type: string;
    count: number;
    size: number;
  }>;
  averageFileSize?: number;
  oldestFile?: {
    name: string;
    createdAt: string;
  };
  newestFile?: {
    name: string;
    createdAt: string;
  };
}

// Delete operation types
export interface DeleteResult {
  fileId: string;
  fileName?: string;
  status: "pending" | "success" | "error";
  error?: string;
}

export interface BatchDeleteOptions {
  batchSize?: number;
  onSuccess?: (deletedIds: string[]) => void;
  onError?: (error: string, failedIds: string[]) => void;
  onProgress?: (progress: UploadProgress) => void;
}

// Rename operation types
export interface RenameOptions {
  onSuccess?: (fileId: string, newName: string) => void;
  onError?: (error: string) => void;
}

// API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface FileListResponse {
  files: FileItem[];
  total: number;
  page: number;
  limit: number;
}

export interface FileSearchResponse {
  files: FileItem[];
  total: number;
  query: string;
}

// Component prop types
export interface FileUploadProps {
  onUploadComplete?: (file: FileItem) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  multiple?: boolean;
}

export interface FileDeleteProps {
  fileId: string;
  fileName?: string;
  onDeleteSuccess?: (fileId: string) => void;
  onDeleteError?: (error: string) => void;
  trigger?: React.ReactNode;
  disabled?: boolean;
}

export interface FileRenameProps {
  fileId: string;
  currentName: string;
  onRenameSuccess?: (fileId: string, newName: string) => void;
  onRenameError?: (error: string) => void;
  trigger?: React.ReactNode;
  disabled?: boolean;
  inline?: boolean;
}

export interface BatchDeleteProps {
  fileIds: string[];
  files?: FileItem[];
  onDeleteSuccess?: (deletedIds: string[]) => void;
  onDeleteError?: (error: string, failedIds: string[]) => void;
  onDeleteProgress?: (progress: UploadProgress) => void;
  trigger?: React.ReactNode;
  disabled?: boolean;
  batchSize?: number;
}

export interface FileSearchProps {
  onFileSelect?: (file: FileItem) => void;
  onFilesSelect?: (files: FileItem[]) => void;
  initialQuery?: string;
  showAdvancedFilters?: boolean;
}

export interface FileStatsProps {
  refreshInterval?: number; // in seconds
  showExportButton?: boolean;
}

export interface FileListProps {
  onFileSelect?: (file: FileItem) => void;
  onFilesSelect?: (files: FileItem[]) => void;
  onAfterDelete?: () => void;
  selectable?: boolean;
  multiSelect?: boolean;
  showActions?: boolean;
  pageSize?: number;
}

// Store state types
export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

export interface FileStoreState {
  files: FileItem[];
  isLoading: boolean;
  error: string | null;
  availableFileTypes: string[];
  lastFetchTime: number | null;
  stats: FileStats | null;
  searchResults: FileItem[];
  isSearching: boolean;
  searchTimeout: NodeJS.Timeout | null;
  uploadFiles: UploadFile[];
  isUploading: boolean;
}

// Store action types
export interface FileStoreActions {
  fetchFiles: (token: string, force?: boolean) => Promise<void>;
  searchFiles: (query: string, token: string) => Promise<void>;
  fetchFileTypes: (token?: string) => Promise<void>;
  fetchStats: (token?: string) => Promise<void>;
  uploadFile: (
    file: File,
    token: string,
    onProgress?: (progress: number) => void
  ) => Promise<FileItem | null>;
  deleteFile: (fileId: string, token: string) => Promise<boolean>;
  deleteFiles: (
    fileIds: string[],
    token: string,
    options?: BatchDeleteOptions
  ) => Promise<boolean>;
  renameFile: (
    fileId: string,
    newName: string,
    token: string
  ) => Promise<boolean>;
  downloadFile: (fileId: string, token: string) => Promise<boolean>;
  getFileUrl: (fileId: string, token: string) => Promise<string | null>;
  addFile: (file: FileItem) => void;
  updateFile: (fileId: string, updates: Partial<FileItem>) => void;
  removeFile: (fileId: string) => void;
  removeFiles: (fileIds: string[]) => void;
  clearError: () => void;
  clearSearch: () => void;
  refreshData: (token: string) => Promise<void>;
  startUpload: (files: File[]) => void;
  updateUploadProgress: (fileId: string, progress: number) => void;
  completeUpload: (fileId: string, uploadedFile?: FileItem) => void;
  failUpload: (fileId: string, error: string) => void;
  clearUploads: () => void;
  reset: () => void;
}

// View mode type for file display
export type ViewMode = "grid" | "list";

// mapFileItem maps a raw server file object (snake_case) to FileItem (camelCase)
export const mapFileItem = (item: BackendFileItem): FileItem => {
  // Determine file type for UI compatibility using file_ext
  const getFileType = (fileExt: string, fileName: string): string => {
    // Remove dot from extension if present
    const ext = fileExt.replace(/^\./, "").toLowerCase();
    const fileNameExt = fileName.split(".").pop()?.toLowerCase();

    // Use file_ext first, then fallback to fileName extension
    const finalExt = ext || fileNameExt;

    // Image types
    if (
      ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(
        finalExt || ""
      )
    ) {
      return "image";
    }

    // PDF files
    if (finalExt === "pdf") {
      return "pdf";
    }

    // Spreadsheet files
    if (["xls", "xlsx", "csv"].includes(finalExt || "")) {
      return "spreadsheet";
    }

    // Presentation files
    if (["ppt", "pptx"].includes(finalExt || "")) {
      return "presentation";
    }

    // Document files (text files, word docs, etc.)
    if (["txt", "md", "doc", "docx", "rtf"].includes(finalExt || "")) {
      return "document";
    }

    // Figma files
    if (finalExt === "fig") {
      return "figma";
    }

    // Archive files
    if (["zip", "rar", "7z", "tar", "gz"].includes(finalExt || "")) {
      return "archive";
    }

    // Video files
    if (["mp4", "mov", "avi", "mkv", "wmv"].includes(finalExt || "")) {
      return "video";
    }

    // Audio files
    if (["mp3", "wav", "flac", "m4a", "aac"].includes(finalExt || "")) {
      return "audio";
    }

    // Code files
    if (
      [
        "js",
        "jsx",
        "ts",
        "tsx",
        "html",
        "css",
        "json",
        "xml",
        "py",
        "java",
        "cpp",
        "c",
      ].includes(finalExt || "")
    ) {
      return "code";
    }

    // Default fallback
    return "file";
  };

  // Generate thumbnail path based on file type
  const getThumbnail = (fileType: string, fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (
      fileType.includes("image") ||
      ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext || "")
    ) {
      return "/image-file.png";
    }
    if (fileType.includes("pdf") || ext === "pdf") {
      return "/pdf-document.png";
    }
    if (["xls", "xlsx", "csv"].includes(ext || "")) {
      return "/spreadsheet-data.png";
    }
    if (["ppt", "pptx"].includes(ext || "")) {
      return "/presentation-slides.png";
    }
    if (["doc", "docx", "txt", "md"].includes(ext || "")) {
      return "/document-text.jpg";
    }
    if (ext === "fig") {
      return "/figma-design-interface.png";
    }

    return "/uploaded-file.jpg";
  };

  const mappedItem = {
    id: item.id,
    name: item.file_name,
    type: getFileType(item.file_ext, item.file_name),
    size: item.file_size,
    sourceFile: item.source_file || "upload",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    modified: new Date(item.updated_at), // Convert to Date for UI
    thumbnail: getThumbnail(item.file_type, item.file_name),
    owner: item.owner_id,
    bucket: item.bucket,
    path: item.file_path,
    ext: item.file_ext,
    tags: item.tags,
  };

  return mappedItem;
};

// Google Drive types
export interface GoogleSheet {
  id: string;
  name: string;
}

export interface GooglePDF {
  id: string;
  name: string;
}

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
