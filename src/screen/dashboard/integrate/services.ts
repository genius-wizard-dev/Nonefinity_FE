import { ENDPOINTS } from "@/consts/endpoint";
import { httpClient } from "@/lib/axios";
import type {
  ConnectAccountRequest,
  ConnectAccountResponse,
  IntegrationListResponse,
  Tool,
} from "./types";

export class IntegrationService {
  /**
   * Get list of all integrations from Composio with login status
   */
  static async getIntegrations(
    token: string
  ): Promise<IntegrationListResponse | null> {
    try {
      const response = await httpClient.get<IntegrationListResponse>(
        ENDPOINTS.INTEGRATIONS.LIST,
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch integrations:", response.message);
        return null;
      }

      return response.getData();
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
      return null;
    }
  }

  /**
   * Connect user account to a Composio integration
   * Returns redirect_url for OAuth flow
   */
  static async connectAccount(
    authConfigId: string,
    token: string
  ): Promise<string | null> {
    try {
      const request: ConnectAccountRequest = {
        auth_config_id: authConfigId,
      };

      const response = await httpClient.post<ConnectAccountResponse>(
        ENDPOINTS.INTEGRATIONS.CONNECT,
        request,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to connect account:", response.message);
        return null;
      }

      const data = response.getData();
      return data.redirect_url || null;
    } catch (error) {
      console.error("Failed to connect account:", error);
      return null;
    }
  }

  /**
   * Get list of tools for a specific toolkit
   */
  static async getTools(
    toolkitSlug: string,
    token: string
  ): Promise<Tool[] | null> {
    try {
      const response = await httpClient.get<Tool[]>(
        ENDPOINTS.INTEGRATIONS.GET_TOOLS(toolkitSlug),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch tools:", response.message);
        return null;
      }

      return response.getData();
    } catch (error) {
      console.error("Failed to fetch tools:", error);
      return null;
    }
  }

  /**
   * Add or update tools for a specific toolkit
   * Upserts tools based on toolkit_slug
   */
  static async addTools(
    toolkitSlug: string,
    toolSlugs: string[],
    token: string
  ): Promise<boolean> {
    try {
      const request = {
        tool_slugs: toolSlugs,
      };

      const response = await httpClient.post<{ success: boolean }>(
        ENDPOINTS.INTEGRATIONS.ADD_TOOLS(toolkitSlug),
        request,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to add tools:", response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to add tools:", error);
      return false;
    }
  }
}
