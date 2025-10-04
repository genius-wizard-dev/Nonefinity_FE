import { ENDPOINTS } from "@/consts/endpoint";
import { httpClient } from "@/lib/axios";
import type {
  BackendConvertDatasetResponse,
  BackendDataset,
  BackendDatasetData,
  BackendDatasetListResponse,
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
    _token?: string
  ): Promise<QueryResult | null> {
    try {
      console.log("🔍 Executing SQL query:", query);

      // For now, we'll simulate query execution
      // In a real implementation, this would call a SQL execution endpoint
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock results for demonstration
      const mockResults: QueryResult = {
        columns: ["id", "name", "email", "created_at", "status"],
        rows: [
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            created_at: "2024-01-15 10:30:00",
            status: "active",
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            created_at: "2024-01-16 14:22:00",
            status: "active",
          },
          {
            id: 3,
            name: "Bob Johnson",
            email: "bob@example.com",
            created_at: "2024-01-17 09:15:00",
            status: "inactive",
          },
          {
            id: 4,
            name: "Alice Williams",
            email: "alice@example.com",
            created_at: "2024-01-18 16:45:00",
            status: "active",
          },
          {
            id: 5,
            name: "Charlie Brown",
            email: "charlie@example.com",
            created_at: "2024-01-19 11:20:00",
            status: "pending",
          },
        ],
        rowCount: 5,
        executionTime: "127ms",
      };

      console.log("✅ Query executed successfully");
      return mockResults;
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
  static async getDatasetStats(_token?: string): Promise<{
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
