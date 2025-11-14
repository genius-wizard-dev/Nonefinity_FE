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
import { File, FileText } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useAvailableFiles,
  useEmbeddingModels,
  useFetchAvailableFiles,
  useFetchEmbeddingModels,
  useFetchKnowledgeStores,
  useFetchStoresByDimension,
  useLoading as useKnowledgeStoreLoading,
  useKnowledgeStores,
} from "../../knowledge-stores/store";
import { useEmbeddingActions, useShowCreateDialog } from "../store";

export function EmbeddingCreateDialog() {
  const open = useShowCreateDialog();
  const { setShowCreateDialog, createFileEmbedding, createTextEmbedding } =
    useEmbeddingActions();

  // Fetch data from knowledge store
  const knowledgeStores = useKnowledgeStores();
  const embeddingModels = useEmbeddingModels();
  const availableFiles = useAvailableFiles();
  const fetchEmbeddingModels = useFetchEmbeddingModels();
  const fetchAvailableFiles = useFetchAvailableFiles();
  const fetchStoresByDimension = useFetchStoresByDimension();
  const fetchKnowledgeStores = useFetchKnowledgeStores();
  const isLoadingStores = useKnowledgeStoreLoading();

  const [uploadMethod, setUploadMethod] = useState<"text" | "file">("file");
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Memoize the selected model
  const selectedModelData = useMemo(() => {
    return embeddingModels.find((m) => m.id === selectedModel);
  }, [selectedModel, embeddingModels]);

  // Fetch data when dialog opens
  useEffect(() => {
    if (open) {
      fetchEmbeddingModels();
      fetchAvailableFiles();
    }
  }, [open, fetchEmbeddingModels, fetchAvailableFiles]);

  // Force refresh files when switching to file upload method
  useEffect(() => {
    if (open && uploadMethod === "file") {
      setIsLoadingFiles(true);
      fetchAvailableFiles().finally(() => {
        setIsLoadingFiles(false);
      });
    }
  }, [open, uploadMethod, fetchAvailableFiles]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedModel("");
      setSelectedStore("");
      setSelectedFiles([]);
      setText("");
      setIsCreating(false);
      setIsLoadingFiles(false);
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

  // Memoize filtered stores
  const filteredStores = useMemo(() => {
    if (!selectedModelData?.dimension) return [];

    return knowledgeStores.filter(
      (store) => store.dimension === selectedModelData.dimension
    );
  }, [selectedModelData, knowledgeStores]);

  const handleFileToggle = useCallback((fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  }, []);

  const handleCreate = useCallback(async () => {
    setIsCreating(true);

    try {
      if (uploadMethod === "text") {
        // Create text embedding
        await createTextEmbedding({
          text,
          model_id: selectedModel,
          knowledge_store_id: selectedStore || undefined,
        });

        toast.success("Text embedding task created successfully");
      } else {
        // Create file embeddings for all selected files
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

      // Refresh knowledge store data
      if (selectedStore) {
        await fetchKnowledgeStores();
      }

      // Close modal immediately after success
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Failed to create embedding:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create embedding"
      );
    } finally {
      setIsCreating(false);
    }
  }, [
    uploadMethod,
    text,
    selectedModel,
    selectedStore,
    selectedFiles,
    createTextEmbedding,
    createFileEmbedding,
    setShowCreateDialog,
    fetchKnowledgeStores,
  ]);

  // Form validation
  const isFormValid = useMemo(() => {
    if (!selectedModel || !selectedStore) return false;
    if (isLoadingFiles) return false;

    if (uploadMethod === "text") {
      return text.trim().length > 0;
    } else {
      return selectedFiles.length > 0;
    }
  }, [
    selectedModel,
    selectedStore,
    uploadMethod,
    text,
    selectedFiles,
    isLoadingFiles,
  ]);

  return (
    <Dialog open={open} onOpenChange={setShowCreateDialog}>
      <DialogContent className="max-w-2xl bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Create Embedding Task
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Generate vector embeddings from text or files
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model" className="text-foreground">
              Embedding Model *
            </Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Select embedding model" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {embeddingModels.length > 0 ? (
                  embeddingModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} ({model.dimension}D)
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    No embedding models available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collection" className="text-foreground">
              Target Knowledge Store
            </Label>
            <Select
              value={selectedStore}
              onValueChange={setSelectedStore}
              disabled={!selectedModel || isLoadingStores}
            >
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue
                  placeholder={
                    !selectedModel
                      ? "Please select a model first"
                      : isLoadingStores
                      ? "Loading stores..."
                      : "Select knowledge store"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {!selectedModel ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Please select an embedding model first
                  </div>
                ) : isLoadingStores ? (
                  <div className="p-2 text-sm text-muted-foreground flex items-center gap-2">
                    <LogoSpinner size="sm" />
                    Loading stores...
                  </div>
                ) : filteredStores.length > 0 ? (
                  filteredStores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} ({store.dimension}D)
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    No stores available for selected model dimension
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <File className="w-4 h-4" />
                      <span>Select files to process:</span>
                    </div>
                  </div>

                  {isLoadingFiles ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <LogoSpinner size="md" />
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {availableFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center space-x-2 p-2 rounded border border-border hover:bg-muted/50 transition-colors"
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
                  )}

                  {!isLoadingFiles && availableFiles.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <File className="w-8 h-8" />
                      </div>
                      <h4 className="font-medium text-foreground mb-2">
                        No Files Available
                      </h4>
                      <p className="text-sm mb-4">
                        No files are available for embedding extraction.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Upload some files first or check if your files are in
                        the correct format.
                      </p>
                    </div>
                  )}

                  {!isLoadingFiles &&
                    availableFiles.length > 0 &&
                    selectedFiles.length > 0 && (
                      <div className="flex items-center justify-between p-2 bg-primary/5 rounded-lg border border-primary/20">
                        <span className="text-sm text-primary font-medium">
                          {selectedFiles.length} file
                          {selectedFiles.length > 1 ? "s" : ""} selected
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFiles([])}
                          className="text-xs h-6 px-2"
                        >
                          Clear Selection
                        </Button>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !isFormValid || isLoadingFiles}
            >
              {isCreating ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
