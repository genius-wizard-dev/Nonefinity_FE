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
  data: Record<string, unknown>[];
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
