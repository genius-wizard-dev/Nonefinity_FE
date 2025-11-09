import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getClerkToken } from "@/consts/endpoint";
import {
  Calendar,
  Check,
  Columns,
  Database,
  DollarSign,
  Edit2,
  FileText,
  Hash,
  Search,
  ToggleLeft,
  Type,
  X,
} from "lucide-react";
import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDatasetStore } from "../store";
import type { Dataset } from "../types";

interface DatasetDetailsProps {
  dataset: Dataset;
  onUpdateDataset: (datasetId: string, updates: Partial<Dataset>) => void;
}

export function DatasetDetails({
  dataset,
  onUpdateDataset,
}: DatasetDetailsProps) {
  const { isLoading } = useDatasetStore();
  const [editingDatasetName, setEditingDatasetName] = useState(false);
  const [datasetName, setDatasetName] = useState(dataset.name);
  const [editingDatasetDesc, setEditingDatasetDesc] = useState(false);
  const [datasetDesc, setDatasetDesc] = useState(dataset.description);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [columnDesc, setColumnDesc] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyWithDescriptions] = useState(false);
  const [allChanges, setAllChanges] = useState<Record<string, string>>({});
  const [originalData, setOriginalData] = useState<Dataset | null>(null);

  // Set original data when dataset changes
  React.useEffect(() => {
    if (dataset) {
      // Sync originalData when:
      // 1. originalData is null (first mount)
      // 2. Dataset ID changed (switching datasets)
      // 3. Dataset schema changed (after store update from API)
      const shouldUpdate =
        !originalData ||
        originalData.id !== dataset.id ||
        JSON.stringify(originalData.data_schema) !==
          JSON.stringify(dataset.data_schema);

      if (shouldUpdate) {
        setOriginalData(dataset);
        // Clear any pending changes when dataset changes significantly
        if (originalData && originalData.id !== dataset.id) {
          setAllChanges({});
        }
      }
    }
  }, [dataset, originalData]);

  const handleSaveDatasetName = async () => {
    if (datasetName.trim() && datasetName !== dataset.name) {
      try {
        // Update local state first
        onUpdateDataset(dataset.id, { name: datasetName.trim() });

        // Call API to save changes
        const token = await getClerkToken();
        if (token) {
          const { updateDatasetInfo } = useDatasetStore.getState();
          const success = await updateDatasetInfo(
            dataset.id,
            { name: datasetName.trim(), description: dataset.description },
            token
          );

          if (success) {
            toast.success("Dataset name updated successfully");
          } else {
            toast.error("Failed to update dataset name");
            // Revert local changes on failure
            onUpdateDataset(dataset.id, { name: dataset.name });
          }
        }
      } catch {
        toast.error("Failed to update dataset name");
        // Revert local changes on error
        onUpdateDataset(dataset.id, { name: dataset.name });
      }
    }
    setEditingDatasetName(false);
  };

  const handleCancelDatasetName = () => {
    setDatasetName(dataset.name);
    setEditingDatasetName(false);
  };

  const handleSaveDatasetDesc = async () => {
    try {
      // Update local state first
      onUpdateDataset(dataset.id, { description: datasetDesc });

      // Call API to save changes
      const token = await getClerkToken();
      if (token) {
        const { updateDatasetInfo } = useDatasetStore.getState();
        const success = await updateDatasetInfo(
          dataset.id,
          { name: dataset.name, description: datasetDesc },
          token
        );

        if (success) {
          toast.success("Dataset description updated successfully");
        } else {
          toast.error("Failed to update dataset description");
          // Revert local changes on failure
          onUpdateDataset(dataset.id, { description: dataset.description });
        }
      }
    } catch {
      toast.error("Failed to update dataset description");
      // Revert local changes on error
      onUpdateDataset(dataset.id, { description: dataset.description });
    }
    setEditingDatasetDesc(false);
  };

  const handleCancelDatasetDesc = () => {
    setDatasetDesc(dataset.description);
    setEditingDatasetDesc(false);
  };

  // Save individual column description
  const handleSaveColumnDescription = (columnName: string) => {
    // Check if the change is different from original data
    const originalCol = originalData?.data_schema.find(
      (col) => col.column_name === columnName
    );
    const originalDesc = originalCol?.desc || "";
    const isDifferent = columnDesc !== originalDesc;

    // Update allChanges state - only keep changes that are different from original
    setAllChanges((prev) => {
      const newChanges = { ...prev };
      if (isDifferent) {
        newChanges[columnName] = columnDesc;
      } else {
        // Remove from changes if it's the same as original
        delete newChanges[columnName];
      }
      return newChanges;
    });

    // Update local dataset state
    const updatedSchema = dataset.data_schema.map((col) =>
      col.column_name === columnName ? { ...col, desc: columnDesc } : col
    );
    onUpdateDataset(dataset.id, { data_schema: updatedSchema });

    setEditingColumn(null);
    setColumnDesc("");
  };

  // Start editing a column
  const handleStartEditColumn = (columnName: string, currentDesc: string) => {
    setEditingColumn(columnName);
    setColumnDesc(currentDesc);
  };

  // Cancel editing a column
  const handleCancelEditColumn = () => {
    setEditingColumn(null);
    setColumnDesc("");
  };

  // Save all changes to API
  const handleSaveAllChanges = async () => {
    if (Object.keys(allChanges).length === 0) return;

    try {
      const token = await getClerkToken();
      if (token) {
        const store = useDatasetStore.getState();
        const success = await store.updateDatasetSchema(
          dataset.id,
          { descriptions: allChanges },
          token
        );


        if (success) {
          // Get updated dataset from store after successful update
          // This ensures we use the latest state from Zustand
          const updatedDataset = store.selectedDataset;
          if (updatedDataset && updatedDataset.id === dataset.id) {
            setOriginalData(updatedDataset);
          } else {
            // Fallback: update original data manually if store doesn't have it
            const updatedOriginalData = {
              ...dataset,
              data_schema: dataset.data_schema.map((col) => ({
                ...col,
                desc: allChanges[col.column_name] || col.desc,
              })),
            };
            setOriginalData(updatedOriginalData);
          }

          // Clear all changes after updating original data
          setAllChanges({});

          toast.success("Schema descriptions updated successfully");
        } else {
          toast.error("Failed to update schema descriptions");
        }
      }
    } catch {
      toast.error("Failed to update schema descriptions");
    }
  };

  // Discard all changes
  const handleDiscardChanges = () => {
    if (!originalData) return;

    // Reset dataset to original state
    onUpdateDataset(dataset.id, { data_schema: originalData.data_schema });
    setAllChanges({});
  };

  // Helper function to check if a column has meaningful changes
  const hasColumnChanged = useCallback(
    (columnName: string) => {
      return Object.prototype.hasOwnProperty.call(allChanges, columnName);
    },
    [allChanges]
  );

  // Filter and search logic
  const filteredColumns = useMemo(() => {
    let filtered = dataset.data_schema;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (col) =>
          col.column_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (col.desc &&
            col.desc.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Description filter
    if (showOnlyWithDescriptions) {
      filtered = filtered.filter((col) => {
        const hasDescription = col.desc && col.desc.trim() !== "";
        const hasChangedDescription = hasColumnChanged(col.column_name);
        return hasDescription || hasChangedDescription;
      });
    }

    return filtered;
  }, [
    dataset.data_schema,
    searchQuery,
    showOnlyWithDescriptions,
    hasColumnChanged,
  ]);

  const getColumnTypeIcon = (type: string) => {
    const typeLower = type.toLowerCase();

    if (
      typeLower.includes("int") ||
      typeLower.includes("bigint") ||
      typeLower.includes("integer")
    )
      return <Hash className="h-3 w-3 text-green-500" />;
    if (
      typeLower.includes("double") ||
      typeLower.includes("float") ||
      typeLower.includes("decimal")
    )
      return <DollarSign className="h-3 w-3 text-purple-500" />;
    if (
      typeLower.includes("date") ||
      typeLower.includes("timestamp") ||
      typeLower.includes("time")
    )
      return <Calendar className="h-3 w-3 text-orange-500" />;
    if (
      typeLower.includes("text") ||
      typeLower.includes("string") ||
      typeLower.includes("varchar") ||
      typeLower.includes("char")
    )
      return <Type className="h-3 w-3 text-blue-500" />;
    if (typeLower.includes("boolean") || typeLower.includes("bool"))
      return <ToggleLeft className="h-3 w-3 text-pink-500" />;
    if (typeLower.includes("json") || typeLower.includes("blob"))
      return <FileText className="h-3 w-3 text-indigo-500" />;

    return <Columns className="h-3 w-3 text-gray-500" />;
  };

  const getColumnTypeColor = (type: string) => {
    const typeLower = type.toLowerCase();

    if (
      typeLower.includes("int") ||
      typeLower.includes("bigint") ||
      typeLower.includes("integer")
    )
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (
      typeLower.includes("double") ||
      typeLower.includes("float") ||
      typeLower.includes("decimal")
    )
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (
      typeLower.includes("date") ||
      typeLower.includes("timestamp") ||
      typeLower.includes("time")
    )
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    if (
      typeLower.includes("text") ||
      typeLower.includes("string") ||
      typeLower.includes("varchar") ||
      typeLower.includes("char")
    )
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (typeLower.includes("boolean") || typeLower.includes("bool"))
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
    if (typeLower.includes("json") || typeLower.includes("blob"))
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";

    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  // Check if there are any changes to show main Save button
  const hasChanges = useMemo(() => {
    return Object.keys(allChanges).length > 0;
  }, [allChanges]);

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Header Section */}
      <Card className="m-4 mb-2 border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {editingDatasetName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={datasetName}
                      onChange={(e) => setDatasetName(e.target.value)}
                      className="font-mono text-2xl font-bold h-10"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveDatasetName();
                        if (e.key === "Escape") handleCancelDatasetName();
                      }}
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveDatasetName}
                        disabled={isLoading}
                        className="h-8 px-3"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelDatasetName}
                        className="h-8 px-3"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1
                      className="text-2xl font-bold text-foreground font-mono cursor-pointer hover:text-primary transition-colors group flex items-center gap-2"
                      onClick={() => setEditingDatasetName(true)}
                    >
                      {dataset.name}
                      <Edit2 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h1>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {dataset.rowCount?.toLocaleString() || 0} rows
                    </Badge>
                  </>
                )}
              </div>

              <div className="mt-3">
                {editingDatasetDesc ? (
                  <div className="flex items-start gap-2">
                    <Textarea
                      value={datasetDesc}
                      onChange={(e) => setDatasetDesc(e.target.value)}
                      placeholder="Add dataset description..."
                      className="flex-1 text-sm min-h-[80px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.metaKey)
                          handleSaveDatasetDesc();
                        if (e.key === "Escape") handleCancelDatasetDesc();
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveDatasetDesc}
                        disabled={isLoading}
                        className="h-8 px-3"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelDatasetDesc}
                        className="h-8 px-3"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingDatasetDesc(true)}
                    className="flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer group p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-dashed border-border hover:border-primary/50"
                  >
                    <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p className="flex-1">
                      {dataset.description ||
                        "Click to add dataset description..."}
                    </p>
                    <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content with Tabs */}
      <div className="flex-1 min-h-0 overflow-hidden px-4">
        <Tabs defaultValue="columns" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="columns" className="flex items-center gap-2">
              <Columns className="h-4 w-4" />
              Columns ({filteredColumns.length})
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="columns" className="flex-1 min-h-0">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Dataset Schema</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search columns..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 w-64"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasChanges && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDiscardChanges}
                            className="flex items-center gap-2 h-10"
                          >
                            <X className="h-4 w-4" />
                            Discard
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveAllChanges}
                            disabled={isLoading}
                            className="flex items-center gap-2 h-10"
                          >
                            <Check className="h-4 w-4" />
                            Save Changes
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
                <div className="h-full">
                  <div className="h-full">
                    <div className="border-b bg-muted/30 px-6 py-3">
                      <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <div className="col-span-4">Column Name</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-6">Description</div>
                      </div>
                    </div>
                    <ScrollArea className="h-[350px] scrollbar-hide">
                      <div className="divide-y">
                        {filteredColumns.map((column) => (
                          <div
                            key={column.column_name}
                            className={`group px-6 py-4 transition-all duration-200 hover:bg-muted/30 ${
                              hasColumnChanged(column.column_name)
                                ? "bg-amber-50/50 dark:bg-amber-950/20"
                                : ""
                            }`}
                          >
                            <div className="grid grid-cols-12 gap-4 items-center">
                              <div className="col-span-4">
                                <div className="flex items-center gap-2">
                                  {getColumnTypeIcon(column.column_type)}
                                  <span className="font-mono text-sm font-medium text-foreground">
                                    {column.column_name}
                                  </span>
                                </div>
                              </div>
                              <div className="col-span-2">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${getColumnTypeColor(
                                    column.column_type
                                  )} flex items-center gap-1 w-fit`}
                                >
                                  {column.column_type}
                                </Badge>
                              </div>
                              <div className="col-span-6">
                                {editingColumn === column.column_name ? (
                                  <div className="space-y-3">
                                    <Textarea
                                      value={columnDesc}
                                      onChange={(e) =>
                                        setColumnDesc(e.target.value)
                                      }
                                      placeholder="Add column description..."
                                      className="text-sm min-h-[40px] resize-none"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCancelEditColumn}
                                        className="h-7 px-2 text-xs"
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleSaveColumnDescription(
                                            column.column_name
                                          )
                                        }
                                        className="h-7 px-2 text-xs"
                                        disabled={isLoading}
                                      >
                                        <Check className="h-3 w-3 mr-1" />
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() =>
                                      handleStartEditColumn(
                                        column.column_name,
                                        column.desc || ""
                                      )
                                    }
                                    className="text-sm text-muted-foreground hover:text-foreground cursor-pointer group p-2 rounded border border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 min-h-[40px] flex items-center"
                                  >
                                    <p className="flex-1">
                                      {hasColumnChanged(column.column_name)
                                        ? allChanges[column.column_name] ||
                                          "Click to add description..."
                                        : column.desc ||
                                          "Click to add description..."}
                                    </p>
                                    <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="flex-1 min-h-0">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Dataset Overview</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-hidden p-0">
                <ScrollArea className="h-full scrollbar-hide">
                  <div className="space-y-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Database className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">
                              Total Rows
                            </span>
                          </div>
                          <p className="text-2xl font-bold">
                            {dataset.rowCount?.toLocaleString() || 0}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Columns className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">
                              Total Columns
                            </span>
                          </div>
                          <p className="text-2xl font-bold">
                            {dataset.data_schema.length}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">
                              Described Columns
                            </span>
                          </div>
                          <p className="text-2xl font-bold">
                            {
                              dataset.data_schema.filter(
                                (col) => col.desc && col.desc.trim() !== ""
                              ).length
                            }
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Column Types Distribution
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(
                          dataset.data_schema.reduce(
                            (acc, col) => {
                              const type = col.column_type.toLowerCase();
                              if (
                                type.includes("int") ||
                                type.includes("bigint") ||
                                type.includes("integer")
                              )
                                acc.numeric++;
                              else if (
                                type.includes("double") ||
                                type.includes("float") ||
                                type.includes("decimal")
                              )
                                acc.numeric++;
                              else if (
                                type.includes("text") ||
                                type.includes("string") ||
                                type.includes("varchar") ||
                                type.includes("char")
                              )
                                acc.text++;
                              else if (
                                type.includes("date") ||
                                type.includes("timestamp") ||
                                type.includes("time")
                              )
                                acc.date++;
                              else if (
                                type.includes("boolean") ||
                                type.includes("bool")
                              )
                                acc.boolean++;
                              else if (
                                type.includes("json") ||
                                type.includes("blob")
                              )
                                acc.json++;
                              else acc.other++;
                              return acc;
                            },
                            {
                              numeric: 0,
                              text: 0,
                              date: 0,
                              boolean: 0,
                              json: 0,
                              other: 0,
                            }
                          )
                        ).map(([type, count]) => (
                          <Card key={type}>
                            <CardContent className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                {type === "numeric" && (
                                  <Hash className="h-4 w-4 text-green-500" />
                                )}
                                {type === "text" && (
                                  <Type className="h-4 w-4 text-blue-500" />
                                )}
                                {type === "date" && (
                                  <Calendar className="h-4 w-4 text-orange-500" />
                                )}
                                {type === "boolean" && (
                                  <ToggleLeft className="h-4 w-4 text-pink-500" />
                                )}
                                {type === "json" && (
                                  <FileText className="h-4 w-4 text-indigo-500" />
                                )}
                                {type === "other" && (
                                  <Columns className="h-4 w-4 text-gray-500" />
                                )}
                              </div>
                              <p className="text-2xl font-bold">
                                {count as number}
                              </p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {type}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
