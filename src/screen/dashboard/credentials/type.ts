// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type ProviderName =
  | "groq"
  | "openai"
  | "huggingface"
  | "nvidia"
  | "togetherai"
  | "openrouter";

// Provider Types
export interface Provider {
  id: string;
  provider: ProviderName;
  name: string;
  description: string;
  base_url: string;
  logo_url?: string;
  docs_url?: string;
  api_key_header: string;
  api_key_prefix: string;
  is_active: boolean;
  support: string[];
  tasks: Record<
    string,
    {
      class_path: string;
      init_params: string[];
    }
  >;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ProviderListResponse {
  providers: Provider[];
  total: number;
}

// Credential Types
export interface Credential {
  id: string;
  name: string;
  provider_id: string;
  provider: ProviderName;
  provider_name: string;
  base_url?: string;
  additional_headers: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  api_key: string;
  usage_count: number;
}

export interface CredentialListResponse {
  credentials: Credential[];
  total: number;
  page: number;
  size: number;
}

export interface CredentialFormData {
  name: string;
  provider_id: string;
  api_key: string;
  base_url?: string;
  is_active?: boolean;
  additional_headers?: Record<string, string>;
}

export interface CredentialUpdateData {
  name?: string;
  provider_id?: string;
  api_key?: string;
  base_url?: string;
  is_active?: boolean;
}

export interface ModelCredential {
  id: string;
  object: string;
  created: string;
  owned_by?: string;
}
