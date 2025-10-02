import { create } from "zustand";
import { FileService } from "./services";
import type {
  BatchDeleteOptions,
  FileItem,
  FileStoreActions,
  FileStoreState,
} from "./types";

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
    set({ isSearching: true, error: null });

    try {
      const files = await FileService.searchFiles(query, token);
      set({
        searchResults: files,
        isSearching: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to search files";
      set({
        error: errorMessage,
        isSearching: false,
      });
    }
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
      set({ isLoading: true, error: null });

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
        set((state) => ({
          files: [uploadedFile, ...state.files],
          isLoading: false,
        }));
        return uploadedFile;
      }

      set({ isLoading: false });
      return null;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload file";
      set({ error: errorMessage, isLoading: false });
      return null;
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

  reset: () => {
    set({
      files: [],
      isLoading: false,
      error: null,
      availableFileTypes: [],
      lastFetchTime: null,
      stats: null,
      searchResults: [],
      isSearching: false,
    });
  },
}));
