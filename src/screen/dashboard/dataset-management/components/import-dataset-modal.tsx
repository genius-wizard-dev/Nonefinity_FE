import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getClerkToken } from "@/consts/endpoint";
import {
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Search,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileService } from "../../file-management/services";
import type { FileItem } from "../../file-management/types";
import { DatasetService } from "../services";
import { useDatasetStore } from "../store";
import {
  normalizeDatasetName,
  validateDatasetName,
} from "../utils/dataset-name-validation";

interface ImportDatasetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDatasetModal({
  open,
  onOpenChange,
}: ImportDatasetModalProps) {
  const [availableFiles, setAvailableFiles] = useState<FileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [importDatasetName, setImportDatasetName] = useState("");
  const [importDatasetDescription, setImportDatasetDescription] = useState("");
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();

  // Load files when dialog opens
  useEffect(() => {
    if (open) {
      loadAvailableFiles();
    } else {
      // Reset state when dialog closes
      setSelectedFile(null);
      setImportDatasetName("");
      setImportDatasetDescription("");
      setFileSearchQuery("");
      setNameError(undefined);
    }
  }, [open]);

  const loadAvailableFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const token = await getClerkToken();
      if (token) {
        const files = await FileService.getAllowConvertFiles(token);
        // Filter for CSV and Excel files only
        const supportedFiles = files.filter((file) => {
          const fileType = file.type?.toLowerCase() || "";
          const fileName = file.name?.toLowerCase() || "";
          const fileExt = file.ext?.toLowerCase() || "";
          return (
            fileType.includes("csv") ||
            fileType.includes("excel") ||
            fileType.includes("spreadsheet") ||
            fileName.endsWith(".csv") ||
            fileName.endsWith(".xlsx") ||
            fileName.endsWith(".xls") ||
            fileExt === ".csv" ||
            fileExt === ".xlsx" ||
            fileExt === ".xls" ||
            fileExt === "csv" ||
            fileExt === "xlsx" ||
            fileExt === "xls"
          );
        });
        setAvailableFiles(supportedFiles);
      }
    } catch (error) {
      console.error("Failed to load files:", error);
      toast.error("Failed to load files");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
    // Auto-generate dataset name from file name
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const normalizedName = normalizeDatasetName(nameWithoutExt);
    setImportDatasetName(normalizedName);
    // Clear error when file is selected
    setNameError(undefined);
  };

  const handleNameChange = (value: string) => {
    setImportDatasetName(value);
    // Validate on change
    const validation = validateDatasetName(value);
    if (!validation.isValid && value.trim()) {
      setNameError(validation.error);
    } else {
      setNameError(undefined);
    }
  };

  const handleImportDataset = async () => {
    if (!selectedFile || !importDatasetName.trim()) return;

    // Final validation
    const validation = validateDatasetName(importDatasetName);
    if (!validation.isValid) {
      setNameError(validation.error);
      return;
    }

    // Close dialog immediately and show converting toast
    onOpenChange(false);
    const fileToImport = selectedFile;
    const datasetName = importDatasetName.trim();
    const description = importDatasetDescription;

    // Reset state
    setSelectedFile(null);
    setImportDatasetName("");
    setImportDatasetDescription("");
    setFileSearchQuery("");
    setNameError(undefined);

    // Show converting toast
    const convertingToastId = toast.loading(
      <div className="w-full">
        <div className="mb-2 text-sm font-medium">
          Converting {fileToImport.name} to dataset...
        </div>
        <div className="text-xs text-muted-foreground">
          This may take a few moments depending on file size
        </div>
      </div>,
      {
        duration: Infinity, // Keep toast until we dismiss it
        className: "border-l-4 border-l-blue-500 bg-background",
      }
    );

    try {
      const token = await getClerkToken();
      if (token) {
        const result = await DatasetService.convertDataset(
          {
            file_id: fileToImport.id,
            dataset_name: datasetName,
            description: description || undefined,
          },
          token
        );

        // Dismiss converting toast
        toast.dismiss(convertingToastId);

        if (result) {
          useDatasetStore.getState().addDataset(result);

          // Fetch updated dataset list
          try {
            await useDatasetStore.getState().fetchDatasets(token, true);
          } catch (fetchError) {
            console.error(
              "Failed to refresh datasets after import:",
              fetchError
            );
          }

          // Show success toast
          toast.success(
            <div className="w-full">
              <div className="mb-2 text-sm font-medium">
                Dataset "{datasetName}" created successfully!
              </div>
              <div className="text-xs text-muted-foreground">
                Converted from {fileToImport.name}
              </div>
            </div>,
            {
              duration: 5000,
              className: "border-l-4 border-l-green-500 bg-background",
            }
          );
        } else {
          toast.error(
            <div className="w-full">
              <div className="mb-2 text-sm font-medium">
                Failed to convert dataset
              </div>
              <div className="text-xs text-muted-foreground">
                Please check your file and try again
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
      console.error("Error importing dataset:", error);

      // Dismiss converting toast
      toast.dismiss(convertingToastId);

      toast.error(
        <div className="w-full">
          <div className="mb-2 text-sm font-medium">Conversion failed</div>
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

  const filteredFiles = availableFiles.filter((file) =>
    file.name.toLowerCase().includes(fileSearchQuery.toLowerCase())
  );

  const nameValidation = validateDatasetName(importDatasetName);
  const isNameValid = nameValidation.isValid || !importDatasetName.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Dataset from File</DialogTitle>
          <DialogDescription>
            Select a CSV or Excel file to convert into a dataset.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          {/* File Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Available Files</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={loadAvailableFiles}
                disabled={isLoadingFiles}
              >
                <RefreshCw
                  className={`h-3 w-3 mr-1 ${
                    isLoadingFiles ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={fileSearchQuery}
                onChange={(e) => setFileSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <ScrollArea className="h-[200px] rounded-md border border-border">
              <div className="p-2">
                {isLoadingFiles ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-2 p-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-4 w-16 rounded ml-auto" />
                      </div>
                    ))}
                  </div>
                ) : filteredFiles.length > 0 ? (
                  <div className="space-y-1">
                    {filteredFiles.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => handleFileSelect(file)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                          selectedFile?.id === file.id
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
                            {file.type} • {(file.size / 1024 / 1024).toFixed(1)}{" "}
                            MB
                          </div>
                        </div>
                        {selectedFile?.id === file.id && (
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

          {/* Dataset Configuration */}
          {selectedFile && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="import-dataset-name">
                  Dataset Name
                  <span className="text-xs text-muted-foreground ml-2">
                    (lowercase, no spaces, use _ to join words)
                  </span>
                </Label>
                <Input
                  id="import-dataset-name"
                  placeholder="e.g., customer_data, orders_2024"
                  value={importDatasetName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`font-mono focus:border-primary focus:ring-1 focus:ring-primary/20 ${
                    nameError ? "border-destructive" : ""
                  }`}
                />
                {nameError && (
                  <p className="text-xs text-destructive mt-1">{nameError}</p>
                )}
                {!nameError && importDatasetName.trim() && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Valid dataset name
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="import-dataset-description">Description</Label>
                <Textarea
                  id="import-dataset-description"
                  placeholder="Describe what this dataset contains..."
                  value={importDatasetDescription}
                  onChange={(e) => setImportDatasetDescription(e.target.value)}
                  className="min-h-[60px] resize-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>

              {/* Selected File Info */}
              <div className="rounded-lg bg-muted p-3 space-y-2">
                <div className="flex items-center gap-2">
                  {selectedFile.type?.includes("excel") ||
                  selectedFile.name?.endsWith(".xlsx") ||
                  selectedFile.name?.endsWith(".xls") ? (
                    <FileSpreadsheet className="h-4 w-4 text-green-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="font-medium text-sm">
                    {selectedFile.name}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedFile.type} •{" "}
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImportDataset}
            disabled={!selectedFile || !isNameValid}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Dataset
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
