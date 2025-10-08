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
    GET: (id: string) => `/files/${id}`,
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

  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile",
  },

  // Credentials endpoints
  CREDENTIALS: {
    // List all credentials (GET, supports skip/limit query)
    LIST: "/credentials",
    // Create a new credential (POST, form data)
    CREATE: "/credentials",
    // Get credential by ID (GET)
    GET: (id: string) => `/credentials/${id}`,
    // Update credential by ID (PUT, form data)
    UPDATE: (id: string) => `/credentials/${id}`,
    // Delete credential by ID (DELETE)
    DELETE: (id: string) => `/credentials/${id}`,
    // List credentials by provider (GET)
    LIST_BY_PROVIDER: (providerName: string) =>
      `/credentials/provider/${providerName}`,
    // Check encryption health (GET)
    ENCRYPTION_HEALTH: "/credentials/encryption/health",
    // Generate encryption key (POST, form data)
    GENERATE_ENCRYPTION_KEY: "/credentials/encryption/generate-key",
  },

  // Provider endpoints
  PROVIDERS: {
    // 1. Get all providers (GET, supports ?active_only=true)
    LIST: "/providers",

    // 2. Get providers by task type (GET, supports ?active_only=true)
    LIST_BY_TASK: (taskType: string) => `/providers/task/${taskType}`,

    // 3. Get provider details by name (GET, supports ?active_only=true)
    GET: (providerName: string) => `/providers/${providerName}`,

    // 4. Get task config for a provider (GET)
    GET_TASK_CONFIG: (providerName: string, taskType: string) =>
      `/providers/${providerName}/tasks/${taskType}`,

    // 5. (Commented out) Refresh providers from YAML config (POST)
    // REFRESH: "/providers/refresh",

    // 6. (Commented out) Activate a provider (PATCH)
    // ACTIVATE: (providerName: string) => `/providers/${providerName}/activate`,

    // 7. (Commented out) Deactivate a provider (PATCH)
    // DEACTIVATE: (providerName: string) => `/providers/${providerName}/deactivate`,
  },

  MODELS: {
    // 1. Create a new model (POST)
    CREATE: "/models",

    // 2. List all models (GET, supports skip/limit/type/credential_id/active_only query)
    LIST: "/models",

    // 3. Get model statistics (GET)
    STATS: "/models/stats",

    // 4. Get default model by type (GET)
    //    modelType: "chat" | "embedding"
    GET_DEFAULT: (modelType: "chat" | "embedding") =>
      `/models/default/${modelType}`,

    // 5. Get model by ID (GET)
    GET: (modelId: string) => `/models/${modelId}`,

    // 6. Update model by ID (PUT)
    UPDATE: (modelId: string) => `/models/${modelId}`,

    // 7. Delete model by ID (DELETE)
    DELETE: (modelId: string) => `/models/${modelId}`,

    // 8. Set model as default (POST)
    SET_DEFAULT: (modelId: string) => `/models/${modelId}/set-default`,

    // 9. Get models by credential (GET)
    BY_CREDENTIAL: (credentialId: string) =>
      `/models/by-credential/${credentialId}`,
  },

  // Embedding endpoints
  EMBEDDING: {
    // 1. Get all available embedding models (GET)
    MODELS: "/embedding/models",

    // 2. Create an embedding task (POST)
    CREATE: "/embedding/create",

    // 3. Create a similarity search task (POST)
    SEARCH: "/embedding/search",

    // 4. Get task status (GET)
    STATUS: (taskId: string) => `/embedding/status/${taskId}`,

    // 6. Cancel a running task (DELETE)
    CANCEL: (taskId: string) => `/embedding/cancel/${taskId}`,

    // 7. Get active tasks (GET)
    ACTIVE: "/embedding/active",
  },

  // Task endpoints
  TASKS: {
    // 1. Get all tasks (GET)
    LIST: "/tasks",
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

// Helper function to get auth headers
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
