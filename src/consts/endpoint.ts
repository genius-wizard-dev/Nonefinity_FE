// Base API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env?.VITE_API_URL || "http://localhost:8000",
  API_PREFIX: "/api/v1",
  TIMEOUT: 30000,
} as const;

// API Endpoints
export const ENDPOINTS = {
  // Dataset endpoints
  DATASETS: {
    LIST: "/datasets/list",
    GET: (id: string) => `/datasets/${id}`,
    DELETE: (id: string) => `/datasets/${id}`,
    DATA: (id: string) => `/datasets/${id}/data`,
    CONVERT: "/datasets/convert",
    CREATE: "/datasets/create",
    QUERY: "/datasets/query",
    UPDATE: (id: string) => `/datasets/${id}`,
    UPDATE_SCHEMA: (id: string) => `/datasets/${id}/schema`,
    INSERT: (datasetId: string, fileId: string) =>
      `/datasets/${datasetId}/insert/${fileId}`,
  },

  // File endpoints
  FILES: {
    LIST: "/file/list",
    SEARCH: "/file/search",
    UPLOAD_URL: "/file/upload-url", // Get presigned upload URL
    UPLOAD: "/file/upload", // Save metadata after upload
    DELETE: (id: string) => `/file/${id}`, // Delete single file
    RENAME: (id: string) => `/file/rename/${id}`, // Rename file
    ALLOW_CONVERT: "/file/allow-convert",
    ALLOW_EXTRACT: "/file/allow-extract",
    BATCH_DELETE: "/file/batch/delete", // Batch delete files
    STATS: "/file/stats", // Get file statistics
    TYPES: "/file/types", // Get available file types
    DOWNLOAD: (id: string) => `/file/download/${id}`, // Get download URL
  },

  // Credentials endpoints
  CREDENTIALS: {
    LIST: "/credentials",
    CREATE: "/credentials",
    GET: (id: string) => `/credentials/${id}`,
    UPDATE: (id: string) => `/credentials/${id}`,
    DELETE: (id: string) => `/credentials/${id}`,
    LIST_BY_PROVIDER: (providerName: string) =>
      `/credentials/provider/${providerName}`,
    MODEL_CREDENTIAL: (id: string) => `/credentials/model?id=${id}`,
  },

  // Provider endpoints
  PROVIDERS: {
    LIST: "/providers",
    LIST_BY_TASK: (taskType: string) => `/providers/task/${taskType}`,
    GET: (providerName: string) => `/providers/${providerName}`,
    GET_TASK_CONFIG: (providerName: string, taskType: string) =>
      `/providers/${providerName}/tasks/${taskType}`,
  },

  MODELS: {
    CREATE: "/models",
    LIST: "/models",
    STATS: "/models/stats",

    GET_DEFAULT: (modelType: "chat" | "embedding") =>
      `/models/default/${modelType}`,
    GET: (modelId: string) => `/models/${modelId}`,

    UPDATE: (modelId: string) => `/models/${modelId}`,

    DELETE: (modelId: string) => `/models/${modelId}`,

    SET_DEFAULT: (modelId: string) => `/models/${modelId}/set-default`,

    BY_CREDENTIAL: (credentialId: string) =>
      `/models/by-credential/${credentialId}`,
  },

  // Task endpoints
  TASKS: {
    LIST: "/tasks",
    DELETE: (taskId: string) => `/tasks/${taskId}`,
    CLEAR: (clearType: string) => `/tasks?clear_type=${clearType}`,
  },

  // Embedding endpoints
  EMBEDDING: {
    CREATE: "/embedding/create",
    TEXT: "/embedding/text",
    SEARCH: "/embedding/search",
    STATUS: (taskId: string) => `/embedding/status/${taskId}`,
    CANCEL: (taskId: string) => `/embedding/cancel/${taskId}`,
  },

  // Knowledge Store endpoints
  KNOWLEDGE_STORE: {
    LIST: "/knowledge-stores",
    CREATE: "/knowledge-stores",
    GET: (id: string) => `/knowledge-stores/${id}`,
    UPDATE: (id: string) => `/knowledge-stores/${id}`,
    DELETE: (id: string) => `/knowledge-stores/${id}`,
    CHECK_NAME: (name: string) => `/knowledge-stores/check-name/${name}`,
    INFO: (id: string) => `/knowledge-stores/${id}/info`,
    SCROLL_DATA: (id: string) => `/knowledge-stores/${id}/scroll-data`,
    DELETE_VECTORS: (id: string) => `/knowledge-stores/${id}/delete-vectors`,
    GET_KNOWLEDGE_BY_DIMENSION: (dimension: number) =>
      `/knowledge-stores/dimension/${dimension}`,
  },

  // Chat endpoints
  CHATS: {
    LIST: "/chats",
    CREATE: "/chats",
    GET: (id: string) => `/chats/${id}`,
    UPDATE: (id: string) => `/chats/${id}`,
    DELETE: (id: string) => `/chats/${id}`,
    MESSAGES: {
      LIST: (id: string) => `/chats/${id}/messages`,
      CREATE: (id: string) => `/chats/${id}/messages`,
      DELETE: (id: string) => `/chats/${id}/messages`,
    },
  },
} as const;

// Helper function to build full endpoint URL
export const buildEndpoint = (
  endpoint: string,
  usePrefix: boolean = true
): string => {
  const prefix = usePrefix ? API_CONFIG.API_PREFIX : "";
  return `${prefix}${endpoint}`;
};

export const getAuthHeaders = (token?: string): Record<string, string> => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to get Clerk token (if available)
export const getClerkToken = async (): Promise<string | undefined> => {
  try {
    if (typeof window !== "undefined") {
      const clerk = (window as unknown as Record<string, unknown>).Clerk;
      return await (
        clerk as { session?: { getToken?: () => Promise<string> } }
      )?.session?.getToken?.();
    }
  } catch {
    // Silently ignore token errors
  }
  return undefined;
};
