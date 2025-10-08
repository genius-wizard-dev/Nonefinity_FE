import { ENDPOINTS } from "@/consts/endpoint";
import { httpClient } from "@/lib/axios";
import type {
  EmbeddingActiveResponse,
  EmbeddingCreateRequest,
  EmbeddingModel,
  EmbeddingSearchRequest,
  EmbeddingStatusResponse,
  EmbeddingTaskResponse,
} from "./type";

export class EmbeddingService {
  /**
   * Get all available embedding models
   */
  static async getModels(token?: string): Promise<EmbeddingModel[]> {
    try {
      console.log("🔧 Fetching embedding models");

      const response = await httpClient.get<{ models: EmbeddingModel[] }>(
        ENDPOINTS.EMBEDDING.MODELS,
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch embedding models:", response.message);
        return [];
      }

      const data = response.getData();
      console.log("📥 Embedding models response:", data);

      return data.models || [];
    } catch (error) {
      console.error("❌ Failed to fetch embedding models:", error);
      return [];
    }
  }

  /**
   * Create an embedding task
   */
  static async createEmbedding(
    data: EmbeddingCreateRequest,
    token?: string
  ): Promise<{ success: boolean; taskId?: string; error?: string }> {
    try {
      console.log("🔧 Creating embedding task:", data);

      const response = await httpClient.post<EmbeddingTaskResponse>(
        ENDPOINTS.EMBEDDING.CREATE,
        data,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to create embedding task:", response.message);
        return {
          success: false,
          error: response.message || "Failed to create embedding task",
        };
      }

      const responseData = response.getData();
      console.log("📥 Create embedding response:", responseData);

      return { success: true, taskId: responseData.task_id };
    } catch (error) {
      console.error("❌ Embedding creation error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Create a similarity search task
   */
  static async createSearch(
    data: EmbeddingSearchRequest,
    token?: string
  ): Promise<{ success: boolean; taskId?: string; error?: string }> {
    try {
      console.log("🔧 Creating similarity search task:", data);

      const response = await httpClient.post<EmbeddingTaskResponse>(
        ENDPOINTS.EMBEDDING.SEARCH,
        data,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to create search task:", response.message);
        return {
          success: false,
          error: response.message || "Failed to create search task",
        };
      }

      const responseData = response.getData();
      console.log("📥 Create search response:", responseData);

      return { success: true, taskId: responseData.task_id };
    } catch (error) {
      console.error("❌ Search creation error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Get task status
   */
  static async getTaskStatus(
    taskId: string,
    token?: string
  ): Promise<EmbeddingStatusResponse | null> {
    try {
      console.log("🔧 Fetching task status:", { taskId });

      const response = await httpClient.get<EmbeddingStatusResponse>(
        ENDPOINTS.EMBEDDING.STATUS(taskId),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch task status:", response.message);
        return null;
      }

      const data = response.getData();
      console.log("📥 Task status response:", data);

      return data;
    } catch (error) {
      console.error("❌ Failed to fetch task status:", error);
      return null;
    }
  }

  /**
   * Cancel a running task
   */
  static async cancelTask(
    taskId: string,
    token?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🔧 Canceling task:", { taskId });

      const response = await httpClient.delete<{
        success: boolean;
        message: string;
      }>(ENDPOINTS.EMBEDDING.CANCEL(taskId), undefined, token);

      if (!response.isSuccess) {
        console.error("❌ Failed to cancel task:", response.message);
        return {
          success: false,
          error: response.message || "Failed to cancel task",
        };
      }

      const data = response.getData();
      console.log("📥 Cancel task response:", data);

      return { success: true };
    } catch (error) {
      console.error("❌ Task cancellation error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Get active tasks
   */
  static async getActiveTasks(
    token?: string
  ): Promise<EmbeddingActiveResponse | null> {
    try {
      console.log("🔧 Fetching active tasks");

      const response = await httpClient.get<EmbeddingActiveResponse>(
        ENDPOINTS.EMBEDDING.ACTIVE,
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch active tasks:", response.message);
        return null;
      }

      const data = response.getData();
      console.log("📥 Active tasks response:", data);

      // Handle the case where active_tasks might be an object or array
      const activeTasks = Array.isArray(data.active_tasks)
        ? data.active_tasks
        : data.active_tasks
        ? (Object.values(data.active_tasks) as any[])
        : [];

      return {
        ...data,
        active_tasks: activeTasks,
      };
    } catch (error) {
      console.error("❌ Failed to fetch active tasks:", error);
      return null;
    }
  }
}
