import { create } from "zustand";
import { DatasetService } from "./services";
import type {
  Column,
  ConvertDatasetRequest,
  Dataset,
  DatasetSchema,
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

      const datasets = await DatasetService.getDatasets(1, 100, token);

      set({
        datasets,
        isLoading: false,
        lastFetchTime: now,
        error: null,
        selectedDataset: null, // Clear selected dataset when fetching
        activeTab: "sql", // Always switch to SQL tab when fetching datasets
      });

    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to fetch datasets";

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
      const dataset = await DatasetService.getDataset(datasetId, token);

      if (dataset) {
        set({ selectedDataset: dataset });
      }

      return dataset;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to get dataset";
      set({ error: errorMessage });
      return null;
    }
  },

  // Fetch and update schema for a specific dataset
  fetchDatasetSchema: async (datasetId: string, token: string) => {
    try {
      const dataset = await DatasetService.getDataset(datasetId, token);

      if (dataset) {
        // Update only schema, preserve existing rowCount completely
        set((state) => ({
          datasets: state.datasets.map((d) =>
            d.id === datasetId
              ? {
                  ...d,
                  data_schema: dataset.data_schema,
                  // Keep existing rowCount, don't update it
                }
              : d
          ),
          selectedDataset:
            state.selectedDataset?.id === datasetId
              ? {
                  ...state.selectedDataset,
                  data_schema: dataset.data_schema,
                  // Keep existing rowCount, don't update it
                }
              : state.selectedDataset,
        }));
        return dataset;
      }

      return null;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to fetch dataset schema";
      set({ error: errorMessage });
      return null;
    }
  },

  // Delete a dataset
  deleteDataset: async (datasetId: string, token: string) => {
    try {
      const result = await DatasetService.deleteDataset(datasetId, token);

      if (result.success) {
        set((state) => ({
          datasets: state.datasets.filter(
            (dataset) => dataset.id !== datasetId
          ),
          selectedDataset: null, // Always clear selected dataset when deleting
          activeTab: "sql", // Switch to SQL tab when deleting dataset
        }));
      }

      return result.success;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to delete dataset";
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
      set({ isLoading: true, error: null });

      const dataset = await DatasetService.convertDataset(request, token);

      if (dataset) {
        set((state) => ({
          datasets: [dataset, ...state.datasets],
          selectedDataset: dataset,
          isLoading: false,
          error: null,
        }));
      } else {
        set({ isLoading: false, error: "Failed to convert dataset" });
      }

      return dataset;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to convert dataset";
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  // Execute SQL query
  executeQuery: async (query: string, token: string, limit: number = 100) => {
    try {
      set({ isExecutingQuery: true, error: null });

      const result = await DatasetService.executeQuery(query, limit, token);

      set({
        queryResults: result,
        isExecutingQuery: false,
        error: result?.error ? result.error : null,
      });

      return result;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to execute query";
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
    set({ selectedDataset: dataset });
  },

  // Set selected table
  setSelectedTable: (tableName: string | null) => {
    set({ selectedTable: tableName });
  },

  // Set active tab
  setActiveTab: (tab: string) => {
    set({ activeTab: tab });
  },

  // Add dataset to store
  addDataset: (dataset: Dataset) => {
    set((state) => ({
      datasets: [dataset, ...state.datasets],
    }));
  },

  // Update dataset in store
  updateDataset: (datasetId: string, updates: Partial<Dataset>) => {
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
      set({ isLoading: true, error: null });

      const result = await DatasetService.updateDatasetInfo(
        datasetId,
        request,
        token
      );

      if (result.success && result.data) {
        // Update store with the returned dataset data
        // Preserve existing rowCount if the API response doesn't include it
        set((state) => {
          const existingDataset = state.datasets.find((d) => d.id === datasetId);
          const existingSelectedDataset = state.selectedDataset?.id === datasetId ? state.selectedDataset : null;

          // Preserve rowCount from existing dataset if not in API response
          const updatedData = result.data!;
          if (!updatedData.rowCount && existingDataset?.rowCount) {
            updatedData.rowCount = existingDataset.rowCount;
          }

          return {
            datasets: state.datasets.map((dataset) =>
              dataset.id === datasetId ? updatedData : dataset
            ),
            selectedDataset:
              state.selectedDataset?.id === datasetId
                ? {
                    ...updatedData,
                    rowCount: updatedData.rowCount || existingSelectedDataset?.rowCount || 0,
                  }
                : state.selectedDataset,
            isLoading: false,
            error: null,
          };
        });
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
      set({ isLoading: true, error: null });

      const result = await DatasetService.updateDatasetSchema(
        datasetId,
        request,
        token
      );

      if (result.success) {
        // Update the dataset schema in the store with the new descriptions
        // This ensures the UI reflects the changes immediately without refresh
        set((state) => {
          // Helper function to update schema with new descriptions
          const updatedSchema = (schema: DatasetSchema[]) =>
            schema.map((field) => {
              if (field.column_name in request.descriptions) {
                return {
                  ...field,
                  desc: request.descriptions[field.column_name],
                };
              }
              return field;
            });

          // Update selectedDataset if it matches
          const updatedSelectedDataset =
            state.selectedDataset?.id === datasetId
              ? {
                  ...state.selectedDataset,
                  data_schema: updatedSchema(state.selectedDataset.data_schema),
                }
              : state.selectedDataset;

          // Update dataset in datasets array
          const updatedDatasets = state.datasets.map((dataset) =>
            dataset.id === datasetId
              ? {
                  ...dataset,
                  data_schema: updatedSchema(dataset.data_schema),
                }
              : dataset
          );

          return {
            datasets: updatedDatasets,
            selectedDataset: updatedSelectedDataset,
            isLoading: false,
            error: null,
          };
        });
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
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Remove dataset from store
  removeDataset: (datasetId: string) => {
    set((state) => ({
      datasets: state.datasets.filter((dataset) => dataset.id !== datasetId),
      selectedDataset:
        state.selectedDataset?.id === datasetId ? null : state.selectedDataset,
    }));
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Refresh all data
  refreshData: async (token: string) => {
    const { fetchDatasets } = get();
    await fetchDatasets(token, true); // Force refresh
  },

  // Reset store
  reset: () => {
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
    set((state) => ({
      tables: state.tables.map((table) =>
        table.name === oldName ? { ...table, name: newName } : table
      ),
      selectedTable:
        state.selectedTable === oldName ? newName : state.selectedTable,
    }));
  },

  handleDeleteTable: (tableName: string) => {
    set((state) => ({
      tables: state.tables.filter((table) => table.name !== tableName),
      selectedTable:
        state.selectedTable === tableName ? null : state.selectedTable,
    }));
  },

  handleUpdateTableDescription: (tableName: string, description: string) => {
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
    set({ selectedTable: tableName, activeTab: "table-info" });
  },

  handleImportFile: (fileName: string) => {
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
