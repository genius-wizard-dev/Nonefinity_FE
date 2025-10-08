// Embedding Model Types
export interface EmbeddingModel {
  id: string;
  name: string;
  description?: string;
  dimensions: number;
  max_tokens: number;
  provider: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Embedding Task Types
export interface EmbeddingTask {
  id: string;
  task_type: "embedding" | "search";
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  model_id: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  metadata?: Record<string, any>;
}

// Request Types
export interface EmbeddingCreateRequest {
  file_id: string;
  model_id?: string;
  metadata?: Record<string, any>;
}

export interface EmbeddingSearchRequest {
  model_id: string;
  query_text: string;
  dataset_id: string;
  top_k?: number;
  threshold?: number;
  metadata?: Record<string, any>;
}

// Response Types
export interface EmbeddingTaskResponse {
  task_id: string;
  status: string;
  message: string;
}

export interface EmbeddingStatusResponse {
  task_id: string;
  status:
    | "PENDING"
    | "STARTED"
    | "PROGRESS"
    | "SUCCESS"
    | "FAILURE"
    | "RETRY"
    | "REVOKED";
  ready: boolean;
  successful: boolean;
  failed: boolean;
  result?: {
    user_id: string;
    file_id: string;
    provider: string;
    model_id: string;
    total_chunks: number;
    successful_chunks: number;
  };
  error?: string | null;
  meta: string;
}

export interface EmbeddingResultResponse {
  task_id: string;
  status: "SUCCESS" | "FAILURE";
  ready: boolean;
  successful: boolean;
  failed: boolean;
  result?: {
    user_id: string;
    file_id: string;
    provider: string;
    model_id: string;
    total_chunks: number;
    successful_chunks: number;
  };
  error?: string | null;
  meta: string;
}

export interface EmbeddingActiveResponse {
  active_tasks: EmbeddingTask[] | Record<string, EmbeddingTask>;
  total_count: number;
  total_active?: number;
  workers?: any[];
  message?: string | null;
  error?: string | null;
}

// Form Data Types
export interface EmbeddingFormData {
  file_id: string;
  model_id?: string;
  metadata?: Record<string, any>;
}

export interface SearchFormData {
  model_id: string;
  query_text: string;
  dataset_id: string;
  top_k?: number;
  threshold?: number;
  metadata?: Record<string, any>;
}

import type { FileItem } from "../file-management/types";

// Store State Types
export interface EmbeddingStoreState {
  // State
  models: EmbeddingModel[];
  // activeTasks: EmbeddingTask[];
  completedTasks: EmbeddingTask[];
  allowExtractFiles: FileItem[];
  loading: boolean;
  filesLoading: boolean;
  error: string | null;

  // Current task tracking
  currentTaskId: string | null;
  taskStatus: EmbeddingStatusResponse | null;
  pollingInterval: NodeJS.Timeout | null;

  // Actions
  fetchModels: () => Promise<void>;
  // fetchActiveTasks: () => Promise<void>;
  fetchAllowExtractFiles: (token?: string) => Promise<void>;
  createEmbedding: (data: EmbeddingFormData) => Promise<void>;
  createSearch: (data: SearchFormData) => Promise<void>;
  getTaskStatus: (taskId: string) => Promise<void>;
  cancelTask: (taskId: string) => Promise<void>;
  setCurrentTask: (taskId: string | null) => void;
  clearCurrentTask: () => void;
  startPolling: (taskId: string) => void;
  stopPolling: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}
