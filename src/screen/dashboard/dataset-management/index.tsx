import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@clerk/clerk-react";
import { Code2, Database, Info } from "lucide-react";
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
    selectedDataset,
    queryResults,
    isExecutingQuery,
    activeTab,
    // Actions
    fetchDatasets,
    executeQuery,
    setSelectedDataset,
    setActiveTab,
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

  // Ensure we're on SQL tab when no dataset is selected
  useEffect(() => {
    if (!selectedDataset && activeTab === "dataset-info") {
      setActiveTab("sql");
    }
  }, [selectedDataset, activeTab, setActiveTab]);

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
      {/* Left Sidebar - Datasets */}
      <aside className="w-80 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col shadow-sm">
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground text-lg">
                Dataset Manager
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {datasets.length} dataset{datasets.length !== 1 ? "s" : ""}{" "}
                available
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <DatasetList
            datasets={datasets}
            selectedDataset={selectedDataset}
            onSelectDataset={setSelectedDataset}
            onViewDataset={(dataset: Dataset) => {
              setSelectedDataset(dataset);
              setActiveTab("dataset-info");
            }}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Header with Tabs */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm shadow-sm">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full justify-start rounded-none border-0 bg-transparent h-14 px-6">
              <TabsTrigger
                value="sql"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all rounded-md px-4 py-2"
              >
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-blue-500" />
                  SQL Editor
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="dataset-info"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all rounded-md px-4 py-2"
                disabled={!selectedDataset}
              >
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-green-500" />
                  {selectedDataset
                    ? `Dataset: ${selectedDataset.name}`
                    : "Dataset Info"}
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsContent
              value="sql"
              className="flex-1 flex flex-col m-0 overflow-hidden"
            >
              <div className="flex-1 flex flex-col min-h-0 p-6">
                <div className="flex-1 flex flex-col min-h-0 space-y-4">
                  <div className="flex-shrink-0">
                    <SqlEditor
                      onExecute={handleExecuteQuery}
                      isExecuting={isExecutingQuery}
                    />
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <QueryResults results={queryResults} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="dataset-info"
              className="flex-1 m-0 overflow-hidden"
            >
              <div className="h-full p-6">
                {selectedDataset ? (
                  <DatasetDetails
                    dataset={selectedDataset}
                    onUpdateDataset={(
                      datasetId: string,
                      updates: Partial<Dataset>
                    ) => {
                      useDatasetStore
                        .getState()
                        .updateDataset(datasetId, updates);
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-sm">
                        Select a dataset to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
