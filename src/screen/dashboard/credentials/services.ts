import { ENDPOINTS } from "@/consts/endpoint";
import { httpClient } from "@/lib/axios";
import type {
  Credential,
  CredentialFormData,
  CredentialListResponse,
  CredentialUpdateData,
  Provider,
  ProviderListResponse,
} from "./type";

// Provider Services
export class ProviderService {
  /**
   * Get all providers with proper error handling
   */
  static async getProviders(
    activeOnly: boolean = true,
    token?: string
  ): Promise<Provider[]> {
    try {
      const response = await httpClient.get<ProviderListResponse>(
        ENDPOINTS.PROVIDERS.LIST,
        { active_only: activeOnly },
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch providers:", response.message);
        return [];
      }

      const data = response.getData();

      return data.providers || [];
    } catch (error) {
      console.error("Failed to fetch providers:", error);
      return [];
    }
  }

  /**
   * Get providers by task type
   */
  static async getProvidersByTask(
    taskType: string,
    activeOnly: boolean = true,
    token?: string
  ): Promise<Provider[]> {
    try {
      const response = await httpClient.get<ProviderListResponse>(
        ENDPOINTS.PROVIDERS.LIST_BY_TASK(taskType),
        { active_only: activeOnly },
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch providers by task:", response.message);
        return [];
      }

      const data = response.getData();

      return data.providers || [];
    } catch (error) {
      console.error("Failed to fetch providers by task:", error);
      return [];
    }
  }

  /**
   * Get provider by name
   */
  static async getProvider(
    providerName: string,
    activeOnly: boolean = true,
    token?: string
  ): Promise<Provider | null> {
    try {
      const response = await httpClient.get<Provider>(
        ENDPOINTS.PROVIDERS.GET(providerName),
        { active_only: activeOnly },
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch provider:", response.message);
        return null;
      }

      const data = response.getData();

      return data;
    } catch (error) {
      console.error("Failed to fetch provider:", error);
      return null;
    }
  }

  /**
   * Get task configuration for a provider
   */
  static async getProviderTaskConfig(
    providerName: string,
    taskType: string,
    token?: string
  ) {
    try {
      const response = await httpClient.get(
        ENDPOINTS.PROVIDERS.GET_TASK_CONFIG(providerName, taskType),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error(
          "Failed to fetch provider task config:",
          response.message
        );
        return null;
      }

      const data = response.getData();

      return data;
    } catch (error) {
      console.error("Failed to fetch provider task config:", error);
      return null;
    }
  }
}

// Credential Services
export class CredentialService {
  /**
   * Get all credentials with proper error handling
   */
  static async getCredentials(
    skip: number = 0,
    limit: number = 100,
    token?: string
  ): Promise<CredentialListResponse | null> {
    try {
      const response = await httpClient.get<CredentialListResponse>(
        ENDPOINTS.CREDENTIALS.LIST,
        { skip, limit },
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch credentials:", response.message);
        return null;
      }

      const data = response.getData();

      return data;
    } catch (error) {
      console.error("Failed to fetch credentials:", error);
      return null;
    }
  }

  /**
   * Get credential by ID
   */
  static async getCredential(
    id: string,
    token?: string
  ): Promise<Credential | null> {
    try {
      const response = await httpClient.get<Credential>(
        ENDPOINTS.CREDENTIALS.GET(id),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch credential:", response.message);
        return null;
      }

      const data = response.getData();

      return data;
    } catch (error) {
      console.error("Failed to fetch credential:", error);
      return null;
    }
  }

  /**
   * Create new credential
   */
  static async createCredential(
    data: CredentialFormData,
    token?: string
  ): Promise<{ success: boolean; data?: Credential; error?: string }> {
    try {
      // Prepare JSON body, only including defined fields
      const body: Record<string, any> = {
        name: data.name,
        provider_id: data.provider_id,
        api_key: data.api_key,
      };
      if (data.base_url && data.base_url.trim() !== "") {
        body.base_url = data.base_url;
      }

      const response = await httpClient.post<Credential>(
        ENDPOINTS.CREDENTIALS.CREATE,
        body,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to create credential:", response.message);
        return {
          success: false,
          error: response.message || "Failed to create credential",
        };
      }

      const createdCredential = response.getData();
      return {
        success: true,
        data: createdCredential,
      };
    } catch (error) {
      console.error("Credential creation error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Update credential
   */
  static async updateCredential(
    id: string,
    data: CredentialUpdateData,
    token?: string
  ): Promise<{ success: boolean; data?: Credential; error?: string }> {
    try {
      // Prepare JSON body, only including defined fields
      const body: Record<string, any> = {};
      if (data.name !== undefined) body.name = data.name;
      if (data.provider_id !== undefined) body.provider_id = data.provider_id;
      if (data.api_key !== undefined) body.api_key = data.api_key;
      if (data.base_url !== undefined && data.base_url.trim() !== "") {
        body.base_url = data.base_url;
      }
      if (data.is_active !== undefined) {
        body.is_active = data.is_active;
      }

      const response = await httpClient.put<Credential>(
        ENDPOINTS.CREDENTIALS.UPDATE(id),
        body,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to update credential:", response.message);
        return {
          success: false,
          error: response.message || "Failed to update credential",
        };
      }

      const updatedCredential = response.getData();
      return {
        success: true,
        data: updatedCredential,
      };
    } catch (error) {
      console.error("Credential update error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Delete credential
   */
  static async deleteCredential(
    id: string,
    token?: string
  ): Promise<{ success: boolean; data?: Credential; error?: string }> {
    try {
      const response = await httpClient.delete<Credential>(
        ENDPOINTS.CREDENTIALS.DELETE(id),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to delete credential:", response.message);
        return {
          success: false,
          error: response.message || "Failed to delete credential",
        };
      }

      const deletedCredential = response.getData();
      return {
        success: true,
        data: deletedCredential,
      };
    } catch (error) {
      console.error("Credential deletion error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Get credentials by provider
   */
  static async getCredentialsByProvider(
    providerName: string,
    token?: string
  ): Promise<CredentialListResponse | null> {
    try {
      const response = await httpClient.get<CredentialListResponse>(
        ENDPOINTS.CREDENTIALS.LIST_BY_PROVIDER(providerName),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error(
          "Failed to fetch credentials by provider:",
          response.message
        );
        return null;
      }

      const data = response.getData();

      return data;
    } catch (error) {
      console.error("Failed to fetch credentials by provider:", error);
      return null;
    }
  }
}
