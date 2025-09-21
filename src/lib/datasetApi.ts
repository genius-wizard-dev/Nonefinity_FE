import { api } from "./axios";

// API Response wrapper for the new response format
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface DatasetSchema {
    column_name: string;
    column_type: string;
    desc: string | null;
}

export interface Dataset {
    id: string;
    name: string;
    description: string;
    created_at: string;
    owner_id: string;
    data_schema: DatasetSchema[];
}

export interface DatasetListResponse {
    datasets: Dataset[];
    total: number;
    page: number;
    limit: number;
}

export interface DatasetData {
    data: Record<string, any>[];
    total_rows: number;
    offset: number;
    limit: number;
}

export interface ConvertDatasetRequest {
    file_id: string;
    dataset_name: string;
    description?: string;
}

export interface ConvertDatasetResponse {
    id: string;
    name: string;
    description: string;
    owner_id: string;
    created_at: string;
    data_schema: DatasetSchema[];
}

export class DatasetService {
    /**
     * Get list of datasets
     */
    static async getDatasets(
        page = 1,
        limit = 10
    ): Promise<DatasetListResponse> {
        const response = await api.get("/api/v1/datasets/list", {
            params: { page, limit },
        });

        // Handle the new API response format where data is nested
        const apiResponse = response.data;

        // If the response has a 'data' property (new format), use it
        if (
            apiResponse &&
            typeof apiResponse === "object" &&
            "data" in apiResponse
        ) {
            const datasets = Array.isArray(apiResponse.data)
                ? apiResponse.data
                : [];
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
            return apiResponse;
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
    static async getDataset(datasetId: string): Promise<Dataset> {
        const response = await api.get(`/api/v1/datasets/${datasetId}`);

        // Handle the new API response format where data is nested
        const apiResponse = response.data;

        // If the response has a 'data' property (new format), use it
        if (apiResponse.data !== undefined) {
            return apiResponse.data;
        }

        // Fallback to old format
        return response.data;
    }

    /**
     * Delete dataset by ID
     */
    static async deleteDataset(datasetId: string): Promise<void> {
        await api.delete(`/api/v1/datasets/${datasetId}`);
    }

    /**
     * Get dataset data with pagination
     */
    static async getDatasetData(
        datasetId: string,
        skip = 0,
        limit = 100
    ): Promise<DatasetData> {
        const response = await api.get(`/api/v1/datasets/${datasetId}/data`, {
            params: { skip, limit },
        });

        // Handle the new API response format where data is nested
        const apiResponse = response.data;

        // If the response has a 'data' property (new format), use it
        if (apiResponse.data !== undefined) {
            return apiResponse.data;
        }

        // Fallback to old format
        return response.data;
    }

    /**
     * Convert dataset format
     */
    static async convertDataset(
        request: ConvertDatasetRequest
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

            const response = await api.post(
                "/api/v1/datasets/convert",
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            console.log("Convert dataset response:", response.data);

            // Handle the new API response format where data is nested
            const apiResponse = response.data;

            // If the response has a 'data' property (new format), use it
            if (apiResponse.data !== undefined) {
                return apiResponse.data;
            }

            // Fallback to old format
            return response.data;
        } catch (error: any) {
            console.error("Dataset conversion error:", error);
            console.error("Error response:", error.response?.data);
            console.error("Request payload:", request);

            // Re-throw the error so the component can handle it
            throw error;
        }
    }
}
