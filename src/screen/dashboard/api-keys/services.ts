/**
 * API Key Services
 */

import { ENDPOINTS } from "@/consts/endpoint";
import { httpClient } from "@/lib/axios";
import type {
  APIKey,
  APIKeyCreate,
  APIKeyCreateResponse,
  APIKeyUpdate,
  APIKeyListResponse,
} from "./types";

export class APIKeyService {
  /**
   * Create a new API key
   */
  static async create(
    data: APIKeyCreate,
    token?: string
  ): Promise<{ success: boolean; data?: APIKeyCreateResponse; error?: string }> {
    try {
      console.log("🔑 Creating API key:", data.name);

      const response = await httpClient.post<APIKeyCreateResponse>(
        ENDPOINTS.API_KEYS.CREATE,
        data,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to create API key:", response.message);
        return {
          success: false,
          error: response.message || "Failed to create API key",
        };
      }

      const responseData = response.getData();
      console.log("✅ API key created successfully");

      return { success: true, data: responseData };
    } catch (error) {
      console.error("❌ API key creation error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * List all API keys
   */
  static async list(
    skip: number = 0,
    limit: number = 100,
    includeInactive: boolean = false,
    token?: string | null
  ): Promise<{ success: boolean; data?: APIKeyListResponse; error?: string }> {
    try {
      console.log("📋 Fetching API keys");

      const params = {
        skip,
        limit,
        include_inactive: includeInactive,
      };

      const response = await httpClient.get<APIKeyListResponse>(
        ENDPOINTS.API_KEYS.LIST,
        params,
        token || undefined
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch API keys:", response.message);
        return {
          success: false,
          error: response.message || "Failed to fetch API keys",
        };
      }

      const responseData = response.getData();
      console.log(`✅ Found ${responseData.total} API key(s)`);

      return { success: true, data: responseData };
    } catch (error) {
      console.error("❌ API keys fetch error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Get a specific API key
   */
  static async getById(
    keyId: string,
    token?: string
  ): Promise<{ success: boolean; data?: APIKey; error?: string }> {
    try {
      console.log("🔍 Fetching API key:", keyId);

      const response = await httpClient.get<APIKey>(
        ENDPOINTS.API_KEYS.GET(keyId),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch API key:", response.message);
        return {
          success: false,
          error: response.message || "Failed to fetch API key",
        };
      }

      const responseData = response.getData();
      console.log("✅ API key retrieved");

      return { success: true, data: responseData };
    } catch (error) {
      console.error("❌ API key fetch error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Update an API key
   */
  static async update(
    keyId: string,
    data: APIKeyUpdate,
    token?: string
  ): Promise<{ success: boolean; data?: APIKey; error?: string }> {
    try {
      console.log("✏️ Updating API key:", keyId);

      const response = await httpClient.put<APIKey>(
        ENDPOINTS.API_KEYS.UPDATE(keyId),
        data,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to update API key:", response.message);
        return {
          success: false,
          error: response.message || "Failed to update API key",
        };
      }

      const responseData = response.getData();
      console.log("✅ API key updated successfully");

      return { success: true, data: responseData };
    } catch (error) {
      console.error("❌ API key update error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Revoke an API key
   */
  static async revoke(
    keyId: string,
    token?: string
  ): Promise<{ success: boolean; data?: APIKey; error?: string }> {
    try {
      console.log("🚫 Revoking API key:", keyId);

      const response = await httpClient.post<APIKey>(
        ENDPOINTS.API_KEYS.REVOKE(keyId),
        {},
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to revoke API key:", response.message);
        return {
          success: false,
          error: response.message || "Failed to revoke API key",
        };
      }

      const responseData = response.getData();
      console.log("✅ API key revoked successfully");

      return { success: true, data: responseData };
    } catch (error) {
      console.error("❌ API key revoke error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Delete an API key
   */
  static async delete(
    keyId: string,
    token?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🗑️ Deleting API key:", keyId);

      const response = await httpClient.delete(
        ENDPOINTS.API_KEYS.DELETE(keyId),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to delete API key:", response.message);
        return {
          success: false,
          error: response.message || "Failed to delete API key",
        };
      }

      console.log("✅ API key deleted successfully");

      return { success: true };
    } catch (error) {
      console.error("❌ API key delete error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }
}
