// Chat Message Types
export type MessageRole = "user" | "assistant" | "system" | "tool";
export type MessageType =
  | "text"
  | "tool_call"
  | "tool_result"
  | "thinking"
  | "approval_request";

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: MessageRole;
  content: string;
  message_order: number;
  message_type: MessageType;
  metadata?: {
    tool_name?: string;
    args?: Record<string, unknown>;
    result?: string;
    status?: string;
    error?: string;
    [key: string]: unknown;
  };
  parent_message_id?: string | null;
  created_at: string;
}

// SSE Event Types
export interface SSEStartEvent {
  event: "start";
  data: {
    message: string;
  };
}

export interface SSEEndEvent {
  event: "end";
  data: {
    message: string;
  };
}

export interface SSEContentEvent {
  event: "content";
  data: {
    id: string;
    step: string;
    content:
      | string
      | Array<{
          type: string;
          text: string;
          extras?: Record<string, unknown>;
        }>;
    role: string;
  };
}

export interface SSEToolCallEvent {
  event: "tool_call";
  data: {
    id: string;
    step: string;
    tool_name: string;
    args: Record<string, unknown>;
    status: string;
  };
}

export interface SSEToolResultEvent {
  event: "tool_result";
  data: {
    id: string;
    step: string;
    tool_name: string;
    result: string;
    status: string;
  };
}

export interface SSEApprovalRequestEvent {
  event: "approval_request";
  data: {
    id: string;
    step: string;
    tool_name: string;
    args: Record<string, unknown>;
    description: string;
    allowed_decisions: string[];
  };
}

export interface SSEErrorEvent {
  event: "error";
  data: {
    message: string;
  };
}

export type SSEEvent =
  | SSEStartEvent
  | SSEEndEvent
  | SSEContentEvent
  | SSEToolCallEvent
  | SSEToolResultEvent
  | SSEApprovalRequestEvent
  | SSEErrorEvent;

// Approval Decision Types
export interface ApprovalDecision {
  type: "approve" | "reject" | "edit";
  edited_action?: {
    name: string;
    args: Record<string, unknown>;
  };
}

export interface ResumeData {
  decisions: Array<ApprovalDecision>;
}

// Chat Types - Match API response exactly
export interface Chat {
  id: string;
  name: string;
  owner_id: string;
  chat_model_id: string;
  embedding_model_id: string | null;
  temperature: number;
  max_tokens: number;
  top_p: number;
  dataset_ids: string[];
  knowledge_store_id: string | null;
  instruction_prompt: string;
  message_count: number;
  created_at: string;
  updated_at?: string | null;
}

// API Request Types
export interface CreateChatRequest {
  name: string;
  chat_model_id: string;
  embedding_model_id?: string | null;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  dataset_ids?: string[];
  knowledge_store_id?: string | null;
  instruction_prompt?: string;
}

export interface UpdateChatRequest {
  name?: string;
  chat_model_id?: string;
  embedding_model_id?: string | null;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  dataset_ids?: string[];
  knowledge_store_id?: string | null;
  instruction_prompt?: string;
}

export interface CreateMessageRequest {
  role: MessageRole;
  content: string;
  message_type?: MessageType;
  metadata?: Record<string, unknown>;
  parent_message_id?: string | null;
}

// API Response Types
export interface ChatListResponse {
  chats: Chat[];
  total: number;
  skip: number;
  limit: number;
}

export interface ChatResponse {
  data: Chat;
}

export interface MessageListResponse {
    data: ChatMessage[];
}

export interface MessageResponse {
    data: ChatMessage;
}

// Chat Types
export const ChatType = {
  AI_ONLY: "ai_only",
  KNOWLEDGE_BASE: "knowledge_base",
  DATASET: "dataset",
  FULL_FEATURED: "full_featured",
} as const;

export type ChatType = (typeof ChatType)[keyof typeof ChatType];

// Store State Types
export interface ChatState {
  // Data
  chats: Chat[];
  currentChat: Chat | null;
  messages: ChatMessage[];
  // Caching
  lastFetchTime: number; // chats list last fetch time (epoch ms)
  messagesCache: Record<string, { data: ChatMessage[]; lastFetchTime: number }>; // per-chat cache

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isSendingMessage: boolean;
  isLoadingMessages: boolean;

  // Pagination
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  // UI state
  sidebarOpen: boolean;
  selectedChatId: string | null;
}

// Store Actions Types
export interface ChatActions {
  // Chat CRUD
  createChat: (data: CreateChatRequest) => Promise<Chat | null>;
  getChats: (skip?: number, limit?: number) => Promise<void>;
  getChat: (id: string) => Promise<Chat | null>;
  updateChat: (id: string, data: UpdateChatRequest) => Promise<Chat | null>;
  deleteChat: (id: string) => Promise<boolean>;

  // Messages
  getMessages: (chatId: string, skip?: number, limit?: number) => Promise<void>;
  // NOTE: sendMessage removed - use useChatStreaming hook for real-time streaming
  clearMessages: (chatId: string) => Promise<boolean>;

  // UI Actions
  setCurrentChat: (chat: Chat | null) => void;
  setSelectedChatId: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  reset: () => void;

  // Persistence
  _hasHydrated: boolean;

  // Request deduplication
  _pendingRequests?: Map<string, Promise<any>>;
}

// Combined Store Type
export interface ChatStore extends ChatState, ChatActions {}
