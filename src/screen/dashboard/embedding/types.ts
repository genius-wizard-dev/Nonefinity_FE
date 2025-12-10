// Embedding Task Types
export type TaskStatus =
  | "PENDING"
  | "STARTED"
  | "PROGRESS"
  | "SUCCESS"
  | "FAILURE"
  | "RETRY"
  | "REVOKED";

export type EmbeddingType = "file" | "text";

// Embedding Task Metadata
export interface EmbeddingTaskMetadata {
  user_id: string;
  model_name: string;
  model_identifier: string;
  provider: string;
  file_id?: string;
  chunks_count?: number;
  progress?: number;
  chunks_processed?: number;
  processing_time?: number;
}

// Embedding Task Result
export interface EmbeddingTaskResult {
  user_id: string;
  file_id?: string;
  knowledge_store_id?: string;
  provider: string;
  model_id: string;
  total_chunks: number;
  successful_chunks: number;
  collection_name: string;
  success: boolean;
}

// Search Task Result
export interface SearchResultItem {
  id: string;
  score: number;
  payload: {
    text: string;
    chunk_index?: number;
    file_id?: string;
    [key: string]: any;
  };
}

export interface SearchTaskResult {
  results: SearchResultItem[];
  query: string;
  total_found: number;
}

// Embedding Task
export interface EmbeddingTask {
  task_id: string;
  status: TaskStatus;
  type: EmbeddingType;
  ready: boolean;
  successful: boolean;
  failed: boolean;
  result?: EmbeddingTaskResult | SearchTaskResult;
  error?: string;
  meta?: EmbeddingTaskMetadata;
  created_at?: string;
  file_name?: string;
  model_name?: string;
  knowledge_store_name?: string;
}

// API Request Types
export interface CreateFileEmbeddingRequest {
  file_id: string;
  model_id: string;
  knowledge_store_id?: string;
}

export interface CreateTextEmbeddingRequest {
  text: string;
  model_id: string;
  knowledge_store_id?: string;
}

export interface CreateSearchRequest {
  credential_id: string;
  query_text: string;
  provider: string;
  model_id: string;
  file_id?: string;
  limit?: number;
}

// API Response Types
export interface CreateEmbeddingResponse {
  success: boolean;
  task_id: string;
  message: string;
  metadata?: EmbeddingTaskMetadata;
}

export interface TaskStatusResponse {
  task_id: string;
  status: TaskStatus;
  ready: boolean;
  successful: boolean;
  failed: boolean;
  result?: EmbeddingTaskResult | SearchTaskResult;
  error?: string;
  meta?: EmbeddingTaskMetadata;

  // ✨ Additional MongoDB metadata for UI consistency
  task_type?: string;
  user_id?: string;
  file_id?: string;
  knowledge_store_id?: string;
  provider?: string;
  model_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CancelTaskResponse {
  task_id: string;
  status: string;
  message: string;
}

// Filters and Pagination
export interface EmbeddingTaskFilters {
  status?: TaskStatus;
  type?: EmbeddingType;
  search?: string;
}

export interface EmbeddingTaskPagination {
  skip: number;
  limit: number;
}

// Polling Configuration
export interface PollingConfig {
  interval?: number; // milliseconds
  maxAttempts?: number;
  onProgress?: (task: EmbeddingTask) => void;
}

// UI State
export interface EmbeddingUIState {
  selectedTask: EmbeddingTask | null;
  showCreateDialog: boolean;
  showDetailsDialog: boolean;
}

// Toast Notification Data
export interface EmbeddingToastData {
  taskId: string;
  status: TaskStatus;
  progress?: number;
  totalChunks?: number;
  successfulChunks?: number;
  fileName?: string;
  modelName?: string;
}

// ============ New API Types ============

// Task from Backend API (GET /tasks)
export interface BackendTask {
  _id: string; // MongoDB document ID
  task_id: string; // Celery task ID
  user_id: string;
  task_type: "embedding" | "text_embedding" | "search" | "export_chat_history";
  status: TaskStatus | "CANCELLED" | "ERROR";
  file_id?: string | null;
  knowledge_store_id?: string | null;
  provider?: string | null;
  model_id?: string | null;
  metadata?: {
    model_name?: string;
    collection_name?: string;
    dimension?: number;
    result?: EmbeddingTaskResult | SearchTaskResult;
    [key: string]: any;
  } | null;
  error?: string | null;
  created_at: string;
  updated_at: string;
}

// Response for GET /tasks
export interface TasksListResponse {
  tasks: BackendTask[];
  total: number;
  skip: number;
  limit: number;
}

// Request for GET /tasks
export interface TasksListRequest {
  status?: string;
  task_type?: string;
  skip?: number;
  limit?: number;
}

// Knowledge Store Scroll Data Types
export interface KnowledgeStorePoint {
  id: string; // UUID
  text: string;
  vector: number[];
}

export interface ScrollDataRequest {
  limit?: number;
  scroll_id?: string | null;
}

export interface ScrollDataResponse {
  points: KnowledgeStorePoint[];
  scroll_id: string | null;
  has_more: boolean;
  total_scrolled: number;
}
