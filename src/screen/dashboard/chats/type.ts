// Chat Message Types
export interface ChatMessage {
  id: string;
  chat_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  message_order: number;
  created_at: string;
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
  role: "user" | "assistant" | "system";
  content: string;
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
  sendMessage: (chatId: string, content: string) => Promise<ChatMessage | null>;
  clearMessages: (chatId: string) => Promise<boolean>;

  // UI Actions
  setCurrentChat: (chat: Chat | null) => void;
  setSelectedChatId: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  reset: () => void;
}

// Combined Store Type
export interface ChatStore extends ChatState, ChatActions {}
