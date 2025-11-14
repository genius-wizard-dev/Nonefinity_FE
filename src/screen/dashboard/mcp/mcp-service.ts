import { ENDPOINTS } from "@/consts/endpoint";
import { httpClient } from "@/lib/axios";

export interface MCPConfig {
  name: string;
  description?: string;
  config: Record<string, any>;
}

export interface MCPListItem {
  id: string;
  name: string;
  description?: string;
  server_name: string;
  transport: string;
  tools_count: number;
  created_at: string;
  updated_at: string;
}

export interface MCPDetail {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  server_name: string;
  transport: string;
  config: Record<string, any>;
  tools?: Array<{
    name: string;
    description: string;
    args_schema?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface MCPTool {
  name: string;
  description: string;
  args_schema?: string;
}

export class MCPService {
  /**
   * Create a new MCP configuration
   */
  static async createMCP(
    config: MCPConfig,
    token: string
  ): Promise<MCPDetail | null> {
    try {
      const response = await httpClient.post<MCPDetail>(
        ENDPOINTS.MCP.CREATE,
        config,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to create MCP:", response.message);
        return null;
      }

      return response.getData();
    } catch (error) {
      console.error("Failed to create MCP:", error);
      return null;
    }
  }

  /**
   * Get list of all MCP configurations
   */
  static async getMCPs(token: string): Promise<MCPListItem[] | null> {
    try {
      const response = await httpClient.get<MCPListItem[]>(
        ENDPOINTS.MCP.LIST,
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch MCPs:", response.message);
        return null;
      }

      return response.getData();
    } catch (error) {
      console.error("Failed to fetch MCPs:", error);
      return null;
    }
  }

  /**
   * Get a specific MCP configuration by ID
   */
  static async getMCP(mcpId: string, token: string): Promise<MCPDetail | null> {
    try {
      const response = await httpClient.get<MCPDetail>(
        ENDPOINTS.MCP.GET(mcpId),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch MCP:", response.message);
        return null;
      }

      return response.getData();
    } catch (error) {
      console.error("Failed to fetch MCP:", error);
      return null;
    }
  }

  /**
   * Get tools from an MCP configuration
   */
  static async getMCPTools(
    mcpId: string,
    token: string
  ): Promise<MCPTool[] | null> {
    try {
      const response = await httpClient.get<MCPTool[]>(
        ENDPOINTS.MCP.GET_TOOLS(mcpId),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch MCP tools:", response.message);
        return null;
      }

      return response.getData();
    } catch (error) {
      console.error("Failed to fetch MCP tools:", error);
      return null;
    }
  }

  /**
   * Sync tools from MCP server
   */
  static async syncMCPTools(
    mcpId: string,
    token: string
  ): Promise<MCPDetail | null> {
    try {
      const response = await httpClient.post<MCPDetail>(
        ENDPOINTS.MCP.SYNC(mcpId),
        {},
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to sync MCP tools:", response.message);
        return null;
      }

      return response.getData();
    } catch (error) {
      console.error("Failed to sync MCP tools:", error);
      return null;
    }
  }

  /**
   * Delete an MCP configuration
   */
  static async deleteMCP(mcpId: string, token: string): Promise<boolean> {
    try {
      const response = await httpClient.delete<{ success: boolean }>(
        ENDPOINTS.MCP.DELETE(mcpId),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to delete MCP:", response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to delete MCP:", error);
      return false;
    }
  }
}

