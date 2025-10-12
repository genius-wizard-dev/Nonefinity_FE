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
  UpdateDatasetRequest,
  UpdateDatasetSchemaRequest,
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
    data_schema: Array<{
      column_name: string;
      column_type: string;
      desc?: string;
    }>,
    token?: string
  ): Promise<{ success: boolean; data?: Dataset; error?: string }> {
    try {
      const jsonBody = {
        dataset_name: datasetName,
        description: description || "",
        data_schema: data_schema,
      };

      const response = await httpClient.post<BackendDataset>(
        ENDPOINTS.DATASETS.CREATE,
        jsonBody,
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

      // Use JSON body instead of form data
      const jsonBody = {
        file_id: request.file_id,
        dataset_name: request.dataset_name,
        description: request.description || "",
      };

      const response = await httpClient.post<BackendConvertDatasetResponse>(
        ENDPOINTS.DATASETS.CONVERT,
        jsonBody,
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

      // Use JSON body instead of form data
      const jsonBody = {
        query: query,
        limit: limit,
      };

      const response = await httpClient.post<BackendQueryResponse>(
        ENDPOINTS.DATASETS.QUERY,
        jsonBody,
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
   * Update dataset name and description
   */
  static async updateDatasetInfo(
    datasetId: string,
    request: UpdateDatasetRequest,
    token?: string
  ): Promise<{ success: boolean; data?: Dataset; error?: string }> {
    try {
      console.log("📝 Updating dataset info:", { datasetId, request });

      // Prepare JSON body
      const jsonBody: Record<string, string> = {};
      if (request.name) {
        jsonBody.name = request.name;
      }
      if (request.description !== undefined) {
        jsonBody.description = request.description;
      }

      const response = await httpClient.put<{
        success: boolean;
        message: string;
      }>(ENDPOINTS.DATASETS.UPDATE(datasetId), jsonBody, token);

      if (!response.isSuccess) {
        console.error("❌ Failed to update dataset info:", response.message);
        return {
          success: false,
          error: response.message || "Failed to update dataset",
        };
      }

      const data = response.getData();
      console.log("📥 Update dataset response:", data);

      // Handle the new response format with success and message
      // The API returns {success: true, message: "..."} directly
      if (data && data.success) {
        console.log("✅ Dataset info updated successfully:", data.message);
        return { success: true };
      } else {
        return {
          success: false,
          error: data?.message || "Failed to update dataset info",
        };
      }
    } catch (error) {
      console.error("❌ Dataset update error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Update dataset schema descriptions
   */
  static async updateDatasetSchema(
    datasetId: string,
    request: UpdateDatasetSchemaRequest,
    token?: string
  ): Promise<{ success: boolean; data?: Dataset; error?: string }> {
    try {
      console.log("📝 Updating dataset schema:", { datasetId, request });

      // Prepare JSON body - try sending descriptions directly
      const jsonBody = request.descriptions;
      console.log("📤 Sending JSON body:", jsonBody);

      const response = await httpClient.put<{
        success: boolean;
        message: string;
      }>(ENDPOINTS.DATASETS.UPDATE_SCHEMA(datasetId), jsonBody, token);

      if (!response.isSuccess) {
        console.error("❌ Failed to update dataset schema:", response.message);
        return {
          success: false,
          error: response.message || "Failed to update dataset schema",
        };
      }

      const data = response.getData();
      console.log("📥 Update schema response:", data);
      console.log("📥 Data type:", typeof data);
      console.log("📥 Data success:", data?.success);
      console.log("📥 Data message:", data?.message);

      // Handle the new response format with success and message
      // The API returns {success: true, message: "..."} directly
      if (data && data.success) {
        console.log("✅ Schema updated successfully:", data.message);
        return { success: true };
      } else {
        console.log("❌ Schema update failed:", data);
        return {
          success: false,
          error: data?.message || "Failed to update dataset schema",
        };
      }
    } catch (error) {
      console.error("❌ Dataset schema update error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Insert data from file into dataset
   */
  static async insertDataFromFile(
    datasetId: string,
    fileId: string,
    token?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log("📥 Inserting data from file:", { datasetId, fileId });

      const response = await httpClient.post<{
        success: boolean;
        message: string;
        data?: {
          dataset_id: string;
          file_id: string;
          rows_inserted: number;
          column_mapping: Record<string, string>;
          auto_mapped: boolean;
        };
      }>(ENDPOINTS.DATASETS.INSERT(datasetId, fileId), {}, token);

      if (!response.isSuccess) {
        console.error("❌ Failed to insert data:", response.message);
        return {
          success: false,
          error: response.message || "Failed to insert data",
        };
      }

      const data = response.getData();
      console.log("📥 Insert data response:", data);

      return { success: true, data };
    } catch (error) {
      console.error("❌ Insert data error:", error);
      return { success: false, error: "An unexpected error occurred" };
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
