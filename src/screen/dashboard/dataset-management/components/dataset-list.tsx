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
  FileSpreadsheet,
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
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FileService } from "../../file-management/services";
import type { FileItem } from "../../file-management/types";
import { DatasetService } from "../services";
import { useDatasetStore } from "../store";
import type { Column, Dataset } from "../types";
import { validateDatasetName } from "../utils/dataset-name-validation";
import { ImportDatasetModal } from "./import-dataset-modal";

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
  const [createNameError, setCreateNameError] = useState<string | undefined>();
  const [createColumns, setCreateColumns] = useState<Column[]>([
    {
      name: "id",
      type: "INTEGER",
      nullable: false,
      primaryKey: false,
      description: "",
    },
  ]);

  // Import from file states
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Insert data states
  const [isInsertDataDialogOpen, setIsInsertDataDialogOpen] = useState(false);
  const [insertDataFiles, setInsertDataFiles] = useState<FileItem[]>([]);
  const [isLoadingInsertFiles, setIsLoadingInsertFiles] = useState(false);
  const [selectedInsertFile, setSelectedInsertFile] = useState<FileItem | null>(
    null
  );
  const [insertFileSearchQuery, setInsertFileSearchQuery] = useState("");
  const [targetDataset, setTargetDataset] = useState<Dataset | null>(null);
  const [loadingSchemas, setLoadingSchemas] = useState<Set<string>>(new Set());

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
        const { deleteDataset } = useDatasetStore.getState();
        const success = await deleteDataset(datasetToDelete.id, token);

        if (success) {
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

  const handleFetchSchema = async (datasetId: string) => {
    try {
      setLoadingSchemas((prev) => new Set(prev).add(datasetId));
      const token = await getClerkToken();
      if (token) {
        const { fetchDatasetSchema } = useDatasetStore.getState();
        await fetchDatasetSchema(datasetId, token);
        toast.success("Schema refreshed successfully");
      }
    } catch (error) {
      console.error("Failed to fetch schema:", error);
      toast.error("Failed to fetch schema");
    } finally {
      setLoadingSchemas((prev) => {
        const newSet = new Set(prev);
        newSet.delete(datasetId);
        return newSet;
      });
    }
    setOpenDropdownId(null);
  };

  const toggleDatasetExpand = async (datasetId: string) => {
    const dataset = datasets.find((d) => d.id === datasetId);
    if (!dataset) return;

    const isExpanding = !expandedDatasets.has(datasetId);

    // If expanding and schema is not loaded, fetch it
    if (isExpanding && (!dataset.data_schema || dataset.data_schema.length === 0)) {
      try {
        setLoadingSchemas((prev) => new Set(prev).add(datasetId));
        const token = await getClerkToken();
        if (token) {
          const { fetchDatasetSchema } = useDatasetStore.getState();
          await fetchDatasetSchema(datasetId, token);
        }
      } catch (error) {
        console.error("Failed to fetch schema:", error);
        toast.error("Failed to fetch schema");
      } finally {
        setLoadingSchemas((prev) => {
          const newSet = new Set(prev);
          newSet.delete(datasetId);
          return newSet;
        });
      }
    }

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

  const handleCreateNameChange = (value: string) => {
    setCreateDatasetName(value);
    // Validate on change
    const validation = validateDatasetName(value);
    if (!validation.isValid && value.trim()) {
      setCreateNameError(validation.error);
    } else {
      setCreateNameError(undefined);
    }
  };

  const handleCreateDataset = async () => {
    if (!createDatasetName.trim() || createColumns.length === 0) return;

    // Final validation
    const validation = validateDatasetName(createDatasetName);
    if (!validation.isValid) {
      setCreateNameError(validation.error);
      return;
    }

    setIsCreatingDataset(true);
    try {
      const token = await getClerkToken();

      const data_schema = createColumns.map((col) => ({
        column_name: col.name,
        column_type: col.type.toLowerCase(),
        desc: col.description || undefined,
      }));

      const result = await DatasetService.createDataset(
        createDatasetName.trim(),
        createDatasetDescription,
        data_schema,
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
        setCreateNameError(undefined);
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
          description: result.error || "Please check your input and try again.",
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
  };

  const handleAddColumn = () => {
    setCreateColumns([
      ...createColumns,
      {
        name: "",
        type: "VARCHAR",
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

  // Insert data functions
  const loadInsertDataFiles = async () => {
    setIsLoadingInsertFiles(true);
    try {
      const token = await getClerkToken();
      if (token) {
        const files = await FileService.getFiles(token);
        // Filter for CSV and Excel files only (same as import)
        const supportedFiles = files.filter((file) => {
          const fileType = file.type?.toLowerCase() || "";
          const fileName = file.name?.toLowerCase() || "";
          return (
            fileType.includes("csv") ||
            fileType.includes("excel") ||
            fileType.includes("spreadsheet") ||
            fileName.endsWith(".csv") ||
            fileName.endsWith(".xlsx") ||
            fileName.endsWith(".xls")
          );
        });
        setInsertDataFiles(supportedFiles);
      }
    } catch (error) {
      console.error("Failed to load files for insert data:", error);
      toast.error("Failed to load files");
    } finally {
      setIsLoadingInsertFiles(false);
    }
  };

  const handleInsertData = (dataset: Dataset) => {
    setTargetDataset(dataset);
    setIsInsertDataDialogOpen(true);
    loadInsertDataFiles();
  };

  const handleInsertFileSelect = (file: FileItem) => {
    setSelectedInsertFile(file);
  };

  const handleInsertDataConfirm = async () => {
    if (!selectedInsertFile || !targetDataset) return;

    // Close dialog immediately and show inserting toast
    setIsInsertDataDialogOpen(false);
    setSelectedInsertFile(null);
    setInsertFileSearchQuery("");

    // Show inserting toast
    const insertingToastId = toast.loading(
      <div className="w-full">
        <div className="mb-2 text-sm font-medium">
          Inserting data from {selectedInsertFile.name} into{" "}
          {targetDataset.name}...
        </div>
        <div className="text-xs text-muted-foreground">
          This may take a few moments depending on data size
        </div>
      </div>,
      {
        duration: Infinity,
        className: "border-l-4 border-l-blue-500 bg-background",
      }
    );

    try {
      const token = await getClerkToken();
      if (token) {
        // Call API to insert data from file to dataset
        const result = await DatasetService.insertDataFromFile(
          targetDataset.id,
          selectedInsertFile.id,
          token
        );

        // Dismiss inserting toast
        toast.dismiss(insertingToastId);

        if (result.success) {
          // Show success toast
          toast.success(
            <div className="w-full">
              <div className="mb-2 text-sm font-medium">
                Data inserted successfully into "{targetDataset.name}"!
              </div>
              <div className="text-xs text-muted-foreground">
                {result.data?.rows_inserted || 0} rows added from{" "}
                {selectedInsertFile.name}
              </div>
            </div>,
            {
              duration: 5000,
              className: "border-l-4 border-l-green-500 bg-background",
            }
          );

          // Refresh dataset list
          try {
            await useDatasetStore.getState().fetchDatasets(token, true);
          } catch (fetchError) {
            console.error(
              "Failed to refresh datasets after insert:",
              fetchError
            );
          }
        } else {
          toast.error(
            <div className="w-full">
              <div className="mb-2 text-sm font-medium">
                Failed to insert data
              </div>
              <div className="text-xs text-muted-foreground">
                {result.error || "Please check your file and try again"}
              </div>
            </div>,
            {
              duration: 5000,
              className: "border-l-4 border-l-red-500 bg-background",
            }
          );
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);

      // Dismiss inserting toast
      toast.dismiss(insertingToastId);

      toast.error(
        <div className="w-full">
          <div className="mb-2 text-sm font-medium">Insert data failed</div>
          <div className="text-xs text-muted-foreground">
            An unexpected error occurred. Please try again.
          </div>
        </div>,
        {
          duration: 5000,
          className: "border-l-4 border-l-red-500 bg-background",
        }
      );
    }
  };

  const filteredInsertFiles = insertDataFiles.filter((file) =>
    file.name.toLowerCase().includes(insertFileSearchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      {/* Header Section */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Datasets</h2>
            <span className="text-sm text-muted-foreground">
              ({filteredDatasets.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-secondary"
              disabled={isLoading}
              onClick={async () => {
                try {
                  const token = await getClerkToken();
                  if (token) {
                    await useDatasetStore.getState().fetchDatasets(token, true);
                    toast.success("Datasets refreshed successfully");
                  }
                } catch (error) {
                  console.error("Failed to refresh datasets:", error);
                  toast.error("Failed to refresh datasets");
                }
              }}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
            <Dialog
              open={isAddDatasetDialogOpen}
              onOpenChange={setIsAddDatasetDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="h-8 gap-2 bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Add Dataset
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Add Dataset</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Choose how you want to add a new dataset to your database.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-6">
                  <button
                    onClick={() => {
                      setIsAddDatasetDialogOpen(false);
                      setIsCreateDialogOpen(true);
                    }}
                    className="flex items-center gap-4 p-5 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 group hover:shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Database className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-foreground mb-2 text-base">
                        Create New Dataset
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        Manually define dataset structure and columns
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>

                  <button
                    onClick={() => {
                      setIsAddDatasetDialogOpen(false);
                      setIsImportDialogOpen(true);
                    }}
                    className="flex items-center gap-4 p-5 rounded-xl border-2 border-border hover:border-green-500 hover:bg-green-500/5 transition-all duration-200 group hover:shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                      <Upload className="h-7 w-7 text-green-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-foreground mb-2 text-base">
                        Import from File
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        Convert CSV or Excel files to datasets
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
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
                  <Label htmlFor="dataset-name">
                    Dataset Name
                    <span className="text-xs text-muted-foreground ml-2">
                      (lowercase, no spaces, use _ to join words)
                    </span>
                  </Label>
                  <Input
                    id="dataset-name"
                    placeholder="e.g., customer_data, orders_2024"
                    value={createDatasetName}
                    onChange={(e) => handleCreateNameChange(e.target.value)}
                    className={`font-mono focus:border-primary focus:ring-1 focus:ring-primary/20 ${
                      createNameError ? "border-destructive" : ""
                    }`}
                  />
                  {createNameError && (
                    <p className="text-xs text-destructive mt-1">
                      {createNameError}
                    </p>
                  )}
                  {!createNameError && createDatasetName.trim() && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Valid dataset name
                    </p>
                  )}
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
                              <option value="VARCHAR">VARCHAR</option>
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
                    isCreatingDataset ||
                    !!createNameError
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

          {/* Import from File Dialog */}
          <ImportDatasetModal
            open={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
          />

          {/* Insert Data Dialog */}
          <Dialog
            open={isInsertDataDialogOpen}
            onOpenChange={setIsInsertDataDialogOpen}
          >
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Insert Data into Dataset</DialogTitle>
                <DialogDescription>
                  Select a CSV or Excel file to insert data into "
                  {targetDataset?.name}".
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 overflow-y-auto flex-1">
                {/* File Selection */}
                <div className="space-y-2">
                  <Label>Available Files</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search files..."
                      value={insertFileSearchQuery}
                      onChange={(e) => setInsertFileSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>

                  <ScrollArea className="h-[200px] rounded-md border border-border">
                    <div className="p-2">
                      {isLoadingInsertFiles ? (
                        <div className="space-y-2">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2"
                            >
                              <Skeleton className="h-4 w-4 rounded" />
                              <Skeleton className="h-4 w-32 rounded" />
                              <Skeleton className="h-4 w-16 rounded ml-auto" />
                            </div>
                          ))}
                        </div>
                      ) : filteredInsertFiles.length > 0 ? (
                        <div className="space-y-1">
                          {filteredInsertFiles.map((file) => (
                            <button
                              key={file.id}
                              onClick={() => handleInsertFileSelect(file)}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                                selectedInsertFile?.id === file.id
                                  ? "bg-primary/10 border border-primary/20"
                                  : "hover:bg-secondary"
                              }`}
                            >
                              <div className="flex-shrink-0">
                                {file.type?.includes("excel") ||
                                file.name?.endsWith(".xlsx") ||
                                file.name?.endsWith(".xls") ? (
                                  <FileSpreadsheet className="h-4 w-4 text-green-500" />
                                ) : (
                                  <FileText className="h-4 w-4 text-blue-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {file.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {file.type} •{" "}
                                  {(file.size / 1024 / 1024).toFixed(1)} MB
                                </div>
                              </div>
                              {selectedInsertFile?.id === file.id && (
                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No CSV or Excel files found</p>
                          <p className="text-xs">
                            Upload files first in the File Management section
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Selected File Info */}
                {selectedInsertFile && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="rounded-lg bg-muted p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        {selectedInsertFile.type?.includes("excel") ||
                        selectedInsertFile.name?.endsWith(".xlsx") ||
                        selectedInsertFile.name?.endsWith(".xls") ? (
                          <FileSpreadsheet className="h-4 w-4 text-green-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-blue-500" />
                        )}
                        <span className="font-medium text-sm">
                          {selectedInsertFile.name}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedInsertFile.type} •{" "}
                        {(selectedInsertFile.size / 1024 / 1024).toFixed(1)} MB
                      </div>
                    </div>

                    {/* Target Dataset Info */}
                    {targetDataset && (
                      <div className="rounded-lg bg-primary/5 p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">
                            Target Dataset: {targetDataset.name}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {targetDataset.rowCount?.toLocaleString() || 0} rows •{" "}
                          {targetDataset.data_schema.length} columns
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsInsertDataDialogOpen(false);
                    setSelectedInsertFile(null);
                    setInsertFileSearchQuery("");
                    setTargetDataset(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInsertDataConfirm}
                  disabled={!selectedInsertFile}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Insert Data
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Section */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Dataset List */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-muted-foreground">
              {filteredDatasets.length} dataset
              {filteredDatasets.length !== 1 ? "s" : ""}
            </div>
            {isLoading && datasets.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Refreshing...
              </div>
            )}
          </div>
          <div className="space-y-1">
            {isLoading && datasets.length === 0
              ? // Skeleton loading when initially loading
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-4 w-16 rounded ml-auto" />
                    </div>
                  </div>
                ))
              : filteredDatasets.map((dataset) => (
                  <div key={dataset.id}>
                    {renamingDataset === dataset.id ? (
                      <div className="p-3 rounded-lg border border-border bg-card">
                        <Input
                          ref={renameInputRef}
                          value={newDatasetName}
                          onChange={(e) => setNewDatasetName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmRename();
                            if (e.key === "Escape") setRenamingDataset(null);
                          }}
                          onBlur={confirmRename}
                          className="h-8 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    ) : (
                      <>
                        <div
                          className={`flex items-center rounded-lg border transition-all duration-200 group ${
                            selectedDataset?.id === dataset.id
                              ? "bg-primary/5 border-primary/20 shadow-sm"
                              : "bg-card border-border hover:border-primary/30 hover:shadow-sm"
                          }`}
                          onMouseEnter={() => setHoveredDataset(dataset.id)}
                          onMouseLeave={() => setHoveredDataset(null)}
                        >
                          <button
                            onClick={() => handleDatasetClick(dataset)}
                            className={`flex-1 flex items-center gap-3 p-3 text-sm transition-colors ${
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
                            <Database className="h-5 w-5 flex-shrink-0 text-primary" />
                            <div className="flex-1 text-left">
                              <div className="font-medium">{dataset.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {dataset.rowCount !== undefined
                                  ? `${dataset.rowCount.toLocaleString()} rows`
                                  : "Click to load details"}
                              </div>
                            </div>
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
                                className={`p-2 mr-2 rounded-md hover:bg-secondary/80 transition-all ${
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
                              className="w-[200px]"
                            >
                              <DropdownMenuItem
                                onClick={() => handleShowInfo(dataset.id)}
                              >
                                <Info className="h-4 w-4" />
                                <span>View Info</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleFetchSchema(dataset.id)}
                                disabled={loadingSchemas.has(dataset.id)}
                              >
                                {loadingSchemas.has(dataset.id) ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                                <span>Fetch Schema</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleInsertData(dataset)}
                              >
                                <Upload className="h-4 w-4" />
                                <span>Insert Data</span>
                              </DropdownMenuItem>
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
                          <div className="ml-8 mt-2 space-y-1 border-l border-border/50 pl-4">
                            {loadingSchemas.has(dataset.id) ? (
                              <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                <span>Loading schema...</span>
                              </div>
                            ) : dataset.data_schema && dataset.data_schema.length > 0 ? (
                              dataset.data_schema.map((column) => (
                                <div
                                  key={column.column_name}
                                  className="flex items-center justify-between px-3 py-2 text-xs rounded-md hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50"
                                >
                                  <div className="flex items-center gap-2">
                                    {getDataTypeIcon(column.column_type)}
                                    <span className="font-medium text-foreground">
                                      {column.column_name}
                                    </span>
                                  </div>
                                  <span className="text-muted-foreground font-mono text-[11px] bg-secondary/30 px-2 py-0.5 rounded">
                                    {column.column_type}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-xs text-muted-foreground">
                                No schema available. Click "Fetch Schema" to load.
                              </div>
                            )}
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
