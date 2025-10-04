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
