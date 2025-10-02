// FileItem interface represents a file object in the app, mapped from the server's snake_case fields
export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  updatedAt: string;
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
export interface FileStoreState {
  files: FileItem[];
  isLoading: boolean;
  error: string | null;
  availableFileTypes: string[];
  lastFetchTime: number | null;
  stats: FileStats | null;
  searchResults: FileItem[];
  isSearching: boolean;
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
  addFile: (file: FileItem) => void;
  updateFile: (fileId: string, updates: Partial<FileItem>) => void;
  removeFile: (fileId: string) => void;
  removeFiles: (fileIds: string[]) => void;
  clearError: () => void;
  reset: () => void;
}

// mapFileItem maps a raw server file object (snake_case) to FileItem (camelCase)
export const mapFileItem = (item: BackendFileItem): FileItem => {
  return {
    id: item.id,
    name: item.file_name, // Only file name without extension
    type: item.file_type,
    size: item.file_size,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    owner: item.owner_id,
    bucket: item.bucket,
    path: item.file_path,
    ext: item.file_ext,
    tags: item.tags,
  };
};
