import { create } from "zustand";
import { FileService } from "./services";
import type {
  BatchDeleteOptions,
  FileItem,
  FileStoreActions,
  FileStoreState,
} from "./types";

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

interface FileStore extends FileStoreState, FileStoreActions {}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  isLoading: false,
  error: null,
  availableFileTypes: [],
  lastFetchTime: null,
  stats: null,
  searchResults: [],
  isSearching: false,
  searchTimeout: null,
  uploadFiles: [],
  isUploading: false,

  fetchFiles: async (token: string, force = false) => {
    const { lastFetchTime } = get();
    const now = Date.now();

    // Don't fetch if we have recent data (within 30 seconds) and not forced
    if (!force && lastFetchTime && now - lastFetchTime < 30000) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const files = await FileService.getFiles(token);
      set({
        files,
        isLoading: false,
        lastFetchTime: now,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to fetch files";
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  searchFiles: async (query: string, token: string) => {
    const { searchTimeout } = get();

    // Always clear existing timeout first
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      set({ searchTimeout: null });
    }

    // If query is empty, clear search immediately
    if (!query || query.trim() === "") {
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Empty query, clearing search");
      }
      set({
        searchResults: [],
        isSearching: false,
        searchTimeout: null,
        error: null,
      });
      return;
    }

    // Trim query for consistency
    const trimmedQuery = query.trim();

    // Set loading state immediately for user feedback
    set({ isSearching: true, error: null });

    // Create new timeout for debounce
    const timeoutId = setTimeout(async () => {
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Executing search for:", trimmedQuery);
      }

      try {
        const files = await FileService.searchFiles(trimmedQuery, token);
        if (process.env.NODE_ENV === "development") {
          console.log("🔍 Search results received:", files.length, "files");
        }

        // Only update if this is still the current search
        const currentTimeout = get().searchTimeout;
        if (currentTimeout === timeoutId) {
          set({
            searchResults: files,
            isSearching: false,
            searchTimeout: null,
            error: null,
          });
          if (process.env.NODE_ENV === "development") {
            console.log("🔍 Search completed successfully");
          }
        } else {
          if (process.env.NODE_ENV === "development") {
            console.log("🔍 Search cancelled, newer search in progress");
          }
        }
      } catch (error: any) {
        console.error("🔍 Search error:", error);
        const errorMessage =
          error?.response?.data?.message || "Failed to search files";

        // Only update error if this is still the current search
        const currentTimeout = get().searchTimeout;
        if (currentTimeout === timeoutId) {
          set({
            error: errorMessage,
            isSearching: false,
            searchTimeout: null,
          });
        }
      }
    }, 300); // Reduced to 300ms for faster response

    set({ searchTimeout: timeoutId });
  },

  fetchFileTypes: async (token?: string) => {
    try {
      const types = await FileService.getFileTypes(token);
      set({ availableFileTypes: types });
    } catch {
      console.warn("Failed to load file types filter");
    }
  },

  fetchStats: async (token?: string) => {
    try {
      const stats = await FileService.getFileStats(token);
      set({ stats });
    } catch {
      console.warn("Failed to load file stats");
    }
  },

  uploadFile: async (file: File, token: string) => {
    try {
      // Don't set global loading state - use progress modal instead
      console.log("🔄 Starting upload process for:", file.name);

      // Step 1: Get presigned upload URL
      const uploadData = await FileService.getUploadUrl(
        file.name,
        file.size,
        file.type,
        token
      );

      if (!uploadData) {
        throw new Error("Failed to get upload URL");
      }

      // Step 2: Upload file directly to MinIO
      const uploadSuccess = await FileService.uploadToMinIO(
        file,
        uploadData.uploadUrl
      );

      if (!uploadSuccess) {
        throw new Error("Failed to upload file to MinIO");
      }

      // Step 3: Save metadata to database
      const uploadedFile = await FileService.saveFileMetadata(
        uploadData.objectName,
        file.name,
        file.size,
        file.type,
        token
      );

      if (uploadedFile) {
        // Don't add to files list here - let fetchFiles handle it
        // This prevents duplicate files when fetchFiles is called after upload
        return uploadedFile;
      }

      return null;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload file";
      console.error("Upload error:", errorMessage);
      throw error; // Re-throw to be handled by the progress system
    }
  },

  deleteFile: async (fileId: string, token: string) => {
    try {
      console.log("🏪 Store: Starting delete for file:", fileId);
      const success = await FileService.deleteFile(fileId, token);
      console.log("🏪 Store: Delete result:", success);

      if (success) {
        set((state) => {
          const newFiles = state.files.filter((file) => file.id !== fileId);
          console.log("🏪 Store: Files after delete:", newFiles.length);
          return { files: newFiles };
        });
      }
      return success;
    } catch (error: any) {
      console.error("🏪 Store: Delete error:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to delete file";
      set({ error: errorMessage });
      return false;
    }
  },

  deleteFiles: async (
    fileIds: string[],
    token: string,
    options?: BatchDeleteOptions
  ) => {
    try {
      const success = await FileService.deleteFiles(fileIds, token, options);
      if (success) {
        set((state) => ({
          files: state.files.filter((file) => !fileIds.includes(file.id)),
        }));
      }
      return success;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to delete files";
      set({ error: errorMessage });
      return false;
    }
  },

  renameFile: async (fileId: string, newName: string, token: string) => {
    try {
      const updatedFile = await FileService.renameFile(fileId, newName, token);
      if (updatedFile) {
        set((state) => ({
          files: state.files.map((file) =>
            file.id === fileId ? updatedFile : file
          ),
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to rename file";
      set({ error: errorMessage });
      return false;
    }
  },

  downloadFile: async (fileId: string, token: string) => {
    try {
      return await FileService.downloadAndOpenFile(fileId, token);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to download file";
      set({ error: errorMessage });
      return false;
    }
  },

  addFile: (file: FileItem) => {
    set((state) => ({
      files: [file, ...state.files],
    }));
  },

  updateFile: (fileId: string, updates: Partial<FileItem>) => {
    set((state) => ({
      files: state.files.map((file) =>
        file.id === fileId ? { ...file, ...updates } : file
      ),
    }));
  },

  removeFile: (fileId: string) => {
    set((state) => ({
      files: state.files.filter((file) => file.id !== fileId),
    }));
  },

  removeFiles: (fileIds: string[]) => {
    set((state) => ({
      files: state.files.filter((file) => !fileIds.includes(file.id)),
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  clearSearch: () => {
    const { searchTimeout } = get();
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 Clearing search");
    }
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Timeout cleared");
      }
    }
    set({
      searchResults: [],
      isSearching: false,
      searchTimeout: null,
      error: null,
    });
  },

  refreshData: async (token: string) => {
    const { fetchFiles, fetchStats } = get();
    await Promise.all([
      fetchFiles(token, true), // Force refresh
      fetchStats(token),
    ]);
  },

  // Upload progress management
  startUpload: (files: File[]) => {
    const uploadFiles: UploadFile[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "uploading" as const,
    }));

    set({
      uploadFiles,
      isUploading: true,
      error: null,
    });
  },

  updateUploadProgress: (fileId: string, progress: number) => {
    set((state) => ({
      uploadFiles: state.uploadFiles.map((uf) =>
        uf.id === fileId ? { ...uf, progress } : uf
      ),
    }));
  },

  completeUpload: (fileId: string) => {
    set((state) => {
      const newUploadFiles = state.uploadFiles.map((uf) =>
        uf.id === fileId
          ? { ...uf, status: "completed" as const, progress: 100 }
          : uf
      );

      const allCompleted = newUploadFiles.every(
        (uf) => uf.status === "completed" || uf.status === "error"
      );

      return {
        uploadFiles: newUploadFiles,
        isUploading: !allCompleted,
        // Don't add files here - let fetchFiles handle it to prevent duplicates
      };
    });
  },

  failUpload: (fileId: string, error: string) => {
    set((state) => {
      const newUploadFiles = state.uploadFiles.map((uf) =>
        uf.id === fileId ? { ...uf, status: "error" as const, error } : uf
      );

      const allCompleted = newUploadFiles.every(
        (uf) => uf.status === "completed" || uf.status === "error"
      );

      return {
        uploadFiles: newUploadFiles,
        isUploading: !allCompleted,
      };
    });
  },

  clearUploads: () => {
    set({
      uploadFiles: [],
      isUploading: false,
    });
  },

  reset: () => {
    const { searchTimeout } = get();
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    set({
      files: [],
      isLoading: false,
      error: null,
      availableFileTypes: [],
      lastFetchTime: null,
      stats: null,
      searchResults: [],
      isSearching: false,
      searchTimeout: null,
      uploadFiles: [],
      isUploading: false,
    });
  },
}));
