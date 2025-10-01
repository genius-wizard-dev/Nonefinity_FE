import { ENDPOINTS } from "@/consts/endpoint";
import { httpClient } from "@/lib/axios";
import type {
  ConvertDatasetRequest,
  ConvertDatasetResponse,
  Dataset,
  DatasetData,
  DatasetListResponse,
} from "./types";

export class DatasetService {
  /**
   * Get list of datasets
   */
  static async getDatasets(
    page = 1,
    limit = 10,
    token?: string
  ): Promise<DatasetListResponse> {
    const response = await httpClient.get(
      ENDPOINTS.DATASETS.LIST,
      { page, limit },
      token
    );

    // Handle the new API response format where data is nested
    const apiResponse = response.getData() as any;

    // If the response has a 'data' property (new format), use it
    if (
      apiResponse &&
      typeof apiResponse === "object" &&
      "data" in apiResponse
    ) {
      const datasets = Array.isArray(apiResponse.data) ? apiResponse.data : [];
      return {
        datasets,
        total: datasets.length,
        page: page,
        limit: limit,
      };
    }

    // Fallback to old format - check if response.data is already in the expected format
    if (
      apiResponse &&
      typeof apiResponse === "object" &&
      "datasets" in apiResponse
    ) {
      return apiResponse as DatasetListResponse;
    }

    // If response.data is an array, treat it as the datasets array directly
    if (Array.isArray(apiResponse)) {
      return {
        datasets: apiResponse,
        total: apiResponse.length,
        page: page,
        limit: limit,
      };
    }

    // Default fallback - empty datasets
    return {
      datasets: [],
      total: 0,
      page: page,
      limit: limit,
    };
  }

  /**
   * Get dataset by ID
   */
  static async getDataset(datasetId: string, token?: string): Promise<Dataset> {
    const response = await httpClient.get(
      ENDPOINTS.DATASETS.GET(datasetId),
      undefined,
      token
    );

    // Handle the new API response format where data is nested
    const apiResponse = response.getData() as any;

    // If the response has a 'data' property (new format), use it
    if (
      apiResponse &&
      typeof apiResponse === "object" &&
      "data" in apiResponse
    ) {
      return apiResponse.data;
    }

    // Fallback to old format
    return apiResponse;
  }

  /**
   * Delete dataset by ID
   */
  static async deleteDataset(datasetId: string, token?: string): Promise<void> {
    await httpClient.delete(
      ENDPOINTS.DATASETS.DELETE(datasetId),
      undefined,
      token
    );
  }

  /**
   * Get dataset data with pagination
   */
  static async getDatasetData(
    datasetId: string,
    skip = 0,
    limit = 100,
    token?: string
  ): Promise<DatasetData> {
    const response = await httpClient.get(
      ENDPOINTS.DATASETS.DATA(datasetId),
      { skip, limit },
      token
    );

    // Handle the new API response format where data is nested
    const apiResponse = response.getData() as any;

    // If the response has a 'data' property (new format), use it
    if (
      apiResponse &&
      typeof apiResponse === "object" &&
      "data" in apiResponse
    ) {
      return apiResponse.data;
    }

    // Fallback to old format
    return apiResponse;
  }

  /**
   * Convert dataset format
   */
  static async convertDataset(
    request: ConvertDatasetRequest,
    token?: string
  ): Promise<ConvertDatasetResponse> {
    try {
      console.log("Converting dataset with request:", request);

      // Convert to URLSearchParams for form data
      const formData = new URLSearchParams();
      formData.append("file_id", request.file_id);
      formData.append("dataset_name", request.dataset_name);
      if (request.description) {
        formData.append("description", request.description);
      }

      const response = await httpClient.post(
        ENDPOINTS.DATASETS.CONVERT,
        formData,
        token
      );
      console.log("Convert dataset response:", response.getData());

      // Handle the new API response format where data is nested
      const apiResponse = response.getData() as any;

      // If the response has a 'data' property (new format), use it
      if (
        apiResponse &&
        typeof apiResponse === "object" &&
        "data" in apiResponse
      ) {
        return apiResponse.data;
      }

      // Fallback to old format
      return apiResponse;
    } catch (error: unknown) {
      console.error("Dataset conversion error:", error);
      console.error(
        "Error response:",
        (error as { response?: { data?: unknown } }).response?.data
      );
      console.error("Request payload:", request);

      // Re-throw the error so the component can handle it
      throw error;
    }
  }
}
