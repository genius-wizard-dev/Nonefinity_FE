import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Database, Settings } from "lucide-react";
import React from "react";
import type { Dataset } from "../../dataset-management/types";
import type { Model } from "../../models/type";
import type { KnowledgeStore } from "../../knowledge-stores/types";
import type { ChatConfigCreate, ChatConfigUpdate } from "../types";
import { DatasetSelector } from "./dataset-selector";
import { KnowledgeStoreSelector } from "./knowledge-store-selector";
import { ModelSelector } from "./model-selector";

interface ConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  formData: ChatConfigCreate | ChatConfigUpdate;
  onFormDataChange: (data: ChatConfigCreate | ChatConfigUpdate) => void;
  chatModels: Model[];
  embeddingModels: Model[];
  datasets: Dataset[];
  filteredKnowledgeStores: KnowledgeStore[];
  selectedEmbeddingModel: Model | null | undefined;
  modelsLoading: boolean;
  dataLoaded: boolean;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  idPrefix?: string;
  onEmbeddingModelChange?: (value: string | null) => void;
}

export const ConfigDialog: React.FC<ConfigDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  formData,
  onFormDataChange,
  chatModels,
  embeddingModels,
  datasets,
  filteredKnowledgeStores,
  selectedEmbeddingModel,
  modelsLoading,
  dataLoaded,
  submitting,
  onSubmit,
  idPrefix = "",
  onEmbeddingModelChange,
}) => {
  const handleDatasetSelectionChange = (selectedIds: string[]) => {
    onFormDataChange({
      ...formData,
      dataset_ids: selectedIds.length > 0 ? selectedIds : null,
    });
  };

  const handleEmbeddingModelChange = (value: string | null) => {
    onFormDataChange({
      ...formData,
      embedding_model_id: value,
      knowledge_store_id:
        value === null ? null : formData.knowledge_store_id || null,
    });
    if (onEmbeddingModelChange) {
      onEmbeddingModelChange(value);
    }
  };

  // Compact skeleton for loading state
  const LoadingSkeleton = () => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-3xl flex flex-col ${
          !dataLoaded ? "max-h-[60vh]" : "max-h-[90vh]"
        }`}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {!dataLoaded ? (
            <LoadingSkeleton />
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col">
              <Tabs defaultValue="basic" className="flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mb-4 flex-shrink-0">
                  <TabsTrigger value="basic" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="store" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Store
                  </TabsTrigger>
                  <TabsTrigger value="dataset" className="gap-2">
                    <Database className="w-4 h-4" />
                    Dataset
                  </TabsTrigger>
                </TabsList>

                <div className="overflow-y-auto">
                  <TabsContent value="basic" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor={`${idPrefix}name`}>Name *</Label>
                      <Input
                        id={`${idPrefix}name`}
                        value={formData.name}
                        onChange={(e) =>
                          onFormDataChange({ ...formData, name: e.target.value })
                        }
                        placeholder="My Chat Config"
                        required
                      />
                    </div>

                    <ModelSelector
                      label="Chat Model *"
                      value={formData.chat_model_id || null}
                      onChange={(value) =>
                        onFormDataChange({
                          ...formData,
                          chat_model_id: value || "",
                        })
                      }
                      models={chatModels}
                      loading={modelsLoading}
                      required
                      placeholder="Select chat model"
                      id={`${idPrefix}chat_model`}
                    />

                    <div className="space-y-2">
                      <Label htmlFor={`${idPrefix}instruction_prompt`}>
                        Instruction Prompt (Optional)
                      </Label>
                      <Textarea
                        id={`${idPrefix}instruction_prompt`}
                        value={formData.instruction_prompt || ""}
                        onChange={(e) =>
                          onFormDataChange({
                            ...formData,
                            instruction_prompt: e.target.value,
                          })
                        }
                        placeholder="Custom instructions for the AI..."
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="store" className="space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <ModelSelector
                        label="Embedding Model (Optional)"
                        value={formData.embedding_model_id || null}
                        onChange={handleEmbeddingModelChange}
                        models={embeddingModels}
                        loading={modelsLoading}
                        placeholder="Select embedding model (optional)"
                        id={`${idPrefix}embedding_model`}
                        allowNone
                      />

                      <KnowledgeStoreSelector
                        value={formData.knowledge_store_id || null}
                        onChange={(value) =>
                          onFormDataChange({
                            ...formData,
                            knowledge_store_id: value,
                          })
                        }
                        stores={filteredKnowledgeStores}
                        loading={modelsLoading}
                        disabled={!formData.embedding_model_id}
                        id={`${idPrefix}knowledge_store`}
                        selectedEmbeddingModel={selectedEmbeddingModel}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="dataset" className="space-y-4 mt-0">
                    <DatasetSelector
                      datasets={datasets}
                      selectedIds={formData.dataset_ids || null}
                      onSelectionChange={handleDatasetSelectionChange}
                      loading={modelsLoading}
                      idPrefix={`${idPrefix}dataset`}
                    />
                  </TabsContent>
                </div>
              </Tabs>

              <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !formData.name || !formData.chat_model_id}
                >
                  {submitting ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

