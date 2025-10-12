// Model types for the model management system
export interface Model {
  id: string;
  owner_id: string;
  credential_id: string;
  name: string;
  model: string; // Model identifier (e.g., gpt-4, text-embedding-ada-002)
  type: "chat" | "embedding";
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  dimension?: number;
}

export interface CreateModelRequest {
  credential_id: string;
  name: string;
  model: string;
  type: "chat" | "embedding";
  description?: string;
  is_active?: boolean;
}

export interface UpdateModelRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface ModelListResponse {
  models: Model[];
  total: number;
  skip: number;
  limit: number;
}

export interface ModelStats {
  total_models: number;
  chat_models: number;
  embedding_models: number;
  active_models: number;
  inactive_models: number;
}

export interface ModelListParams {
  skip?: number;
  limit?: number;
  type?: "chat" | "embedding";
  credential_id?: string;
  active_only?: boolean;
}

// Model form types
export interface ModelFormData {
  credential_id: string;
  name: string;
  model: string;
  type: "chat" | "embedding";
  description: string;
  is_active: boolean;
}

// Model table column types
export interface ModelTableColumn {
  key: keyof Model;
  label: string;
  sortable?: boolean;
  width?: string;
}

// Model filter types
export interface ModelFilters {
  type?: "chat" | "embedding" | "all";
  credential_id?: string;
  active_only?: boolean;
  search?: string;
}
export interface ModelFilters {
  type?: "chat" | "embedding" | "all";
  credential_id?: string;
  active_only?: boolean;
  search?: string;
}

export interface ModelCredential {
  id: string;
  object: string;
  created: string;
  owned_by?: string;
}

// Form state for model creation
export interface ModelFormState {
  credential_id: string;
  name: string;
  model: string;
  type: "chat" | "embedding";
  description: string;
  is_active: boolean;
  loadingCredentials: boolean;
  loadingModelCredentials: boolean;
}
