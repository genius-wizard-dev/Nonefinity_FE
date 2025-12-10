"use client";

import { LogoSpinner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Database,
  File,
  FileText,
  RefreshCw,
  Sparkles,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useEmbeddingActions } from "../../embedding/store";
import {
  useAvailableFiles,
  useCompatibleKnowledgeStores,
  useEmbeddingModels,
  useFetchAvailableFiles,
  useFetchEmbeddingModels,
  useFetchKnowledgeStores,
  useFetchStoresByDimension,
  useLoadingCompatibleStores,
} from "../store";

interface CreateKnowledgeDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateKnowledgeDataDialog({
  open,
  onOpenChange,
}: CreateKnowledgeDataDialogProps) {
  // Use selectors to prevent unnecessary re-renders
  const compatibleStores = useCompatibleKnowledgeStores();
  const embeddingModels = useEmbeddingModels();
  const availableFiles = useAvailableFiles();
  const fetchEmbeddingModels = useFetchEmbeddingModels();
  const fetchAvailableFiles = useFetchAvailableFiles();
  const fetchStoresByDimension = useFetchStoresByDimension();
  const fetchKnowledgeStores = useFetchKnowledgeStores();
  const isLoadingCompatibleStores = useLoadingCompatibleStores();

  // Memoize the onOpenChange callback to prevent unnecessary re-renders
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      onOpenChange(newOpen);
    },
    [onOpenChange]
  );

  const [uploadMethod, setUploadMethod] = useState<"text" | "file">("file");
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Memoize fetch functions to prevent unnecessary re-renders
  const fetchData = useCallback(() => {
    fetchEmbeddingModels();
    fetchAvailableFiles();
  }, [fetchEmbeddingModels, fetchAvailableFiles]);

  // Memoize the selected model to prevent unnecessary re-calculations
  const selectedModelData = useMemo(() => {
    return embeddingModels.find((m) => m.id === selectedModel);
  }, [selectedModel, embeddingModels]);

  // Fetch data when dialog opens
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedModel("");
      setSelectedStore("");
      setSelectedFiles([]);
      setText("");
    }
  }, [open]);

  // Fetch stores when model changes
  useEffect(() => {
    if (selectedModelData?.dimension) {
      // Fetch stores by dimension from API
      fetchStoresByDimension(selectedModelData.dimension);
    }
    // Clear store selection when model changes
    setSelectedStore("");
  }, [selectedModelData, fetchStoresByDimension]);

  // Using compatible stores directly from store
  const filteredStores = compatibleStores;

  const handleFileToggle = useCallback((fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  }, []);

  const { createFileEmbedding, createTextEmbedding } = useEmbeddingActions();

  const handleUpload = useCallback(async () => {
    setIsUploading(true);

    try {
      if (uploadMethod === "text") {
        // Create text embedding task
        await createTextEmbedding({
          text,
          model_id: selectedModel,
          knowledge_store_id: selectedStore || undefined,
        });

        toast.success("Text embedding task created successfully");
      } else {
        // Create file embedding tasks for all selected files
        for (const fileId of selectedFiles) {
          await createFileEmbedding({
            file_id: fileId,
            model_id: selectedModel,
            knowledge_store_id: selectedStore || undefined,
          });
        }

        toast.success(
          `Created ${selectedFiles.length} embedding ${
            selectedFiles.length > 1 ? "tasks" : "task"
          }`
        );
      }

      // Refresh knowledge store data silently without UI flicker
      if (selectedStore) {
        await fetchKnowledgeStores({ background: true });
      }

      // Close modal immediately after success
      handleOpenChange(false);
    } catch (error) {
      console.error("Failed to create embedding:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create embedding"
      );
    } finally {
      setIsUploading(false);
    }
  }, [
    uploadMethod,
    text,
    selectedModel,
    selectedStore,
    selectedFiles,
    createTextEmbedding,
    createFileEmbedding,
    handleOpenChange,
    fetchKnowledgeStores,
  ]);

  // Memoize form validation to prevent unnecessary re-calculations
  const isFormValid = useMemo(() => {
    if (!selectedModel || !selectedStore) return false;

    if (uploadMethod === "text") {
      return text.trim().length > 0;
    } else {
      return selectedFiles.length > 0;
    }
  }, [selectedModel, selectedStore, uploadMethod, text, selectedFiles]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-popover border-border">
        <DialogHeader className="space-y-3 pb-4 border-b border-border/50">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              Upload Vectors
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1.5 leading-relaxed">
              Add new vector embeddings to your knowledge base collections.
              Select an embedding model and a compatible target collection to
              begin.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label
              htmlFor="model"
              className="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              Embedding Model
            </Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Select embedding model" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {embeddingModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name} ({model.dimension}D)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="collection"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Database className="w-4 h-4 text-primary" />
                Target Collection
              </Label>
              {selectedModelData && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    if (selectedModelData?.dimension) {
                      fetchStoresByDimension(selectedModelData.dimension);
                    }
                  }}
                  disabled={isLoadingCompatibleStores}
                  title="Reload collections"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isLoadingCompatibleStores ? "animate-spin" : ""
                    }`}
                  />
                </Button>
              )}
            </div>
            <Select
              value={selectedStore}
              onValueChange={setSelectedStore}
              disabled={!selectedModel || isLoadingCompatibleStores}
            >
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue
                  placeholder={
                    !selectedModel
                      ? "Please select a model first"
                      : "Select knowledge store"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {!selectedModel ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Please select an embedding model first
                  </div>
                ) : isLoadingCompatibleStores ? (
                  <div className="p-3 text-sm text-muted-foreground flex items-center justify-center gap-2 h-20">
                    <LogoSpinner size="sm" />
                    <span className="animate-pulse">
                      Loading collections...
                    </span>
                  </div>
                ) : filteredStores.length > 0 ? (
                  filteredStores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} ({store.dimension}D)
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <p>No compatible stores found.</p>
                    <p className="text-xs mt-1 opacity-70">
                      Create a store with {selectedModelData?.dimension}{" "}
                      dimensions first.
                    </p>
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Upload Method</Label>
            <div className="flex gap-2">
              <Button
                variant={uploadMethod === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setUploadMethod("text")}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Enter Text
              </Button>
              <Button
                variant={uploadMethod === "file" ? "default" : "outline"}
                size="sm"
                onClick={() => setUploadMethod("file")}
                className="flex-1"
              >
                <File className="w-4 h-4 mr-2" />
                Select Files
              </Button>
            </div>
          </div>

          {uploadMethod === "text" ? (
            <div className="space-y-2">
              <Label htmlFor="text" className="text-foreground">
                Text Content
              </Label>
              <Textarea
                id="text"
                placeholder="Enter text to embed..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-32 bg-card border-border text-foreground font-mono text-sm"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <File className="w-4 h-4" />
                    <span>Select files to process:</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {availableFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center space-x-2 p-2 rounded border border-border hover:bg-muted/50"
                      >
                        <Checkbox
                          id={file.id}
                          checked={selectedFiles.includes(file.id)}
                          onCheckedChange={() => handleFileToggle(file.id)}
                        />
                        <label
                          htmlFor={file.id}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{file.name}</span>
                            <span className="text-muted-foreground text-xs">
                              ({file.type})
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  {availableFiles.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <File className="w-8 h-8 mx-auto mb-2" />
                      <p>No files available for processing</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !isFormValid}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Creating..." : "Create Data"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
