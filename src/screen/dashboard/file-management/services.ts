import { ENDPOINTS } from "@/consts/endpoint";
import { httpClient } from "@/lib/axios";
import { mapFileItem, type FileItem } from "./types";

export class FileService {
  static async getFiles(token: string): Promise<FileItem[]> {
    try {
      const response = await httpClient.get(
        ENDPOINTS.FILES.LIST,
        undefined,
        token
      );
      const payload = response.getData() as any;
      const files = payload.map(mapFileItem);
      return files;
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
    token?: string
  ): Promise<FileItem[]> {
    try {
      // Use the same search endpoint as FileList component
      const response = await httpClient.get(
        ENDPOINTS.FILES.SEARCH,
        { q: searchQuery },
        token
      );

      const payload = response.getData() as any;
      const files = payload.map(mapFileItem);

      return files;
    } catch (error) {
      console.error("Failed to fetch files:", error);
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
      const response = await httpClient.get(
        ENDPOINTS.FILES.GET(id),
        undefined,
        token
      );
      const payload = response.getData() as unknown;
      const payloadObj = payload as Record<string, unknown>;

      // Handle different response formats
      const fileData = payloadObj?.data || payload;

      if (!fileData) {
        return null;
      }

      // Map the same way as in getFiles

      const fileDataObj = fileData as any;
      const nameFromParts = fileDataObj?.file_name
        ? `${fileDataObj.file_name}${fileDataObj.file_ext || ""}`
        : undefined;
      const derivedName =
        fileDataObj?.name ||
        nameFromParts ||
        fileDataObj?.filename ||
        fileDataObj?.originalName ||
        (typeof fileDataObj?.file_path === "string"
          ? fileDataObj.file_path.split("/").pop()
          : undefined) ||
        "Untitled";

      const createdAt =
        fileDataObj?.createdAt ||
        fileDataObj?.created_at ||
        fileDataObj?.created ||
        fileDataObj?.uploadedAt;
      const updatedAt =
        fileDataObj?.updatedAt ||
        fileDataObj?.updated_at ||
        fileDataObj?.modifiedAt ||
        createdAt;

      return {
        id: fileDataObj?.id || fileDataObj?._id || fileDataObj?.file_id || id,
        name: String(derivedName),
        type: fileDataObj?.type || fileDataObj?.file_type || "",
        size: Number(fileDataObj?.size ?? fileDataObj?.file_size ?? 0),
        createdAt: createdAt || new Date().toISOString(),
        updatedAt: updatedAt || new Date().toISOString(),
        url: fileDataObj?.url || fileDataObj?.link,
        owner: fileDataObj?.owner || fileDataObj?.user_id,
        tags: Array.isArray(fileDataObj?.tags) ? fileDataObj.tags : undefined,
      };
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
      const response = await httpClient.get(
        ENDPOINTS.FILES.TYPES,
        undefined,
        token
      );
      const payload = response.getData() as unknown;
      const payloadObj = payload as Record<string, unknown>;

      const arr = Array.isArray(payload)
        ? payload
        : Array.isArray(payloadObj?.types)
        ? payloadObj.types
        : Array.isArray(payloadObj?.data)
        ? payloadObj.data
        : [];

      return arr.map((t: unknown) => String(t));
    } catch (error) {
      console.error("Failed to fetch file types:", error);
      return [];
    }
  }

  /**
   * Get file statistics for header display
   */
  static async getFileStats(token?: string): Promise<{
    total_files: number;
    total_size_mb: number;
    file_types: Record<string, number>;
  } | null> {
    try {
      const response = await httpClient.get(
        ENDPOINTS.FILES.STATS,
        undefined,
        token
      );
      const payload = response.getData() as any;

      return {
        total_files: Number(payload?.total_files ?? 0),
        total_size_mb: Number(payload?.total_size_mb ?? 0),
        file_types: payload?.file_types ?? {},
      };
    } catch (error) {
      console.error("Failed to fetch file stats:", error);
      return null;
    }
  }
}
