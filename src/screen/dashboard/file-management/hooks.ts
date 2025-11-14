import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { useFileStore } from "./store";

// Hook for programmatic batch deletion
export const useBatchDelete = () => {
  const { getToken } = useAuth();
  const { deleteFiles } = useFileStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);

  const deleteBatch = async (
    fileIds: string[],
    options?: {
      onSuccess?: (deletedIds: string[]) => void;
      onError?: (error: string, failedIds: string[]) => void;
      onProgress?: (progress: { completed: number; total: number }) => void;
      batchSize?: number;
    }
  ) => {
    setIsDeleting(true);
    setProgress(0);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const success = await deleteFiles(fileIds, token, {
        batchSize: options?.batchSize || 10,
        onSuccess: options?.onSuccess,
        onError: options?.onError,
        onProgress: (progress) => {
          const progressPercent = (progress.completed / progress.total) * 100;
          setProgress(progressPercent);
          options?.onProgress?.(progress);
        },
      });

      return success;
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Batch delete failed";
      options?.onError?.(errorMessage, fileIds);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteBatch, isDeleting, progress };
};
