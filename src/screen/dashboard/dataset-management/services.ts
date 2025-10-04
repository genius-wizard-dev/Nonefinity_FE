import { ENDPOINTS } from "@/consts/endpoint";
import { httpClient } from "@/lib/axios";
import type {
  BackendConvertDatasetResponse,
  BackendDataset,
  BackendDatasetData,
  BackendDatasetListResponse,
  BackendQueryResponse,
  ConvertDatasetRequest,
  Dataset,
  DatasetData,
  QueryResult,
} from "./types";
import { mapDataset } from "./types";

export class DatasetService {
  /**
   * Get list of datasets with proper error handling
   */
  static async getDatasets(
    page = 1,
    limit = 10,
    token?: string
  ): Promise<Dataset[]> {
    try {
      console.log("📊 Fetching datasets:", { page, limit });

      const response = await httpClient.get<BackendDatasetListResponse>(
        ENDPOINTS.DATASETS.LIST,
        { page, limit },
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch datasets:", response.message);
        return [];
      }

      const data = response.getData();
      console.log("📥 Datasets response:", data);

      // Handle different response structures
      let datasetsArray: BackendDataset[] = [];
      if (Array.isArray(data)) {
        // Direct array response (current API format)
        datasetsArray = data as BackendDataset[];
      } else if (data && Array.isArray(data.datasets)) {
        // Nested datasets property
        datasetsArray = data.datasets;
      }

      // Map backend datasets to frontend format
      const datasets = datasetsArray.map(mapDataset);
      console.log("✅ Mapped datasets:", datasets.length);

      return datasets;
    } catch (error) {
      console.error("❌ Failed to fetch datasets:", error);
      return [];
    }
  }

  /**
   * Get a specific dataset by ID
   */
  static async getDataset(
    datasetId: string,
    token?: string
  ): Promise<Dataset | null> {
    try {
      console.log("📊 Fetching dataset:", datasetId);

      const response = await httpClient.get<BackendDataset>(
        ENDPOINTS.DATASETS.GET(datasetId),
        undefined,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch dataset:", response.message);
        return null;
      }

      const data = response.getData();
      console.log("📥 Dataset response:", data);

      return mapDataset(data);
    } catch (error) {
      console.error("❌ Failed to fetch dataset:", error);
      return null;
    }
  }

  /**
   * Delete a dataset by ID
   */
  static async deleteDataset(
    datasetId: string,
    token?: string
  ): Promise<boolean> {
    try {
      console.log("🗑️ Deleting dataset:", datasetId);

      const response = await httpClient.delete<boolean>(
        ENDPOINTS.DATASETS.DELETE(datasetId),
        undefined,
        token
      );

      console.log("📊 Delete response:", response.statusCode);
      console.log("📊 Delete success:", response.isSuccess);

      if (!response.isSuccess) {
        console.error("❌ Failed to delete dataset:", response.message);
        return false;
      }

      console.log("✅ Dataset deleted successfully:", datasetId);
      return true;
    } catch (error) {
      console.error("❌ Failed to delete dataset:", error);
      return false;
    }
  }

  /**
   * Get dataset data with pagination
   */
  static async getDatasetData(
    datasetId: string,
    skip = 0,
    limit = 100,
    token?: string
  ): Promise<DatasetData | null> {
    try {
      console.log("📊 Fetching dataset data:", { datasetId, skip, limit });

      const response = await httpClient.get<BackendDatasetData>(
        ENDPOINTS.DATASETS.DATA(datasetId),
        { skip, limit },
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch dataset data:", response.message);
        return null;
      }

      const data = response.getData();
      console.log("📥 Dataset data response:", data);

      return {
        data: data.data || [],
        total_rows: data.total_rows || 0,
        offset: data.offset || 0,
        limit: data.limit || limit,
      };
    } catch (error) {
      console.error("❌ Failed to fetch dataset data:", error);
      return null;
    }
  }

  /**
   * Create a new dataset
   */
  static async createDataset(
    datasetName: string,
    description: string,
    schema: Array<{
      column_name: string;
      column_type: string;
      desc?: string;
    }>,
    token?: string
  ): Promise<{ success: boolean; data?: Dataset; error?: string }> {
    try {
      console.log("🆕 Creating dataset:", { datasetName, description, schema });

      // Convert to URLSearchParams for form data
      const formData = new URLSearchParams();
      formData.append("dataset_name", datasetName);
      if (description) {
        formData.append("description", description);
      }
      formData.append("schema", JSON.stringify(schema));

      const response = await httpClient.post<BackendDataset>(
        ENDPOINTS.DATASETS.CREATE,
        formData,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to create dataset:", response.message);
        console.error("❌ Response details:", {
          isSuccess: response.isSuccess,
          message: response.message,
          error: response.error,
          statusCode: response.statusCode,
        });
        return {
          success: false,
          error: response.message || "Failed to create dataset",
        };
      }

      const data = response.getData();
      console.log("📥 Create dataset response:", data);

      return { success: true, data: mapDataset(data) };
    } catch (error) {
      console.error("❌ Dataset creation error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Convert file to dataset
   */
  static async convertDataset(
    request: ConvertDatasetRequest,
    token?: string
  ): Promise<Dataset | null> {
    try {
      console.log("🔄 Converting dataset:", request);

      // Convert to URLSearchParams for form data
      const formData = new URLSearchParams();
      formData.append("file_id", request.file_id);
      formData.append("dataset_name", request.dataset_name);
      if (request.description) {
        formData.append("description", request.description);
      }

      const response = await httpClient.post<BackendConvertDatasetResponse>(
        ENDPOINTS.DATASETS.CONVERT,
        formData,
        token
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to convert dataset:", response.message);
        return null;
      }

      const data = response.getData();
      console.log("📥 Convert response:", data);

      return mapDataset(data);
    } catch (error) {
      console.error("❌ Dataset conversion error:", error);
      return null;
    }
  }

  /**
   * Execute SQL query on dataset
   */
  static async executeQuery(
    query: string,
    limit: number = 100,
    token?: string
  ): Promise<QueryResult | null> {
    try {
      console.log("🔍 Executing SQL query:", { query, limit });

      const startTime = Date.now();

      // Convert to URLSearchParams for form data
      const formData = new URLSearchParams();
      formData.append("query", query);
      formData.append("limit", limit.toString());

      const response = await httpClient.post<BackendQueryResponse>(
        ENDPOINTS.DATASETS.QUERY,
        formData,
        token
      );

      const endTime = Date.now();
      const executionTime = `${endTime - startTime}ms`;

      if (!response.isSuccess) {
        console.error("❌ Failed to execute query:", response.message);
        return {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime,
          error: response.message || "Query execution failed",
        };
      }

      const responseData = response.getData();
      console.log("📥 Query response:", responseData);
      console.log("📥 Response data type:", typeof responseData);
      console.log("📥 Is array:", Array.isArray(responseData));

      // The responseData should be the data array directly
      // But let's handle both cases: direct array or nested data property
      let data: Record<string, unknown>[];

      if (Array.isArray(responseData)) {
        // Direct array response
        data = responseData;
        console.log("📥 Direct array response, data length:", data.length);
      } else if (
        responseData &&
        typeof responseData === "object" &&
        "data" in responseData
      ) {
        // Nested data property
        data = (responseData as any).data || [];
        console.log("📥 Nested data response, data length:", data.length);
      } else {
        // Fallback
        data = [];
        console.log("📥 Fallback: empty data");
      }

      // Extract columns from the first row if data exists
      const columns = data.length > 0 ? Object.keys(data[0]) : [];
      const rowCount = data.length;

      console.log("📥 Columns:", columns);
      console.log("📥 Row count:", rowCount);
      console.log("📥 First row sample:", data[0]);

      const result: QueryResult = {
        columns,
        rows: data,
        rowCount,
        executionTime,
      };

      console.log("✅ Query executed successfully:", result);
      return result;
    } catch (error) {
      console.error("❌ Query execution error:", error);
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: "0ms",
        error: "Query execution failed",
      };
    }
  }

  /**
   * Get dataset statistics
   */
  static async getDatasetStats(): Promise<{
    totalDatasets: number;
    totalRows: number;
    averageRows: number;
  } | null> {
    try {
      console.log("📊 Fetching dataset stats");

      // For now, return mock stats
      // In a real implementation, this would call a stats endpoint
      return {
        totalDatasets: 0,
        totalRows: 0,
        averageRows: 0,
      };
    } catch (error) {
      console.error("❌ Failed to fetch dataset stats:", error);
      return null;
    }
  }
}
