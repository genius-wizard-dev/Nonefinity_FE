// Integration Provider Types
export type IntegrationProvider = "google";

// Resource types for each provider
export type GoogleResourceType = "sheets" | "pdfs";

// Base integration config structure
export interface BaseIntegrationConfig {
  provider: IntegrationProvider;
  enable: boolean;
}

// Google Sheets config
export interface GoogleSheetsConfig {
  type: "sheets";
  sheet_id: string;
  sheet_name?: string;
}

// Google PDFs config
export interface GooglePDFsConfig {
  type: "pdfs";
  pdf_id: string;
  pdf_name?: string;
}

// Google integration with multiple resource configs
export interface GoogleIntegration extends BaseIntegrationConfig {
  provider: "google";
  resources: {
    sheets?: GoogleSheetsConfig | null;
    pdfs?: GooglePDFsConfig | null;
  };
}

// Union type for all integrations
export type Integration = GoogleIntegration;

// Integrations is an array to support multiple providers
export type IntegrationsConfig = Integration[];

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
  is_used?: boolean;
  created_at: string;
  updated_at: string;
  integration_ids?: string[] | null;
  mcp_ids?: string[] | null;
}

export interface ChatConfigCreate {
  name: string;
  chat_model_id: string;
  embedding_model_id?: string | null;
  knowledge_store_id?: string | null;
  dataset_ids?: string[] | null;
  instruction_prompt?: string;
  integration_ids?: string[] | null;
  mcp_ids?: string[] | null;
}

export interface ChatConfigUpdate {
  name?: string;
  chat_model_id?: string;
  embedding_model_id?: string | null;
  knowledge_store_id?: string | null;
  dataset_ids?: string[] | null;
  instruction_prompt?: string | null;
  integration_ids?: string[] | null;
  mcp_ids?: string[] | null;
}

// Integration Config Types
export interface IntegrationConfig {
  id: string;
  name: string;
  logo: string;
  toolkit_slug?: string | null;
  list_tools_slug: string[];
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

export interface ChatSessionDeleteResponse {
  deleted_count: number;
  not_found: string[];
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
