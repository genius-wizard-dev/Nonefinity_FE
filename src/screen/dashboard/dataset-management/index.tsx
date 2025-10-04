import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@clerk/clerk-react";
import { AlertCircle, Database } from "lucide-react";
import { useEffect } from "react";
import {
  DatasetDetails,
  DatasetList,
  QueryResults,
  SqlEditor,
} from "./components";
import { useDatasetStore } from "./store";
import type { Dataset } from "./types";

export default function DatasetManage() {
  const { getToken } = useAuth();
  const {
    // State
    datasets,
    error,
    selectedDataset,
    queryResults,
    isExecutingQuery,
    activeTab,
    // Actions
    fetchDatasets,
    executeQuery,
    setSelectedDataset,
    setActiveTab,
    clearError,
  } = useDatasetStore();

  // Initialize with mock data and fetch real data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const token = await getToken();
        if (token) {
          console.log("📊 Initializing dataset manager with token");
          await fetchDatasets(token);
        } else {
          console.log("📊 No token available, using mock data");
        }
      } catch (error) {
        console.error("❌ Failed to initialize dataset manager:", error);
      }
    };

    initializeData();
  }, [getToken, fetchDatasets]);

  const handleExecuteQuery = async (query: string) => {
    try {
      const token = await getToken();
      if (token) {
        await executeQuery(query, token);
      } else {
        console.warn("No token available for query execution");
      }
    } catch (error) {
      console.error("Query execution error:", error);
    }
  };

  return (
    <div className="flex h-full w-full bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-foreground">Dataset Manager</h1>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {datasets.length} dataset{datasets.length !== 1 ? "s" : ""} found
          </div>
          {/* <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-xs"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div> */}
        </div>

        {error && (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {error}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="ml-2 h-6 px-2 text-xs"
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DatasetList
          datasets={datasets}
          selectedDataset={selectedDataset}
          onSelectDataset={setSelectedDataset}
          onDeleteDataset={async (datasetId) => {
            try {
              const token = await getToken();
              if (token) {
                await useDatasetStore
                  .getState()
                  .deleteDataset(datasetId, token);
              }
            } catch (error) {
              console.error("Delete dataset error:", error);
            }
          }}
          onViewDataset={(dataset: Dataset) => {
            setSelectedDataset(dataset);
            setActiveTab("dataset-info");
          }}
        />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-card px-4 h-12">
            <TabsTrigger
              value="sql"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              SQL Editor
            </TabsTrigger>
            <TabsTrigger
              value="dataset-info"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              disabled={!selectedDataset}
            >
              {selectedDataset
                ? `Dataset: ${selectedDataset.name}`
                : "Dataset Info"}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="sql"
            className="flex-1 flex flex-col m-0 overflow-hidden"
          >
            <div className="flex-1 flex flex-col min-h-0">
              <SqlEditor
                onExecute={handleExecuteQuery}
                isExecuting={isExecutingQuery}
              />
              <div className="flex-1 min-h-0">
                <QueryResults results={queryResults} />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="dataset-info"
            className="flex-1 m-0 overflow-hidden"
          >
            {selectedDataset ? (
              <DatasetDetails
                dataset={selectedDataset}
                onUpdateDataset={(
                  datasetId: string,
                  updates: Partial<Dataset>
                ) => {
                  useDatasetStore.getState().updateDataset(datasetId, updates);
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm">
                  Select a dataset to view details
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
