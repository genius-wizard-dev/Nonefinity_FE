import { api } from "./axios";

export interface FileItem {
    id: string;
    name: string;
    type: string;
    size: number;
    createdAt: string;
    updatedAt: string;
    url?: string;
    owner?: string;
    tags?: string[];
}

export interface FileListResponse {
    files: FileItem[];
    total: number;
    page: number;
    limit: number;
}

export class FileService {
    /**
     * Get list of files - uses the same logic as FileList component
     */
    static async getFiles(page = 1, limit = 100): Promise<FileListResponse> {
        try {
            // Use the same endpoint as FileList component
            const response = await api.get("/api/v1/file/list");
            const payload = response.data;

            // Use the same response handling logic as FileList
            const rawList = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.files)
                ? payload.files
                : Array.isArray(payload?.data)
                ? payload.data
                : Array.isArray(payload?.items)
                ? payload.items
                : Array.isArray(payload?.results)
                ? payload.results
                : [];

            // Map server fields (snake_case) to FileItem shape - same as FileList
            const mapped: FileItem[] = rawList.map((it: any) => {
                const nameFromParts = it?.file_name
                    ? `${it.file_name}${it.file_ext || ""}`
                    : undefined;
                const derivedName =
                    it?.name ||
                    nameFromParts ||
                    it?.filename ||
                    it?.originalName ||
                    (typeof it?.file_path === "string"
                        ? it.file_path.split("/").pop()
                        : undefined) ||
                    "Untitled";

                const createdAt =
                    it?.createdAt ||
                    it?.created_at ||
                    it?.created ||
                    it?.uploadedAt;
                const updatedAt =
                    it?.updatedAt ||
                    it?.updated_at ||
                    it?.modifiedAt ||
                    createdAt;

                return {
                    id:
                        it?.id ||
                        it?._id ||
                        it?.file_id ||
                        String(Math.random()),
                    name: String(derivedName),
                    type: it?.type || it?.file_type || "",
                    size: Number(it?.size ?? it?.file_size ?? 0),
                    createdAt: createdAt || new Date().toISOString(),
                    updatedAt: updatedAt || new Date().toISOString(),
                    url: it?.url || it?.link,
                    owner: it?.owner || it?.user_id,
                    tags: Array.isArray(it?.tags) ? it.tags : undefined,
                };
            });

            return {
                files: mapped,
                total: mapped.length,
                page: page,
                limit: limit,
            };
        } catch (error) {
            console.error("Failed to fetch files:", error);
            // Return empty result on error
            return {
                files: [],
                total: 0,
                page: page,
                limit: limit,
            };
        }
    }

    /**
     * Search files by name - uses the same logic as FileList component
     */
    static async searchFiles(
        searchQuery: string,
        page = 1,
        limit = 100
    ): Promise<FileListResponse> {
        try {
            // Use the same search endpoint as FileList component
            const response = await api.get("/api/v1/file/search", {
                params: { q: searchQuery },
            });
            const payload = response.data;

            // Use the same response handling logic as FileList
            const rawList = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.files)
                ? payload.files
                : Array.isArray(payload?.data)
                ? payload.data
                : Array.isArray(payload?.items)
                ? payload.items
                : Array.isArray(payload?.results)
                ? payload.results
                : [];

            // Map server fields (snake_case) to FileItem shape - same as FileList
            const mapped: FileItem[] = rawList.map((it: any) => {
                const nameFromParts = it?.file_name
                    ? `${it.file_name}${it.file_ext || ""}`
                    : undefined;
                const derivedName =
                    it?.name ||
                    nameFromParts ||
                    it?.filename ||
                    it?.originalName ||
                    (typeof it?.file_path === "string"
                        ? it.file_path.split("/").pop()
                        : undefined) ||
                    "Untitled";

                const createdAt =
                    it?.createdAt ||
                    it?.created_at ||
                    it?.created ||
                    it?.uploadedAt;
                const updatedAt =
                    it?.updatedAt ||
                    it?.updated_at ||
                    it?.modifiedAt ||
                    createdAt;

                return {
                    id:
                        it?.id ||
                        it?._id ||
                        it?.file_id ||
                        String(Math.random()),
                    name: String(derivedName),
                    type: it?.type || it?.file_type || "",
                    size: Number(it?.size ?? it?.file_size ?? 0),
                    createdAt: createdAt || new Date().toISOString(),
                    updatedAt: updatedAt || new Date().toISOString(),
                    url: it?.url || it?.link,
                    owner: it?.owner || it?.user_id,
                    tags: Array.isArray(it?.tags) ? it.tags : undefined,
                };
            });

            return {
                files: mapped,
                total: mapped.length,
                page: page,
                limit: limit,
            };
        } catch (error) {
            console.error("Failed to search files:", error);
            // Return empty result on error
            return {
                files: [],
                total: 0,
                page: page,
                limit: limit,
            };
        }
    }

    /**
     * Get a specific file by ID
     */
    static async getFileById(id: string): Promise<FileItem | null> {
        try {
            const response = await api.get(`/api/v1/files/${id}`);
            const payload = response.data;

            // Handle different response formats
            const fileData = payload?.data || payload;

            if (!fileData) {
                return null;
            }

            // Map the same way as in getFiles
            const nameFromParts = fileData?.file_name
                ? `${fileData.file_name}${fileData.file_ext || ""}`
                : undefined;
            const derivedName =
                fileData?.name ||
                nameFromParts ||
                fileData?.filename ||
                fileData?.originalName ||
                (typeof fileData?.file_path === "string"
                    ? fileData.file_path.split("/").pop()
                    : undefined) ||
                "Untitled";

            const createdAt =
                fileData?.createdAt ||
                fileData?.created_at ||
                fileData?.created ||
                fileData?.uploadedAt;
            const updatedAt =
                fileData?.updatedAt ||
                fileData?.updated_at ||
                fileData?.modifiedAt ||
                createdAt;

            return {
                id: fileData?.id || fileData?._id || fileData?.file_id || id,
                name: String(derivedName),
                type: fileData?.type || fileData?.file_type || "",
                size: Number(fileData?.size ?? fileData?.file_size ?? 0),
                createdAt: createdAt || new Date().toISOString(),
                updatedAt: updatedAt || new Date().toISOString(),
                url: fileData?.url || fileData?.link,
                owner: fileData?.owner || fileData?.user_id,
                tags: Array.isArray(fileData?.tags) ? fileData.tags : undefined,
            };
        } catch (error) {
            console.error("Failed to fetch file by ID:", error);
            return null;
        }
    }
}
