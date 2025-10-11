import { ENDPOINTS } from "@/consts/endpoint";
import { httpClient } from "@/lib/axios";
import type {
  CreateModelRequest,
  Model,
  ModelListParams,
  ModelListResponse,
  ModelStats,
  UpdateModelRequest,
} from "./type";

import type { CredentialListResponse } from "../credentials/type";
// Model API service functions
export class ModelService {
  /**
   * Create a new model
   */
  static async createModel(
    data: CreateModelRequest,
    token?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🤖 Creating model:", {
        name: data.name,
        type: data.type,
        credential_id: data.credential_id,
      });

      const response = await httpClient.post<{
        success: boolean;
        message: string;
      }>(ENDPOINTS.MODELS.CREATE, data, token);

      if (!response.isSuccess) {
        console.error("❌ Failed to create model:", response.message);
        return {
          success: false,
          error: response.message || "Failed to create model",
        };
      }

      const responseData = response.getData();
      console.log("📥 Create model response:", responseData);

      return { success: true };
    } catch (error) {
      console.error("❌ Model creation error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  static async listModels(
    params: ModelListParams = {},
    token?: string
  ): Promise<ModelListResponse | null> {
    try {
      const queryParams: Record<string, any> = {};
      if (params.skip !== undefined) queryParams.skip = params.skip;
      if (params.limit !== undefined) queryParams.limit = params.limit;
      if (params.type) queryParams.type = params.type;
      if (params.credential_id)
        queryParams.credential_id = params.credential_id;
      if (params.active_only !== undefined)
        queryParams.active_only = params.active_only;

      const response = await httpClient.get<ModelListResponse>(
        ENDPOINTS.MODELS.LIST,
        queryParams,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch models:", response.message);
        return null;
      }

      const data = response.getData();
      console.log("📥 Models response:", data);

      return data;
    } catch (error) {
      console.error("❌ Failed to fetch models:", error);
      return null;
    }
  }

  /**
   * Get model statistics
   */
  static async getModelStats(token?: string): Promise<ModelStats | null> {
    try {
      console.log("📊 Fetching model stats");

      const response = await httpClient.get<ModelStats>(
        ENDPOINTS.MODELS.STATS,
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch model stats:", response.message);
        return null;
      }

      const data = response.getData();
      console.log("📥 Model stats response:", data);

      return data;
    } catch (error) {
      console.error("❌ Failed to fetch model stats:", error);
      return null;
    }
  }

  /**
   * Get default model by type
   */
  static async getDefaultModel(
    modelType: "chat" | "embedding",
    token?: string
  ): Promise<Model | null> {
    try {
      console.log("🤖 Fetching default model:", { modelType });

      const response = await httpClient.get<Model>(
        ENDPOINTS.MODELS.GET_DEFAULT(modelType),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch default model:", response.message);
        return null;
      }

      const data = response.getData();
      console.log("📥 Default model response:", data);

      return data;
    } catch (error) {
      console.error("❌ Failed to fetch default model:", error);
      return null;
    }
  }

  /**
   * Get model by ID
   */
  static async getModel(
    modelId: string,
    token?: string
  ): Promise<Model | null> {
    try {
      console.log("🤖 Fetching model:", { modelId });

      const response = await httpClient.get<Model>(
        ENDPOINTS.MODELS.GET(modelId),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch model:", response.message);
        return null;
      }

      const data = response.getData();
      console.log("📥 Model response:", data);

      return data;
    } catch (error) {
      console.error("❌ Failed to fetch model:", error);
      return null;
    }
  }

  /**
   * Update model by ID
   */
  static async updateModel(
    modelId: string,
    data: UpdateModelRequest,
    token?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🤖 Updating model:", { modelId, data });

      const body: Record<string, any> = {};
      if (data.name !== undefined) body.name = data.name;
      if (data.description !== undefined) body.description = data.description;
      if (data.is_active !== undefined) body.is_active = data.is_active;

      const response = await httpClient.put<{
        success: boolean;
        message: string;
      }>(ENDPOINTS.MODELS.UPDATE(modelId), body, token);

      if (!response.isSuccess) {
        console.error("❌ Failed to update model:", response.message);
        return {
          success: false,
          error: response.message || "Failed to update model",
        };
      }

      const responseData = response.getData();
      console.log("📥 Update model response:", responseData);

      return { success: true };
    } catch (error) {
      console.error("❌ Model update error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Delete model by ID
   */
  static async deleteModel(
    modelId: string,
    token?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🤖 Deleting model:", { modelId });

      const response = await httpClient.delete<{
        success: boolean;
        message: string;
      }>(ENDPOINTS.MODELS.DELETE(modelId), undefined, token);

      if (!response.isSuccess) {
        console.error("❌ Failed to delete model:", response.message);
        return {
          success: false,
          error: response.message || "Failed to delete model",
        };
      }

      const data = response.getData();
      console.log("📥 Delete model response:", data);

      return { success: true };
    } catch (error) {
      console.error("❌ Model deletion error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Set model as default
   */
  static async setDefaultModel(
    modelId: string,
    token?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🤖 Setting default model:", { modelId });

      const response = await httpClient.post<{
        success: boolean;
        message: string;
      }>(ENDPOINTS.MODELS.SET_DEFAULT(modelId), {}, token);

      if (!response.isSuccess) {
        console.error("❌ Failed to set default model:", response.message);
        return {
          success: false,
          error: response.message || "Failed to set default model",
        };
      }

      const responseData = response.getData();
      console.log("📥 Set default model response:", responseData);

      return { success: true };
    } catch (error) {
      console.error("❌ Set default model error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Get models by credential
   */
  static async getModelsByCredential(
    credentialId: string,
    token?: string
  ): Promise<ModelListResponse | null> {
    try {
      console.log("🤖 Fetching models by credential:", { credentialId });

      const response = await httpClient.get<ModelListResponse>(
        ENDPOINTS.MODELS.BY_CREDENTIAL(credentialId),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error(
          "❌ Failed to fetch models by credential:",
          response.message
        );
        return null;
      }

      const data = response.getData();
      console.log("📥 Models by credential response:", data);

      return data;
    } catch (error) {
      console.error("❌ Failed to fetch models by credential:", error);
      return null;
    }
  }

  /**
   * Get models by task type
   */
  static async getCredentialByTaskType(
    taskType: "chat" | "embedding",
    token?: string
  ): Promise<CredentialListResponse | null> {
    try {
      console.log("🤖 Fetching models by task type:", { taskType });

      const response = await httpClient.get<CredentialListResponse>(
        ENDPOINTS.CREDENTIALS.LIST,
        { task_type: taskType },
        token
      );

      if (!response.isSuccess) {
        console.error(
          "❌ Failed to fetch models by task type:",
          response.message
        );
        return null;
      }

      const data = response.getData();
      console.log("📥 Models by task type response:", data);

      return data;
    } catch (error) {
      console.error("❌ Failed to fetch models by task type:", error);
      return null;
    }
  }
}
