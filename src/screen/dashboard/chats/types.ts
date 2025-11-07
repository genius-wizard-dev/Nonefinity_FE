// Integration Provider Types
export type IntegrationProvider = "google";

export interface GoogleIntegration {
  provider: "google";
  enable: boolean;
  sheet_id: string;
  sheet_name?: string;
}

export type Integration = GoogleIntegration;

// Chat Config Types
export interface ChatConfig {
  id: string;
  name: string;
  chat_model_id: string;
  embedding_model_id?: string | null;
  knowledge_store_id?: string | null;
  dataset_ids?: string[] | null;
  instruction_prompt?: string | null;
  id_alias?: string | null;
  integrations?: Integration | null;
  is_used?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatConfigCreate {
  name: string;
  chat_model_id: string;
  embedding_model_id?: string | null;
  knowledge_store_id?: string | null;
  dataset_ids?: string[] | null;
  instruction_prompt?: string;
  integrations?: Integration | null;
}

export interface ChatConfigUpdate {
  name?: string;
  chat_model_id?: string;
  embedding_model_id?: string | null;
  knowledge_store_id?: string | null;
  dataset_ids?: string[] | null;
  instruction_prompt?: string | null;
  integrations?: Integration | null;
}

export interface ChatConfigListResponse {
  chat_configs: ChatConfig[];
  total: number;
  skip: number;
  limit: number;
}

// Chat Session Types
export interface ChatSession {
  id: string;
  chat_config_id: string;
  owner_id: string;
  name?: string | null;
  created_at: string;
  updated_at: string;
  messages?: ChatMessageListResponse;
}

export interface ChatSessionCreate {
  chat_config_id: string;
  name?: string | null;
}

export interface ChatSessionListResponse {
  chat_sessions: ChatSession[];
  total: number;
  skip: number;
  limit: number;
}

// Chat Message Types
export interface ChatMessage {
  id: string;
  session_id: string;
  owner_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  models?: Record<string, any>;
  tools?: Array<{
    name: string;
    arguments?: Record<string, any>;
    result?: any;
  }>;
  interrupt?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageCreate {
  session_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  models?: Record<string, any>;
  tools?: Array<{
    name: string;
    arguments?: Record<string, any>;
    result?: any;
  }>;
  interrupt?: Record<string, any>;
}

export interface ChatMessageListResponse {
  chat_messages: ChatMessage[];
  total: number;
  skip: number;
  limit: number;
}

// Streaming Types
export interface StreamEvent {
  event: string;
  data: any;
}
