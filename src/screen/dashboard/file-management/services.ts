import { ENDPOINTS } from "@/consts/endpoint";
import { httpClient } from "@/lib/axios";
import {
  mapFileItem,
  type BackendFileItem,
  type BatchDeleteOptions,
  type BatchDeleteRequest,
  type BatchDeleteResponse,
  type FileItem,
  type FileStats,
  type FileStatsResponse,
  type SearchFilters,
  type UploadMetadataRequest,
  type UploadUrlRequest,
  type UploadUrlResponse,
} from "./types";

export class FileService {
  static async getFiles(token: string): Promise<FileItem[]> {
    try {
      const response = await httpClient.get<BackendFileItem[]>(
        ENDPOINTS.FILES.LIST,
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch files:", response.message);
        return [];
      }

      const files = response.getData();
      return files.map(mapFileItem);
    } catch (error) {
      console.error("Failed to fetch files:", error);
      return [];
    }
  }

  /**
   * Search files by name - uses the same logic as FileList component
   */
  static async searchFiles(
    searchQuery: string,
    token: string
  ): Promise<FileItem[]> {
    try {
      const response = await httpClient.get<BackendFileItem[]>(
        ENDPOINTS.FILES.SEARCH,
        { q: searchQuery },
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to search files:", response.message);
        return [];
      }

      const files = response.getData();
      return files.map(mapFileItem);
    } catch (error) {
      console.error("Failed to search files:", error);
      return [];
    }
  }

  /**
   * Get a specific file by ID
   */
  static async getFileById(
    id: string,
    token?: string
  ): Promise<FileItem | null> {
    try {
      const response = await httpClient.get<BackendFileItem>(
        ENDPOINTS.FILES.GET(id),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch file by ID:", response.message);
        return null;
      }

      const fileData = response.getData();
      return mapFileItem(fileData);
    } catch (error) {
      console.error("Failed to fetch file by ID:", error);
      return null;
    }
  }

  /**
   * Get available file types
   */
  static async getFileTypes(token?: string): Promise<string[]> {
    try {
      const response = await httpClient.get<string[]>(
        ENDPOINTS.FILES.TYPES,
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch file types:", response.message);
        return [];
      }

      return response.getData();
    } catch (error) {
      console.error("Failed to fetch file types:", error);
      return [];
    }
  }

  /**
   * Get file statistics for header display
   */
  static async getFileStats(token?: string): Promise<FileStats | null> {
    try {
      const response = await httpClient.get<FileStatsResponse>(
        ENDPOINTS.FILES.STATS,
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch file stats:", response.message);
        return null;
      }

      const stats = response.getData();
      return {
        total_files: stats.total_files,
        total_size_mb: stats.total_size_mb,
        file_types: stats.file_types,
        totalFiles: stats.total_files,
        totalSize: stats.total_size,
        totalUsers: undefined,
        filesByType: stats.file_types,
        filesByMonth: undefined,
        storageUsage: undefined,
        recentActivity: undefined,
        topFileTypes: undefined,
        averageFileSize: undefined,
        oldestFile: undefined,
        newestFile: undefined,
      };
    } catch (error) {
      console.error("Failed to fetch file stats:", error);
      return null;
    }
  }

  /**
   * Get presigned upload URL for direct upload to MinIO
   */
  static async getUploadUrl(
    fileName: string,
    fileSize: number,
    fileType: string,
    token: string
  ): Promise<{
    uploadUrl: string;
    objectName: string;
    expiresIn: number;
  } | null> {
    try {
      console.log("🔗 Getting upload URL for:", {
        fileName,
        fileSize,
        fileType,
      });

      const request: UploadUrlRequest = {
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
      };

      const response = await httpClient.post<UploadUrlResponse>(
        ENDPOINTS.FILES.UPLOAD_URL,
        request,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to get upload URL:", response.message);
        return null;
      }

      const data = response.getData();
      console.log("📥 Upload URL response:", data);

      if (!data?.upload_url) {
        console.error("❌ No upload URL in response:", data);
        return null;
      }

      console.log("✅ Upload URL obtained:", data.upload_url);
      return {
        uploadUrl: data.upload_url,
        objectName: data.object_name,
        expiresIn: data.expires_in || 10,
      };
    } catch (error) {
      console.error("❌ Failed to get upload URL:", error);
      return null;
    }
  }

  /**
   * Upload file directly to MinIO using presigned URL
   */
  static async uploadToMinIO(
    file: File,
    uploadUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    try {
      console.log("📤 Uploading to MinIO:", {
        fileName: file.name,
        size: file.size,
      });

      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress?.(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log("✅ MinIO upload completed successfully");
            resolve(true);
          } else {
            resolve(false);
          }
        });

        xhr.addEventListener("error", () => {
          console.error("❌ MinIO upload error:", xhr.statusText);
          resolve(false);
        });

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (error) {
      console.error("❌ Failed to upload to MinIO:", error);
      return false;
    }
  }

  /**
   * Save file metadata to database after successful upload
   */
  static async saveFileMetadata(
    objectName: string,
    fileName: string,
    fileSize: number,
    fileType: string,
    token: string
  ): Promise<FileItem | null> {
    try {
      console.log("💾 Saving file metadata:", {
        objectName,
        fileName,
        fileSize,
        fileType,
      });

      const request: UploadMetadataRequest = {
        object_name: objectName,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
      };

      const response = await httpClient.post<BackendFileItem>(
        ENDPOINTS.FILES.UPLOAD,
        request,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to save file metadata:", response.message);
        return null;
      }

      const uploaded = response.getData();
      console.log("📥 Metadata save response:", uploaded);

      const fileItem = mapFileItem(uploaded);
      console.log("✅ File metadata saved:", fileItem);
      return fileItem;
    } catch (error) {
      console.error("❌ Failed to save file metadata:", error);
      return null;
    }
  }

  /**
   * Complete upload flow: Get URL -> Upload to MinIO -> Save metadata
   */
  static async uploadFile(
    file: File,
    token: string,
    onProgress?: (progress: number) => void
  ): Promise<FileItem | null> {
    try {
      console.log("📤 Starting upload process for:", file.name);

      // Step 1: Get presigned upload URL
      console.log("🔗 Step 1: Getting upload URL...");
      onProgress?.(10);

      const uploadData = await this.getUploadUrl(
        file.name,
        file.size,
        file.type,
        token
      );

      if (!uploadData) {
        throw new Error("Failed to get upload URL");
      }

      // Step 2: Upload file directly to MinIO
      console.log("☁️ Step 2: Uploading to MinIO...");
      onProgress?.(30);

      const uploadSuccess = await this.uploadToMinIO(
        file,
        uploadData.uploadUrl,
        (progress) => {
          // Map MinIO progress (0-100) to overall progress (30-70)
          const overallProgress = 30 + progress * 0.4;
          onProgress?.(Math.round(overallProgress));
        }
      );

      if (!uploadSuccess) {
        throw new Error("Failed to upload file to MinIO");
      }

      onProgress?.(70);

      // Step 3: Save metadata to database
      console.log("💾 Step 3: Saving metadata...");
      const fileItem = await this.saveFileMetadata(
        uploadData.objectName,
        file.name,
        file.size,
        file.type,
        token
      );

      onProgress?.(100);
      console.log("✅ Upload completed successfully");
      return fileItem;
    } catch (error) {
      console.error("❌ Upload failed:", error);
      return null;
    }
  }

  /**
   * Delete a single file
   */
  static async deleteFile(fileId: string, token: string): Promise<boolean> {
    try {
      console.log("🗑️ Deleting file:", fileId);
      console.log("🔗 Delete endpoint:", ENDPOINTS.FILES.DELETE(fileId));
      console.log("🔑 Token available:", !!token);

      const response = await httpClient.delete<boolean>(
        ENDPOINTS.FILES.DELETE(fileId),
        undefined,
        token
      );

      console.log("📊 Response status:", response.statusCode);
      console.log("📊 Response success:", response.isSuccess);
      console.log("📊 Response data:", response.getData());

      if (!response.isSuccess) {
        console.error("❌ Failed to delete file:", response.message);
        return false;
      }

      const result = response.getData();
      console.log("📥 Delete response:", result);
      console.log("✅ File deleted successfully:", fileId);

      // If response is successful (status 200) and no data returned, consider it success
      if (result === undefined || result === null) {
        console.log(
          "📥 No data returned, but status is 200 - considering success"
        );
        return true;
      }

      // Check if result is an object and has a 'success' property, or is a boolean
      if (
        typeof result === "object" &&
        result !== null &&
        "success" in result
      ) {
        // @ts-expect-error: We expect 'success' property to exist if present
        return result.success === true;
      }
      return result === true;
    } catch (error) {
      console.error("❌ Failed to delete file:", error);
      return false;
    }
  }

  /**
   * Delete multiple files in batch
   */
  static async deleteFiles(
    fileIds: string[],
    token: string,
    options?: BatchDeleteOptions
  ): Promise<boolean> {
    try {
      console.log("🗑️ Batch deleting files:", fileIds);
      console.log("🔗 Batch delete endpoint:", ENDPOINTS.FILES.BATCH_DELETE);

      const batchSize = options?.batchSize || 10;

      if (fileIds.length <= batchSize) {
        // Single batch delete
        const request: BatchDeleteRequest = { file_ids: fileIds };
        console.log("📤 Sending batch delete request:", request);

        const response = await httpClient.post<BatchDeleteResponse>(
          ENDPOINTS.FILES.BATCH_DELETE,
          request,
          token
        );

        if (!response.isSuccess) {
          console.error("❌ Batch delete failed:", response.message);
          return false;
        }

        const data = response.getData();
        console.log("📥 Batch delete response:", data);

        const successIds = data.successful || [];
        const failedIds = data.failed?.map((f) => f.file_id) || [];

        console.log("✅ Successful deletions:", successIds);
        console.log("❌ Failed deletions:", failedIds);

        if (successIds.length > 0) {
          options?.onSuccess?.(successIds);
        }
        if (failedIds.length > 0) {
          options?.onError?.("Some files could not be deleted", failedIds);
        }

        const result = successIds.length > 0;
        console.log("🎯 Batch delete result:", result);
        return result;
      } else {
        // Chunked delete
        const successIds: string[] = [];
        const failedIds: string[] = [];
        let completed = 0;

        for (let i = 0; i < fileIds.length; i += batchSize) {
          const chunk = fileIds.slice(i, i + batchSize);

          for (const fileId of chunk) {
            try {
              await this.deleteFile(fileId, token);
              successIds.push(fileId);
            } catch {
              failedIds.push(fileId);
            }

            completed++;
            options?.onProgress?.({
              completed,
              total: fileIds.length,
            });
          }
        }

        if (successIds.length > 0) {
          options?.onSuccess?.(successIds);
        }
        if (failedIds.length > 0) {
          options?.onError?.("Some files could not be deleted", failedIds);
        }

        return successIds.length > 0;
      }
    } catch (error) {
      console.error("Failed to delete files:", error);
      return false;
    }
  }

  /**
   * Rename a file
   */
  static async renameFile(
    fileId: string,
    newName: string,
    token: string
  ): Promise<FileItem | null> {
    try {
      console.log("📝 Renaming file:", { fileId, newName });

      const response = await httpClient.put<BackendFileItem>(
        `${ENDPOINTS.FILES.RENAME(fileId)}?new_name=${encodeURIComponent(
          newName
        )}`,
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to rename file:", response.message);
        return null;
      }

      const updatedFile = response.getData();
      console.log("✅ File renamed successfully:", updatedFile);
      return mapFileItem(updatedFile);
    } catch (error) {
      console.error("Failed to rename file:", error);
      return null;
    }
  }

  /**
   * Download a file by ID - returns download URL
   */
  static async downloadFile(
    fileId: string,
    token: string
  ): Promise<string | null> {
    try {
      console.log("🔗 Getting download URL for file:", fileId);

      const response = await httpClient.get<string>(
        ENDPOINTS.FILES.DOWNLOAD(fileId),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to get download URL:", response.message);
        return null;
      }

      const downloadUrl = response.getData();
      console.log("📥 Download URL received:", downloadUrl);

      if (typeof downloadUrl === "string" && downloadUrl.startsWith("http")) {
        return downloadUrl;
      }

      console.warn("❌ Invalid download response:", downloadUrl);
      return null;
    } catch (error) {
      console.error("❌ Failed to get download URL:", error);
      return null;
    }
  }

  /**
   * Download file directly using anchor tag
   */
  static async downloadAndOpenFile(
    fileId: string,
    token: string
  ): Promise<boolean> {
    try {
      const downloadUrl = await this.downloadFile(fileId, token);

      if (!downloadUrl) {
        console.error("❌ No download URL available");
        return false;
      }

      // Create anchor element for direct download
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = ""; // This forces download instead of navigation
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      console.log("✅ File download initiated");
      return true;
    } catch (error) {
      console.error("❌ Failed to download file:", error);
      return false;
    }
  }

  /**
   * Search files with advanced filters
   */
  static async searchFilesWithFilters(
    filters: SearchFilters,
    token: string
  ): Promise<FileItem[]> {
    try {
      const params: Record<string, string> = {};

      if (filters.query?.trim()) {
        params.q = filters.query.trim();
      }
      if (filters.fileType) {
        params.file_type = filters.fileType;
      }
      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo) {
        params.dateTo = filters.dateTo;
      }
      if (filters.sizeMin) {
        params.sizeMin = filters.sizeMin.toString();
      }
      if (filters.sizeMax) {
        params.sizeMax = filters.sizeMax.toString();
      }
      if (filters.owner) {
        params.owner = filters.owner;
      }
      if (filters.tags && filters.tags.length > 0) {
        params.tags = filters.tags.join(",");
      }
      if (filters.limit) {
        params.limit = filters.limit.toString();
      } else {
        params.limit = "50";
      }

      const response = await httpClient.get<BackendFileItem[]>(
        ENDPOINTS.FILES.SEARCH,
        params,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to search files:", response.message);
        return [];
      }

      const files = response.getData();
      return files.map(mapFileItem);
    } catch (error) {
      console.error("Failed to search files:", error);
      return [];
    }
  }
}
