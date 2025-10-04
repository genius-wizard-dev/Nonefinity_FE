// Base API response type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Dataset schema for column definitions
export interface DatasetSchema {
  column_name: string;
  column_type: string;
  desc: string | null;
}

// Main Dataset interface - represents a dataset in the app
export interface Dataset {
  id: string;
  name: string;
  description: string;
  created_at: string;
  owner_id: string;
  data_schema: DatasetSchema[];
  rowCount?: number; // For UI compatibility
}

// Backend API response types matching the server structure
export interface BackendDataset {
  id: string;
  name: string;
  description: string;
  created_at: string;
  owner_id: string;
  data_schema: DatasetSchema[];
  row_count: number;
}

// Dataset list response
export interface DatasetListResponse {
  datasets: Dataset[];
  total: number;
  page: number;
  limit: number;
}

// Backend dataset list response
export interface BackendDatasetListResponse {
  datasets: BackendDataset[];
  total: number;
  page: number;
  limit: number;
}

// Dataset data with pagination
export interface DatasetData {
  data: Record<string, unknown>[];
  total_rows: number;
  offset: number;
  limit: number;
}

// Backend dataset data response
export interface BackendDatasetData {
  data: Record<string, unknown>[];
  total_rows: number;
  offset: number;
  limit: number;
}

// Convert dataset request
export interface ConvertDatasetRequest {
  file_id: string;
  dataset_name: string;
  description?: string;
}

// Convert dataset response
export interface ConvertDatasetResponse {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  data_schema: DatasetSchema[];
}

// Backend convert dataset response
export interface BackendConvertDatasetResponse {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  data_schema: DatasetSchema[];
}

// SQL Query types
export interface SqlQuery {
  query: string;
  limit?: number;
  offset?: number;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTime: string;
  error?: string;
}

// Table management types
export interface Table {
  name: string;
  rowCount: number;
  description: string;
  columns: Column[];
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  description: string;
}

// Store state types
export interface DatasetStoreState {
  datasets: Dataset[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  selectedDataset: Dataset | null;
  queryResults: QueryResult | null;
  isExecutingQuery: boolean;
  tables: Table[];
  selectedTable: string | null;
  activeTab: string;
}

// Store action types
export interface DatasetStoreActions {
  fetchDatasets: (token: string, force?: boolean) => Promise<void>;
  getDataset: (datasetId: string, token: string) => Promise<Dataset | null>;
  deleteDataset: (datasetId: string, token: string) => Promise<boolean>;
  convertDataset: (
    request: ConvertDatasetRequest,
    token: string
  ) => Promise<Dataset | null>;
  executeQuery: (query: string, token: string) => Promise<QueryResult | null>;
  setSelectedDataset: (dataset: Dataset | null) => void;
  setSelectedTable: (tableName: string | null) => void;
  setActiveTab: (tab: string) => void;
  addDataset: (dataset: Dataset) => void;
  updateDataset: (datasetId: string, updates: Partial<Dataset>) => void;
  removeDataset: (datasetId: string) => void;
  clearError: () => void;
  refreshData: (token: string) => Promise<void>;
  reset: () => void;
  // Table management methods
  handleRenameTable: (oldName: string, newName: string) => void;
  handleDeleteTable: (tableName: string) => void;
  handleUpdateTableDescription: (
    tableName: string,
    description: string
  ) => void;
  handleUpdateColumnDescription: (
    tableName: string,
    columnName: string,
    description: string
  ) => void;
  handleShowTableInfo: (tableName: string) => void;
  handleImportFile: (fileName: string) => void;
  handleCreateTable: (tableName: string, columns: Column[]) => void;
}

// Component prop types
export interface DatasetManagerProps {
  onDatasetSelect?: (dataset: Dataset) => void;
  onTableSelect?: (table: Table) => void;
}

export interface DatasetListProps {
  onDatasetSelect?: (dataset: Dataset) => void;
  onDatasetDelete?: (datasetId: string) => void;
  onDatasetConvert?: (fileId: string) => void;
  selectable?: boolean;
  showActions?: boolean;
}

export interface SqlEditorProps {
  onExecute: (query: string) => Promise<void>;
  isExecuting: boolean;
  selectedTable?: string | null;
}

export interface QueryResultsProps {
  results: QueryResult | null;
  isLoading?: boolean;
}

export interface TableDetailsProps {
  table: Table;
  onUpdateTableDescription: (tableName: string, description: string) => void;
  onUpdateColumnDescription: (
    tableName: string,
    columnName: string,
    description: string
  ) => void;
  onRenameTable: (oldName: string, newName: string) => void;
}

export interface TableListProps {
  tables: Table[];
  selectedTable: string | null;
  onSelectTable: (tableName: string) => void;
  onRenameTable: (oldName: string, newName: string) => void;
  onDeleteTable: (tableName: string) => void;
  onShowTableInfo: (tableName: string) => void;
  onImportFile: (fileName: string) => void;
  onCreateTable: (tableName: string, columns: Column[]) => void;
}

// Utility function to map backend dataset to frontend dataset
export const mapDataset = (backendDataset: BackendDataset): Dataset => {
  return {
    id: backendDataset.id,
    name: backendDataset.name,
    description: backendDataset.description,
    created_at: backendDataset.created_at,
    owner_id: backendDataset.owner_id,
    data_schema: backendDataset.data_schema,
    rowCount: backendDataset.row_count || 0,
  };
};
