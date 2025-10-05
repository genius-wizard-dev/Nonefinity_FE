import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getClerkToken } from "@/consts/endpoint";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Database,
  DollarSign,
  Edit2,
  FileText,
  Hash,
  Hash as HashIcon,
  Info,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  ToggleLeft,
  Trash2,
  Type,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DatasetService } from "../services";
import { useDatasetStore } from "../store";
import type { Column, Dataset } from "../types";

// Function to get icon for data type
const getDataTypeIcon = (dataType: string) => {
  const type = dataType.toLowerCase();

  if (
    type.includes("varchar") ||
    type.includes("text") ||
    type.includes("char")
  ) {
    return <Type className="h-3 w-3 text-blue-500" />;
  }
  if (
    type.includes("int") ||
    type.includes("bigint") ||
    type.includes("integer")
  ) {
    return <Hash className="h-3 w-3 text-green-500" />;
  }
  if (
    type.includes("double") ||
    type.includes("float") ||
    type.includes("decimal")
  ) {
    return <DollarSign className="h-3 w-3 text-purple-500" />;
  }
  if (
    type.includes("date") ||
    type.includes("timestamp") ||
    type.includes("time")
  ) {
    return <Calendar className="h-3 w-3 text-orange-500" />;
  }
  if (type.includes("boolean") || type.includes("bool")) {
    return <ToggleLeft className="h-3 w-3 text-pink-500" />;
  }
  if (type.includes("json") || type.includes("blob")) {
    return <FileText className="h-3 w-3 text-indigo-500" />;
  }

  // Default icon for unknown types
  return <HashIcon className="h-3 w-3 text-gray-500" />;
};

interface DatasetListProps {
  datasets: Dataset[];
  selectedDataset: Dataset | null;
  onSelectDataset: (dataset: Dataset) => void;
  onViewDataset: (dataset: Dataset) => void;
}

export function DatasetList({
  datasets,
  selectedDataset,
  onSelectDataset,
  onViewDataset,
}: DatasetListProps) {
  const { isLoading } = useDatasetStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [renamingDataset, setRenamingDataset] = useState<string | null>(null);
  const [newDatasetName, setNewDatasetName] = useState("");
  const [expandedDatasets, setExpandedDatasets] = useState<Set<string>>(
    new Set()
  );
  const [hoveredDataset, setHoveredDataset] = useState<string | null>(null);
  const [isAddDatasetDialogOpen, setIsAddDatasetDialogOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<Dataset | null>(null);
  const [isDeletingDataset, setIsDeletingDataset] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createDatasetName, setCreateDatasetName] = useState("");
  const [createDatasetDescription, setCreateDatasetDescription] = useState("");
  const [isCreatingDataset, setIsCreatingDataset] = useState(false);
  const [createColumns, setCreateColumns] = useState<Column[]>([
    {
      name: "id",
      type: "INTEGER",
      nullable: false,
      primaryKey: false,
      description: "",
    },
  ]);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const filteredDatasets = datasets.filter((dataset) =>
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (renamingDataset && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingDataset]);

  const handleRename = (datasetId: string) => {
    const dataset = datasets.find((d) => d.id === datasetId);
    if (dataset) {
      setRenamingDataset(datasetId);
      setNewDatasetName(dataset.name);
    }
    setOpenDropdownId(null);
  };

  const confirmRename = async () => {
    if (renamingDataset && newDatasetName.trim()) {
      const dataset = datasets.find((d) => d.id === renamingDataset);
      if (dataset && newDatasetName !== dataset.name) {
        const originalName = dataset.name;

        try {
          // Update local state first for immediate UI feedback
          useDatasetStore
            .getState()
            .updateDataset(renamingDataset, { name: newDatasetName.trim() });

          // Call API to save changes
          const token = await getClerkToken();
          if (token) {
            const { updateDatasetInfo } = useDatasetStore.getState();
            const success = await updateDatasetInfo(
              renamingDataset,
              { name: newDatasetName.trim(), description: dataset.description },
              token
            );

            if (success) {
              toast.success("Dataset renamed successfully", {
                description: `Dataset renamed to "${newDatasetName.trim()}".`,
              });
            } else {
              toast.error("Failed to rename dataset");
              // Revert local changes on failure
              useDatasetStore
                .getState()
                .updateDataset(renamingDataset, { name: originalName });
            }
          }
        } catch (error) {
          console.error("Error renaming dataset:", error);
          toast.error("Failed to rename dataset");
          // Revert local changes on error
          useDatasetStore
            .getState()
            .updateDataset(renamingDataset, { name: originalName });
        }
      }
    }
    setRenamingDataset(null);
    setNewDatasetName("");
  };

  const handleDelete = (datasetId: string) => {
    const dataset = datasets.find((d) => d.id === datasetId);
    if (dataset) {
      setDatasetToDelete(dataset);
      setDeleteConfirmOpen(true);
    }
    setOpenDropdownId(null);
  };

  const confirmDelete = async () => {
    if (!datasetToDelete) return;

    setIsDeletingDataset(true);
    try {
      // Call API to delete dataset
      const token = await getClerkToken();
      if (token) {
        const success = await DatasetService.deleteDataset(
          datasetToDelete.id,
          token
        );

        if (success) {
          // Remove dataset from local state immediately
          useDatasetStore.getState().removeDataset(datasetToDelete.id);

          toast.success("Dataset deleted successfully", {
            description: `Dataset "${datasetToDelete.name}" has been deleted.`,
          });

          setDeleteConfirmOpen(false);
          setDatasetToDelete(null);
        } else {
          toast.error("Failed to delete dataset", {
            description: "Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Error deleting dataset:", error);
      toast.error("Failed to delete dataset", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsDeletingDataset(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDatasetToDelete(null);
  };

  const handleShowInfo = (datasetId: string) => {
    const dataset = datasets.find((d) => d.id === datasetId);
    if (dataset) {
      onViewDataset(dataset);
    }
    setOpenDropdownId(null);
  };

  const toggleDatasetExpand = (datasetId: string) => {
    setExpandedDatasets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(datasetId)) {
        newSet.delete(datasetId);
      } else {
        newSet.add(datasetId);
      }
      return newSet;
    });
  };

  const handleDatasetClick = (dataset: Dataset) => {
    onSelectDataset(dataset);
    toggleDatasetExpand(dataset.id);
  };

  const handleCreateDataset = async () => {
    if (createDatasetName.trim() && createColumns.length > 0) {
      setIsCreatingDataset(true);
      try {
        const token = await getClerkToken();

        const schema = createColumns.map((col) => ({
          column_name: col.name,
          column_type: col.type.toLowerCase(),
          desc: col.description || undefined,
        }));

        const result = await DatasetService.createDataset(
          createDatasetName.trim(),
          createDatasetDescription,
          schema,
          token
        );

        if (result.success && result.data) {
          useDatasetStore.getState().addDataset(result.data);

          toast.success("Dataset created successfully!", {
            description: `Dataset "${createDatasetName.trim()}" has been created.`,
          });

          setIsCreateDialogOpen(false);
          setIsAddDatasetDialogOpen(false);
          setCreateDatasetName("");
          setCreateDatasetDescription("");
          setCreateColumns([
            {
              name: "id",
              type: "INTEGER",
              nullable: false,
              primaryKey: false,
              description: "",
            },
          ]);
        } else {
          console.error("❌ Create dataset failed:", result);
          toast.error("Failed to create dataset", {
            description:
              result.error || "Please check your input and try again.",
          });
        }
      } catch (error) {
        console.error("Error creating dataset:", error);
        toast.error("Failed to create dataset", {
          description: "An unexpected error occurred. Please try again.",
        });
      } finally {
        setIsCreatingDataset(false);
      }
    }
  };

  const handleAddColumn = () => {
    setCreateColumns([
      ...createColumns,
      {
        name: "",
        type: "VARCHAR(255)",
        nullable: false,
        primaryKey: false,
        description: "",
      },
    ]);
  };

  const handleUpdateColumn = (
    index: number,
    field: keyof Column,
    value: any
  ) => {
    setCreateColumns((prev) =>
      prev.map((col, i) => (i === index ? { ...col, [field]: value } : col))
    );
  };

  const handleRemoveColumn = (index: number) => {
    if (createColumns.length > 1) {
      setCreateColumns((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">Datasets</h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 bg-transparent"
              disabled={isLoading}
              onClick={async () => {
                try {
                  const token = await getClerkToken();
                  if (token) {
                    await useDatasetStore.getState().fetchDatasets(token, true); // Force refresh
                    toast.success("Datasets refreshed successfully");
                  }
                } catch (error) {
                  console.error("Failed to refresh datasets:", error);
                  toast.error("Failed to refresh datasets");
                }
              }}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
            <Dialog
              open={isAddDatasetDialogOpen}
              onOpenChange={setIsAddDatasetDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 bg-transparent"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Dataset
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Add Dataset</DialogTitle>
                  <DialogDescription>
                    Choose how you want to add a new dataset to your database.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  <button
                    onClick={() => {
                      setIsAddDatasetDialogOpen(false);
                      setIsCreateDialogOpen(true);
                    }}
                    className="flex items-center gap-4 p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Database className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-foreground mb-1">
                        Create New Dataset
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Manually define dataset structure and columns
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Create New Dataset</DialogTitle>
                <DialogDescription>
                  Define your dataset structure with columns and data types.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 overflow-y-auto flex-1 px-2">
                <div className="space-y-2">
                  <Label htmlFor="dataset-name">Dataset Name</Label>
                  <Input
                    id="dataset-name"
                    placeholder="e.g., customers, orders, products"
                    value={createDatasetName}
                    onChange={(e) => setCreateDatasetName(e.target.value)}
                    className="font-mono focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataset-description">Description</Label>
                  <Textarea
                    id="dataset-description"
                    placeholder="Describe what this dataset contains..."
                    value={createDatasetDescription}
                    onChange={(e) =>
                      setCreateDatasetDescription(e.target.value)
                    }
                    className="min-h-[60px] resize-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Columns</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddColumn}
                      className="h-7 bg-transparent"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Column
                    </Button>
                  </div>
                  <ScrollArea className="h-[280px] rounded-md border border-border p-3">
                    <div className="space-y-3">
                      {createColumns.map((column, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-secondary/50 space-y-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Column name"
                              value={column.name}
                              onChange={(e) =>
                                handleUpdateColumn(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="flex-1 h-8 font-mono text-sm"
                            />
                            <select
                              value={column.type}
                              onChange={(e) =>
                                handleUpdateColumn(
                                  index,
                                  "type",
                                  e.target.value
                                )
                              }
                              className="h-8 px-2 rounded-md border border-input bg-background text-sm font-mono"
                            >
                              <option value="INTEGER">INTEGER</option>
                              <option value="BIGINT">BIGINT</option>
                              <option value="DOUBLE">DOUBLE</option>
                              <option value="VARCHAR(255)">VARCHAR(255)</option>
                              <option value="TEXT">TEXT</option>
                              <option value="BOOLEAN">BOOLEAN</option>
                              <option value="TIMESTAMP">TIMESTAMP</option>
                              <option value="DECIMAL">DECIMAL</option>
                            </select>
                            {createColumns.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveColumn(index)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <Input
                            placeholder="Column description (optional)"
                            value={column.description}
                            onChange={(e) =>
                              handleUpdateColumn(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreatingDataset}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDataset}
                  disabled={
                    !createDatasetName.trim() ||
                    createColumns.length === 0 ||
                    isCreatingDataset
                  }
                >
                  {isCreatingDataset ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Dataset"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
            DATASETS ({filteredDatasets.length}){" "}
            {isLoading && datasets.length > 0 && (
              <span className="text-primary">• Refreshing...</span>
            )}
          </div>
          <div className="space-y-0.5">
            {isLoading && datasets.length === 0
              ? // Skeleton loading when initially loading
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-4 w-12 rounded ml-auto" />
                    </div>
                  </div>
                ))
              : filteredDatasets.map((dataset) => (
                  <div key={dataset.id}>
                    {renamingDataset === dataset.id ? (
                      <div className="px-2 py-1.5">
                        <Input
                          ref={renameInputRef}
                          value={newDatasetName}
                          onChange={(e) => setNewDatasetName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmRename();
                            if (e.key === "Escape") setRenamingDataset(null);
                          }}
                          onBlur={confirmRename}
                          className="h-7 text-sm font-mono"
                        />
                      </div>
                    ) : (
                      <>
                        <div
                          className={`flex items-center rounded transition-colors group ${
                            selectedDataset?.id === dataset.id
                              ? "bg-primary/10"
                              : "hover:bg-secondary"
                          }`}
                          onMouseEnter={() => setHoveredDataset(dataset.id)}
                          onMouseLeave={() => setHoveredDataset(null)}
                        >
                          <button
                            onClick={() => handleDatasetClick(dataset)}
                            className={`flex-1 flex items-center gap-2 px-2 py-1.5 text-sm transition-colors ${
                              selectedDataset?.id === dataset.id
                                ? "text-primary"
                                : "text-foreground"
                            }`}
                          >
                            {expandedDatasets.has(dataset.id) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <Database className="h-4 w-4 flex-shrink-0" />
                            <span className="font-mono flex-1 text-left">
                              {dataset.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {dataset.rowCount?.toLocaleString() || 0}
                            </span>
                          </button>

                          <DropdownMenu
                            open={openDropdownId === dataset.id}
                            onOpenChange={(open) =>
                              setOpenDropdownId(open ? dataset.id : null)
                            }
                          >
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className={`p-1.5 mr-1 rounded hover:bg-secondary/80 transition-all ${
                                  hoveredDataset === dataset.id ||
                                  openDropdownId === dataset.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              >
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="w-[180px]"
                            >
                              <DropdownMenuItem
                                onClick={() => handleShowInfo(dataset.id)}
                              >
                                <Info className="h-4 w-4" />
                                <span>View Info</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleRename(dataset.id)}
                              >
                                <Edit2 className="h-4 w-4" />
                                <span>Rename</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDelete(dataset.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {expandedDatasets.has(dataset.id) && (
                          <div className="ml-6 mt-1 space-y-0.5">
                            {dataset.data_schema.map((column) => (
                              <div
                                key={column.column_name}
                                className="flex items-center justify-between px-2 py-1 text-xs rounded hover:bg-secondary/50 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  {getDataTypeIcon(column.column_type)}
                                  <span className="font-mono text-foreground">
                                    {column.column_name}
                                  </span>
                                </div>
                                <span className="text-muted-foreground font-mono text-[10px]">
                                  {column.column_type}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
          </div>
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Dataset
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              dataset and all of its data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  {datasetToDelete?.name}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {datasetToDelete?.rowCount?.toLocaleString() || 0} rows
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={isDeletingDataset}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeletingDataset}
            >
              {isDeletingDataset ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Dataset
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
