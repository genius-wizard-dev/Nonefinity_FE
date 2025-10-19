import { ENDPOINTS } from "@/consts/endpoint";
import { httpClient } from "@/lib/axios";
import type {
  CancelTaskResponse,
  CreateEmbeddingResponse,
  CreateFileEmbeddingRequest,
  CreateSearchRequest,
  CreateTextEmbeddingRequest,
  EmbeddingTask,
  PollingConfig,
  ScrollDataRequest,
  ScrollDataResponse,
  TaskStatusResponse,
  TasksListRequest,
  TasksListResponse,
} from "./types";

// Embedding Service
export class EmbeddingService {
  /**
   * Create file embedding task
   */
  static async createFileEmbedding(
    data: CreateFileEmbeddingRequest
  ): Promise<CreateEmbeddingResponse> {
    const result = await httpClient.post<CreateEmbeddingResponse>(
      ENDPOINTS.EMBEDDING.CREATE,
      data
    );

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to create file embedding task");
    }

    return result.getData();
  }

  /**
   * Create text embedding task
   */
  static async createTextEmbedding(
    data: CreateTextEmbeddingRequest
  ): Promise<CreateEmbeddingResponse> {
    const result = await httpClient.post<CreateEmbeddingResponse>(
      ENDPOINTS.EMBEDDING.TEXT,
      data
    );

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to create text embedding task");
    }

    return result.getData();
  }

  /**
   * Create search task
   */
  static async createSearchTask(
    data: CreateSearchRequest
  ): Promise<CreateEmbeddingResponse> {
    const result = await httpClient.post<CreateEmbeddingResponse>(
      ENDPOINTS.EMBEDDING.SEARCH,
      data
    );

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to create search task");
    }

    return result.getData();
  }

  /**
   * Get task status
   */
  static async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    const result = await httpClient.get<TaskStatusResponse>(
      ENDPOINTS.EMBEDDING.STATUS(taskId)
    );

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to get task status");
    }

    return result.getData();
  }

  /**
   * Cancel task
   */
  static async cancelTask(taskId: string): Promise<CancelTaskResponse> {
    const result = await httpClient.delete<CancelTaskResponse>(
      ENDPOINTS.EMBEDDING.CANCEL(taskId)
    );

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to cancel task");
    }

    return result.getData();
  }

  /**
   * Poll task status until completion
   */
  static async pollTaskStatus(
    taskId: string,
    config: PollingConfig = {}
  ): Promise<EmbeddingTask> {
    const { interval = 2000, maxAttempts = 150, onProgress } = config;

    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const taskData = await this.getTaskStatus(taskId);

        const task: EmbeddingTask & { task_type?: string } = {
          task_id: taskData.task_id,
          status: taskData.status,
          type: "file", // Will be corrected by store logic
          ready: taskData.ready,
          successful: taskData.successful,
          failed: taskData.failed,
          result: taskData.result,
          error: taskData.error,
          meta: taskData.meta,
          created_at: taskData.created_at,
          // ✨ Pass through task_type from API for store to use
          task_type: taskData.task_type,
        };

        // Call progress callback
        if (onProgress) {
          onProgress(task);
        }

        // Check if task is completed
        if (taskData.ready) {
          if (taskData.successful) {
            return task;
          } else {
            throw new Error(taskData.error || "Task failed");
          }
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, interval));
        attempts++;
      } catch (error) {
        console.error(`Polling error for task ${taskId}:`, error);
        throw error;
      }
    }

    throw new Error(`Task ${taskId} timed out after ${maxAttempts} attempts`);
  }

  /**
   * Complete workflow for file embedding with polling
   */
  static async embedFile(
    fileId: string,
    modelId: string,
    knowledgeStoreId?: string,
    config?: PollingConfig
  ): Promise<EmbeddingTask> {
    try {
      // Create task
      const createResponse = await this.createFileEmbedding({
        file_id: fileId,
        model_id: modelId,
        knowledge_store_id: knowledgeStoreId,
      });

      console.log(`File embedding task created: ${createResponse.task_id}`);

      // Poll until completion
      const result = await this.pollTaskStatus(createResponse.task_id, config);

      return result;
    } catch (error) {
      console.error("File embedding failed:", error);
      throw error;
    }
  }

  /**
   * Complete workflow for text embedding with polling
   */
  static async embedText(
    text: string,
    modelId: string,
    knowledgeStoreId?: string,
    config?: PollingConfig
  ): Promise<EmbeddingTask> {
    try {
      // Create task
      const createResponse = await this.createTextEmbedding({
        text,
        model_id: modelId,
        knowledge_store_id: knowledgeStoreId,
      });

      console.log(`Text embedding task created: ${createResponse.task_id}`);

      // Poll until completion
      const result = await this.pollTaskStatus(createResponse.task_id, config);

      return result;
    } catch (error) {
      console.error("Text embedding failed:", error);
      throw error;
    }
  }

  /**
   * Complete workflow for search with polling
   */
  static async searchSimilar(
    queryText: string,
    provider: string,
    modelId: string,
    credentialId: string,
    fileId?: string,
    limit?: number,
    config?: PollingConfig
  ): Promise<EmbeddingTask> {
    try {
      // Create task
      const createResponse = await this.createSearchTask({
        query_text: queryText,
        provider,
        model_id: modelId,
        credential_id: credentialId,
        file_id: fileId,
        limit,
      });

      console.log(`Search task created: ${createResponse.task_id}`);

      // Poll until completion
      const result = await this.pollTaskStatus(createResponse.task_id, config);

      return result;
    } catch (error) {
      console.error("Search failed:", error);
      throw error;
    }
  }

  // ============ New API Methods ============

  /**
   * Get list of tasks with filters and pagination
   */
  static async getTasks(params?: TasksListRequest): Promise<TasksListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.status) queryParams.append("status", params.status);
    if (params?.task_type) queryParams.append("task_type", params.task_type);
    if (params?.skip !== undefined)
      queryParams.append("skip", params.skip.toString());
    if (params?.limit !== undefined)
      queryParams.append("limit", params.limit.toString());

    const url = `${ENDPOINTS.TASKS.LIST}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const result = await httpClient.get<TasksListResponse>(url);

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to get tasks list");
    }

    return result.getData();
  }

  /**
   * Scroll knowledge store data with pagination
   */
  static async scrollKnowledgeStoreData(
    knowledgeStoreId: string,
    request?: ScrollDataRequest
  ): Promise<ScrollDataResponse> {
    const result = await httpClient.post<ScrollDataResponse>(
      ENDPOINTS.KNOWLEDGE_STORE.SCROLL_DATA(knowledgeStoreId),
      {
        limit: request?.limit || 50,
        scroll_id: request?.scroll_id || null,
      }
    );

    if (!result.isSuccess) {
      throw new Error(
        result.message || "Failed to scroll knowledge store data"
      );
    }

    return result.getData();
  }

  /**
   * Get all points from knowledge store (scrolls until end)
   */
  static async getAllKnowledgeStorePoints(
    knowledgeStoreId: string,
    limit: number = 50,
    onProgress?: (total: number) => void
  ): Promise<ScrollDataResponse["points"]> {
    const allPoints: ScrollDataResponse["points"] = [];
    let scrollId: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const response = await this.scrollKnowledgeStoreData(knowledgeStoreId, {
        limit,
        scroll_id: scrollId,
      });

      allPoints.push(...response.points);
      scrollId = response.scroll_id;
      hasMore = response.has_more;

      if (onProgress) {
        onProgress(allPoints.length);
      }
    }

    return allPoints;
  }

  // ============ Task Management Methods ============

  /**
   * Delete a specific task by ID
   */
  static async deleteTask(
    taskId: string
  ): Promise<{ task_id: string; deleted: boolean }> {
    const result = await httpClient.delete<{
      task_id: string;
      deleted: boolean;
    }>(ENDPOINTS.TASKS.DELETE(taskId));

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to delete task");
    }

    return result.getData();
  }

  /**
   * Clear tasks by type
   * @param clearType - Type of clear operation: 'all', 'success', 'failed', 'completed'
   */
  static async clearTasks(
    clearType: "all" | "success" | "failed" | "completed"
  ): Promise<{ clear_type: string; deleted_count: number }> {
    const result = await httpClient.delete<{
      clear_type: string;
      deleted_count: number;
    }>(ENDPOINTS.TASKS.CLEAR(clearType));

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to clear tasks");
    }

    return result.getData();
  }
}

// Export individual functions for convenience
export const {
  createFileEmbedding,
  createTextEmbedding,
  createSearchTask,
  getTaskStatus,
  cancelTask,
  pollTaskStatus,
  embedFile,
  embedText,
  searchSimilar,
  getTasks,
  scrollKnowledgeStoreData,
  getAllKnowledgeStorePoints,
  deleteTask,
  clearTasks,
} = EmbeddingService;
