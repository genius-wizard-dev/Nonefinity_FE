import { create } from "zustand";
import { DatasetService } from "./services";
import type {
  Column,
  ConvertDatasetRequest,
  Dataset,
  DatasetStoreActions,
  DatasetStoreState,
  Table,
  UpdateDatasetRequest,
  UpdateDatasetSchemaRequest,
} from "./types";

interface DatasetStore extends DatasetStoreState, DatasetStoreActions {}

export const useDatasetStore = create<DatasetStore>((set, get) => ({
  // Initial state
  datasets: [],
  isLoading: false,
  error: null,
  lastFetchTime: null,
  selectedDataset: null,
  queryResults: null,
  isExecutingQuery: false,
  tables: [],
  selectedTable: null,
  activeTab: "sql",

  // Fetch datasets with caching
  fetchDatasets: async (token: string, force = false) => {
    const { lastFetchTime } = get();
    const now = Date.now();

    // Don't fetch if we have recent data (within 30 seconds) and not forced
    if (!force && lastFetchTime && now - lastFetchTime < 30000) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      console.log("📊 Store: Fetching datasets");
      const datasets = await DatasetService.getDatasets(1, 100, token);

      set({
        datasets,
        isLoading: false,
        lastFetchTime: now,
        error: null,
        selectedDataset: null, // Clear selected dataset when fetching
        activeTab: "sql", // Always switch to SQL tab when fetching datasets
      });

      console.log("✅ Store: Datasets fetched successfully:", datasets.length);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to fetch datasets";
      console.error("❌ Store: Fetch datasets error:", errorMessage);

      set({
        error: errorMessage,
        isLoading: false,
        selectedDataset: null, // Clear selected dataset even on error
        activeTab: "sql", // Switch to SQL tab even on error
      });
    }
  },

  // Get a specific dataset
  getDataset: async (datasetId: string, token: string) => {
    try {
      console.log("📊 Store: Getting dataset:", datasetId);
      const dataset = await DatasetService.getDataset(datasetId, token);

      if (dataset) {
        set({ selectedDataset: dataset });
        console.log("✅ Store: Dataset loaded:", dataset.name);
      }

      return dataset;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to get dataset";
      console.error("❌ Store: Get dataset error:", errorMessage);
      set({ error: errorMessage });
      return null;
    }
  },

  // Delete a dataset
  deleteDataset: async (datasetId: string, token: string) => {
    try {
      console.log("🗑️ Store: Deleting dataset:", datasetId);
      const result = await DatasetService.deleteDataset(datasetId, token);

      if (result.success) {
        set((state) => ({
          datasets: state.datasets.filter(
            (dataset) => dataset.id !== datasetId
          ),
          selectedDataset: null, // Always clear selected dataset when deleting
          activeTab: "sql", // Switch to SQL tab when deleting dataset
        }));
        console.log("✅ Store: Dataset deleted successfully");
      }

      return result.success;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to delete dataset";
      console.error("❌ Store: Delete dataset error:", errorMessage);
      set({
        error: errorMessage,
        selectedDataset: null, // Clear selected dataset even on error
        activeTab: "sql", // Switch to SQL tab even on error
      });
      return false;
    }
  },

  // Convert file to dataset
  convertDataset: async (request: ConvertDatasetRequest, token: string) => {
    try {
      console.log("🔄 Store: Converting dataset:", request);
      set({ isLoading: true, error: null });

      const dataset = await DatasetService.convertDataset(request, token);

      if (dataset) {
        set((state) => ({
          datasets: [dataset, ...state.datasets],
          selectedDataset: dataset,
          isLoading: false,
          error: null,
        }));
        console.log("✅ Store: Dataset converted successfully:", dataset.name);
      } else {
        set({ isLoading: false, error: "Failed to convert dataset" });
      }

      return dataset;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to convert dataset";
      console.error("❌ Store: Convert dataset error:", errorMessage);
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  // Execute SQL query
  executeQuery: async (query: string, token: string, limit: number = 100) => {
    try {
      console.log("🔍 Store: Executing query:", { query, limit });
      set({ isExecutingQuery: true, error: null });

      const result = await DatasetService.executeQuery(query, limit, token);

      set({
        queryResults: result,
        isExecutingQuery: false,
        error: result?.error ? result.error : null,
      });

      console.log("✅ Store: Query executed successfully");
      return result;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to execute query";
      console.error("❌ Store: Execute query error:", errorMessage);
      set({
        error: errorMessage,
        isExecutingQuery: false,
        queryResults: {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime: "0ms",
          error: errorMessage,
        },
      });
      return null;
    }
  },

  // Set selected dataset
  setSelectedDataset: (dataset: Dataset | null) => {
    console.log("📊 Store: Setting selected dataset:", dataset?.name || "none");
    set({ selectedDataset: dataset });
  },

  // Set selected table
  setSelectedTable: (tableName: string | null) => {
    console.log("📊 Store: Setting selected table:", tableName || "none");
    set({ selectedTable: tableName });
  },

  // Set active tab
  setActiveTab: (tab: string) => {
    console.log("📊 Store: Setting active tab:", tab);
    set({ activeTab: tab });
  },

  // Add dataset to store
  addDataset: (dataset: Dataset) => {
    console.log("📊 Store: Adding dataset:", dataset.name);
    set((state) => ({
      datasets: [dataset, ...state.datasets],
    }));
  },

  // Update dataset in store
  updateDataset: (datasetId: string, updates: Partial<Dataset>) => {
    console.log("📊 Store: Updating dataset:", datasetId);
    set((state) => ({
      datasets: state.datasets.map((dataset) =>
        dataset.id === datasetId ? { ...dataset, ...updates } : dataset
      ),
      selectedDataset:
        state.selectedDataset?.id === datasetId
          ? { ...state.selectedDataset, ...updates }
          : state.selectedDataset,
    }));
  },

  // Update dataset info via API
  updateDatasetInfo: async (
    datasetId: string,
    request: UpdateDatasetRequest,
    token: string
  ) => {
    try {
      console.log("📝 Store: Updating dataset info:", { datasetId, request });
      set({ isLoading: true, error: null });

      const result = await DatasetService.updateDatasetInfo(
        datasetId,
        request,
        token
      );

      if (result.success && result.data) {
        // Update store with the returned dataset data
        set((state) => ({
          datasets: state.datasets.map((dataset) =>
            dataset.id === datasetId ? result.data! : dataset
          ),
          selectedDataset:
            state.selectedDataset?.id === datasetId
              ? result.data!
              : state.selectedDataset,
          isLoading: false,
          error: null,
        }));
        console.log("✅ Store: Dataset info updated successfully");
        return true;
      } else {
        set({
          isLoading: false,
          error: result.error || "Failed to update dataset info",
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to update dataset info";
      console.error("❌ Store: Update dataset info error:", errorMessage);
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Update dataset schema via API
  updateDatasetSchema: async (
    datasetId: string,
    request: UpdateDatasetSchemaRequest,
    token: string
  ) => {
    try {
      console.log("📝 Store: Updating dataset schema:", { datasetId, request });
      set({ isLoading: true, error: null });

      const result = await DatasetService.updateDatasetSchema(
        datasetId,
        request,
        token
      );

      console.log("📊 Store: Update schema result:", result);
      console.log("📊 Store: Result success:", result.success);

      if (result.success) {
        // Since the API only returns success/message, we don't update the store data
        // The local state changes are already applied via onUpdateDataset
        set({
          isLoading: false,
          error: null,
        });
        console.log("✅ Store: Dataset schema updated successfully");
        return true;
      } else {
        set({
          isLoading: false,
          error: result.error || "Failed to update dataset schema",
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to update dataset schema";
      console.error("❌ Store: Update dataset schema error:", errorMessage);
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Remove dataset from store
  removeDataset: (datasetId: string) => {
    console.log("📊 Store: Removing dataset:", datasetId);
    set((state) => ({
      datasets: state.datasets.filter((dataset) => dataset.id !== datasetId),
      selectedDataset:
        state.selectedDataset?.id === datasetId ? null : state.selectedDataset,
    }));
  },

  // Clear error
  clearError: () => {
    console.log("📊 Store: Clearing error");
    set({ error: null });
  },

  // Refresh all data
  refreshData: async (token: string) => {
    console.log("📊 Store: Refreshing data");
    const { fetchDatasets } = get();
    await fetchDatasets(token, true); // Force refresh
  },

  // Reset store
  reset: () => {
    console.log("📊 Store: Resetting store");
    set({
      datasets: [],
      isLoading: false,
      error: null,
      lastFetchTime: null,
      selectedDataset: null,
      queryResults: null,
      isExecutingQuery: false,
      tables: [],
      selectedTable: null,
      activeTab: "sql",
    });
  },

  // Table management methods (for compatibility with existing UI)
  handleRenameTable: (oldName: string, newName: string) => {
    console.log("📊 Store: Renaming table:", oldName, "->", newName);
    set((state) => ({
      tables: state.tables.map((table) =>
        table.name === oldName ? { ...table, name: newName } : table
      ),
      selectedTable:
        state.selectedTable === oldName ? newName : state.selectedTable,
    }));
  },

  handleDeleteTable: (tableName: string) => {
    console.log("📊 Store: Deleting table:", tableName);
    set((state) => ({
      tables: state.tables.filter((table) => table.name !== tableName),
      selectedTable:
        state.selectedTable === tableName ? null : state.selectedTable,
    }));
  },

  handleUpdateTableDescription: (tableName: string, description: string) => {
    console.log("📊 Store: Updating table description:", tableName);
    set((state) => ({
      tables: state.tables.map((table) =>
        table.name === tableName ? { ...table, description } : table
      ),
    }));
  },

  handleUpdateColumnDescription: (
    tableName: string,
    columnName: string,
    description: string
  ) => {
    console.log(
      "📊 Store: Updating column description:",
      tableName,
      columnName
    );
    set((state) => ({
      tables: state.tables.map((table) =>
        table.name === tableName
          ? {
              ...table,
              columns: table.columns.map((col) =>
                col.name === columnName ? { ...col, description } : col
              ),
            }
          : table
      ),
    }));
  },

  handleShowTableInfo: (tableName: string) => {
    console.log("📊 Store: Showing table info:", tableName);
    set({ selectedTable: tableName, activeTab: "table-info" });
  },

  handleImportFile: (fileName: string) => {
    console.log("📊 Store: Importing file:", fileName);
    const tableName = fileName.split(".")[0];
    const newTable: Table = {
      name: tableName,
      rowCount: Math.floor(Math.random() * 10000),
      description: `Imported from ${fileName}`,
      columns: [
        {
          name: "id",
          type: "INTEGER",
          nullable: false,
          primaryKey: true,
          description: "Primary key",
        },
        {
          name: "data",
          type: "TEXT",
          nullable: true,
          primaryKey: false,
          description: "Imported data",
        },
      ],
    };

    set((state) => ({
      tables: [...state.tables, newTable],
      selectedTable: tableName,
      activeTab: "table-info",
    }));
  },

  handleCreateTable: (tableName: string, columns: Column[]) => {
    console.log("📊 Store: Creating table:", tableName);
    const newTable: Table = {
      name: tableName,
      rowCount: 0,
      description: "",
      columns: columns,
    };

    set((state) => ({
      tables: [...state.tables, newTable],
      selectedTable: tableName,
      activeTab: "table-info",
    }));
  },
}));
