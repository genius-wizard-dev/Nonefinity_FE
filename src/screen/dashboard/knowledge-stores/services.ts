import { ENDPOINTS } from "../../../consts/endpoint";
import { httpClient } from "../../../lib/axios";
import type {
  KnowledgeStore,
  KnowledgeStoreCheckNameResponse,
  KnowledgeStoreCreateRequest,
  KnowledgeStoreFilters,
  KnowledgeStoreInfoResponse,
  KnowledgeStoreListResponse,
  KnowledgeStorePagination,
  KnowledgeStoreUpdateRequest,
  ScrollDataRequest,
  ScrollDataResponse,
} from "./types";

// Knowledge Store Service
export class KnowledgeStoreService {
  // Check name availability
  static async checkName(
    name: string
  ): Promise<KnowledgeStoreCheckNameResponse> {
    const result = await httpClient.get<KnowledgeStoreCheckNameResponse>(
      ENDPOINTS.KNOWLEDGE_STORE.CHECK_NAME(name)
    );

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to check name availability");
    }

    return result.getData();
  }

  // Create knowledge store
  static async create(
    data: KnowledgeStoreCreateRequest
  ): Promise<KnowledgeStore> {
    const result = await httpClient.post<KnowledgeStore>(
      ENDPOINTS.KNOWLEDGE_STORE.CREATE,
      data
    );

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to create knowledge store");
    }

    return result.getData();
  }

  // List knowledge stores
  static async list(
    pagination: KnowledgeStorePagination = { skip: 0, limit: 50 },
    filters: KnowledgeStoreFilters = {}
  ): Promise<KnowledgeStoreListResponse> {
    const params: Record<string, unknown> = {
      skip: pagination.skip,
      limit: pagination.limit,
    };

    if (filters.status) {
      params.status = filters.status;
    }

    const result = await httpClient.get<KnowledgeStoreListResponse>(
      ENDPOINTS.KNOWLEDGE_STORE.LIST,
      params
    );

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to fetch knowledge stores");
    }

    return result.getData();
  }

  // Get knowledge store by ID
  static async getById(id: string): Promise<KnowledgeStore> {
    const result = await httpClient.get<KnowledgeStore>(
      ENDPOINTS.KNOWLEDGE_STORE.GET(id)
    );

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to fetch knowledge store");
    }

    return result.getData();
  }

  // Update knowledge store
  static async update(
    id: string,
    data: KnowledgeStoreUpdateRequest
  ): Promise<KnowledgeStore> {
    const result = await httpClient.put<KnowledgeStore>(
      ENDPOINTS.KNOWLEDGE_STORE.UPDATE(id),
      data
    );

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to update knowledge store");
    }

    return result.getData();
  }

  // Delete knowledge store
  static async delete(id: string): Promise<void> {
    const result = await httpClient.delete(
      ENDPOINTS.KNOWLEDGE_STORE.DELETE(id)
    );

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to delete knowledge store");
    }
  }

  // Get collection info
  static async getInfo(id: string): Promise<KnowledgeStoreInfoResponse> {
    const result = await httpClient.get<KnowledgeStoreInfoResponse>(
      ENDPOINTS.KNOWLEDGE_STORE.INFO(id)
    );

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to fetch collection info");
    }

    return result.getData();
  }

  // Scroll data from knowledge store
  static async scrollData(
    id: string,
    data: ScrollDataRequest
  ): Promise<ScrollDataResponse> {
    const result = await httpClient.post<ScrollDataResponse>(
      ENDPOINTS.KNOWLEDGE_STORE.SCROLL_DATA(id),
      data
    );

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to fetch scroll data");
    }

    return result.getData();
  }

  // Get knowledge by dimension
  static async getKnowledgeByDimension(
    dimension: number
  ): Promise<KnowledgeStore[]> {
    const result = await httpClient.get<KnowledgeStore[]>(
      ENDPOINTS.KNOWLEDGE_STORE.GET_KNOWLEDGE_BY_DIMENSION(dimension)
    );

    if (!result.isSuccess) {
      throw new Error(
        result.message || "Failed to fetch knowledge by dimension"
      );
    }

    return result.getData();
  }

  // Delete vectors from knowledge store
  static async deleteVectors(
    knowledgeStoreId: string,
    pointIds: string[]
  ): Promise<{ deleted_count: number; point_ids: string[] }> {
    const result = await httpClient.post<{
      deleted_count: number;
      point_ids: string[];
    }>(ENDPOINTS.KNOWLEDGE_STORE.DELETE_VECTORS(knowledgeStoreId), {
      point_ids: pointIds,
    });

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to delete vectors");
    }

    return result.getData();
  }
}

// Export individual functions for convenience
export const {
  checkName,
  create,
  list,
  getById,
  update,
  delete: deleteKnowledgeStore,
  getInfo,
  scrollData,
  getKnowledgeByDimension,
  deleteVectors,
} = KnowledgeStoreService;
