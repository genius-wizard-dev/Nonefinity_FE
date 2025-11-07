import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  BookOpen,
  Check,
  Cloud,
  Copy,
  Database,
  Edit,
  MessageSquare,
  Settings,
  Trash2,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DatasetService } from "../../dataset-management/services";
import type { Dataset } from "../../dataset-management/types";
import {
  useFetchStoresByDimension,
  useKnowledgeStores,
} from "../../knowledge-stores/store";
import { ModelService } from "../../models/service";
import type { Model } from "../../models/type";
import { useChatStore } from "../store";
import type { ChatConfig, ChatConfigCreate, ChatConfigUpdate } from "../types";
import { DatasetSelector } from "./dataset-selector";
import { IntegrationsSelector } from "./integrations-selector";
import { KnowledgeStoreSelector } from "./knowledge-store-selector";
import { ModelSelector } from "./model-selector";

interface CreateConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateConfigDialog: React.FC<CreateConfigDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { createConfig } = useChatStore();
  const [formData, setFormData] = useState<ChatConfigCreate>({
    name: "",
    chat_model_id: "",
    embedding_model_id: null,
    knowledge_store_id: null,
    dataset_ids: null,
    instruction_prompt: "",
    integrations: null,
  });
  const [chatModels, setChatModels] = useState<Model[]>([]);
  const [embeddingModels, setEmbeddingModels] = useState<Model[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Use knowledge store store hooks
  const knowledgeStores = useKnowledgeStores();
  const fetchStoresByDimension = useFetchStoresByDimension();

  // Get selected embedding model data
  const selectedEmbeddingModel = useMemo(() => {
    if (!formData.embedding_model_id) return null;
    return embeddingModels.find((m) => m.id === formData.embedding_model_id);
  }, [formData.embedding_model_id, embeddingModels]);

  // Filter knowledge stores by dimension of selected embedding model
  const filteredKnowledgeStores = useMemo(() => {
    if (!selectedEmbeddingModel?.dimension) return [];
    return knowledgeStores.filter(
      (store) => store.dimension === selectedEmbeddingModel.dimension
    );
  }, [selectedEmbeddingModel, knowledgeStores]);

  useEffect(() => {
    if (open) {
      setDataLoaded(false);
      setModelsLoading(true);
      setFormData({
        name: "",
        chat_model_id: "",
        embedding_model_id: null,
        knowledge_store_id: null,
        dataset_ids: null,
        instruction_prompt: "",
        integrations: null,
      });
      loadModelsAndStores();
    } else if (!open) {
      // Reset when dialog closes
      setDataLoaded(false);
      setModelsLoading(true);
    }
  }, [open]);

  const loadModelsAndStores = async () => {
    setModelsLoading(true);
    try {
      const [chatModelsData, embeddingModelsData, datasetsData] =
        await Promise.all([
          ModelService.listModels({ type: "chat", active_only: true }),
          ModelService.listModels({ type: "embedding", active_only: true }),
          DatasetService.getDatasets(1, 100),
        ]);

      if (chatModelsData) {
        setChatModels(chatModelsData.models || []);
      }
      if (embeddingModelsData) {
        setEmbeddingModels(embeddingModelsData.models || []);
      }
      if (datasetsData) {
        setDatasets(datasetsData || []);
      }
    } catch (error) {
      console.error("Failed to load models/datasets:", error);
    } finally {
      setModelsLoading(false);
      setDataLoaded(true);
    }
  };

  // Fetch stores by dimension when embedding model changes
  useEffect(() => {
    if (selectedEmbeddingModel?.dimension) {
      fetchStoresByDimension(selectedEmbeddingModel.dimension);
    }
  }, [selectedEmbeddingModel?.dimension, fetchStoresByDimension]);

  // Clear knowledge store selection when filtered stores don't include current selection
  useEffect(() => {
    if (
      formData.embedding_model_id &&
      formData.knowledge_store_id &&
      filteredKnowledgeStores.length > 0 &&
      !filteredKnowledgeStores.some(
        (store) => store.id === formData.knowledge_store_id
      )
    ) {
      setFormData((prev) => ({ ...prev, knowledge_store_id: null }));
    }
  }, [
    filteredKnowledgeStores,
    formData.embedding_model_id,
    formData.knowledge_store_id,
  ]);

  const handleDatasetSelectionChange = useCallback((selectedIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      dataset_ids: selectedIds.length > 0 ? selectedIds : null,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.chat_model_id) {
      return;
    }

    // Validate: if embedding_model_id is set, knowledge_store_id must be set too
    if (formData.embedding_model_id && !formData.knowledge_store_id) {
      alert("Knowledge store is required when embedding model is selected");
      return;
    }

    if (formData.knowledge_store_id && !formData.embedding_model_id) {
      alert("Embedding model is required when knowledge store is selected");
      return;
    }

    setSubmitting(true);
    try {
      const config = await createConfig({
        ...formData,
        embedding_model_id: formData.embedding_model_id || null,
        knowledge_store_id: formData.knowledge_store_id || null,
        dataset_ids:
          formData.dataset_ids && formData.dataset_ids.length > 0
            ? formData.dataset_ids
            : null,
        instruction_prompt: formData.instruction_prompt || "",
      });

      if (config) {
        // Update store directly without refetching (no UI flicker)
        // Store already updated via createConfig action
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to create config:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Create Chat Config</DialogTitle>
          <DialogDescription>
            Configure a new chat configuration with AI model and optional
            knowledge store
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {!dataLoaded ? (
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
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <Tabs
                defaultValue="basic"
                className="flex flex-col flex-1 min-h-0"
              >
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="basic" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="integrate" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Integrate
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

                <div className="flex-1 overflow-y-auto min-h-0">
                  <TabsContent value="basic" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="My Chat Config"
                        required
                      />
                    </div>

                    <ModelSelector
                      label="Chat Model *"
                      value={formData.chat_model_id || null}
                      onChange={(value) =>
                        setFormData({ ...formData, chat_model_id: value || "" })
                      }
                      models={chatModels}
                      loading={modelsLoading}
                      required
                      placeholder="Select chat model"
                      id="chat_model"
                    />

                    <div className="space-y-2">
                      <Label htmlFor="instruction_prompt">
                        Instruction Prompt (Optional)
                      </Label>
                      <Textarea
                        id="instruction_prompt"
                        value={formData.instruction_prompt || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            instruction_prompt: e.target.value,
                          })
                        }
                        placeholder="Custom instructions for the AI..."
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="integrate" className="space-y-4 mt-0">
                    <IntegrationsSelector
                      value={formData.integrations || null}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          integrations: value,
                        }));
                      }}
                      loading={modelsLoading}
                    />
                  </TabsContent>

                  <TabsContent value="store" className="space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <ModelSelector
                        label="Embedding Model (Optional)"
                        value={formData.embedding_model_id || null}
                        onChange={(value) => {
                          setFormData({
                            ...formData,
                            embedding_model_id: value,
                            knowledge_store_id:
                              value === null
                                ? null
                                : formData.knowledge_store_id || null,
                          });
                        }}
                        models={embeddingModels}
                        loading={modelsLoading}
                        placeholder="Select embedding model (optional)"
                        id="embedding_model"
                        allowNone
                      />

                      <KnowledgeStoreSelector
                        value={formData.knowledge_store_id || null}
                        onChange={(value) =>
                          setFormData({
                            ...formData,
                            knowledge_store_id: value,
                          })
                        }
                        stores={filteredKnowledgeStores}
                        loading={modelsLoading}
                        disabled={!formData.embedding_model_id}
                        id="knowledge_store"
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
                      idPrefix="dataset"
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
                <Button type="submit" disabled={submitting || !formData.name}>
                  {submitting ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface EditConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ChatConfig | null;
}

export const EditConfigDialog: React.FC<EditConfigDialogProps> = ({
  open,
  onOpenChange,
  config,
}) => {
  const { updateConfig } = useChatStore();
  const [formData, setFormData] = useState<ChatConfigUpdate>({
    name: "",
    chat_model_id: "",
    embedding_model_id: null,
    knowledge_store_id: null,
    dataset_ids: null,
    instruction_prompt: "",
    integrations: null,
  });
  const [chatModels, setChatModels] = useState<Model[]>([]);
  const [embeddingModels, setEmbeddingModels] = useState<Model[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Use knowledge store store hooks
  const knowledgeStores = useKnowledgeStores();
  const fetchStoresByDimension = useFetchStoresByDimension();

  // Get selected embedding model data
  const selectedEmbeddingModel = useMemo(() => {
    if (!formData.embedding_model_id) return null;
    return embeddingModels.find((m) => m.id === formData.embedding_model_id);
  }, [formData.embedding_model_id, embeddingModels]);

  // Filter knowledge stores by dimension of selected embedding model
  const filteredKnowledgeStores = useMemo(() => {
    if (!selectedEmbeddingModel?.dimension) return [];
    return knowledgeStores.filter(
      (store) => store.dimension === selectedEmbeddingModel.dimension
    );
  }, [selectedEmbeddingModel, knowledgeStores]);

  useEffect(() => {
    if (open && config) {
      setDataLoaded(false);
      setModelsLoading(true);
      setFormData({
        name: config.name,
        chat_model_id: config.chat_model_id,
        embedding_model_id: config.embedding_model_id || null,
        knowledge_store_id: config.knowledge_store_id || null,
        dataset_ids: config.dataset_ids || null,
        instruction_prompt: config.instruction_prompt || "",
        integrations: config.integrations || null,
      });
      loadModelsAndStores();
    } else if (!open) {
      // Reset when dialog closes
      setDataLoaded(false);
      setModelsLoading(true);
    }
  }, [open, config]);

  const loadModelsAndStores = async () => {
    setModelsLoading(true);
    try {
      const [chatModelsData, embeddingModelsData, datasetsData] =
        await Promise.all([
          ModelService.listModels({ type: "chat", active_only: true }),
          ModelService.listModels({ type: "embedding", active_only: true }),
          DatasetService.getDatasets(1, 100),
        ]);

      if (chatModelsData) {
        setChatModels(chatModelsData.models || []);
      }
      if (embeddingModelsData) {
        setEmbeddingModels(embeddingModelsData.models || []);
      }
      if (datasetsData) {
        setDatasets(datasetsData || []);
      }
    } catch (error) {
      console.error("Failed to load models/datasets:", error);
    } finally {
      setModelsLoading(false);
      setDataLoaded(true);
    }
  };

  // Fetch stores by dimension when embedding model changes
  useEffect(() => {
    if (selectedEmbeddingModel?.dimension) {
      fetchStoresByDimension(selectedEmbeddingModel.dimension);
    }
  }, [selectedEmbeddingModel?.dimension, fetchStoresByDimension]);

  // Clear knowledge store selection when filtered stores don't include current selection
  useEffect(() => {
    if (
      formData.embedding_model_id &&
      formData.knowledge_store_id &&
      filteredKnowledgeStores.length > 0 &&
      !filteredKnowledgeStores.some(
        (store) => store.id === formData.knowledge_store_id
      )
    ) {
      setFormData((prev) => ({ ...prev, knowledge_store_id: null }));
    }
  }, [
    filteredKnowledgeStores,
    formData.embedding_model_id,
    formData.knowledge_store_id,
  ]);

  const handleDatasetSelectionChange = useCallback((selectedIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      dataset_ids: selectedIds.length > 0 ? selectedIds : null,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !formData.name || !formData.chat_model_id) {
      return;
    }

    // Validate: if embedding_model_id is set, knowledge_store_id must be set too
    if (formData.embedding_model_id && !formData.knowledge_store_id) {
      alert("Knowledge store is required when embedding model is selected");
      return;
    }

    if (formData.knowledge_store_id && !formData.embedding_model_id) {
      alert("Embedding model is required when knowledge store is selected");
      return;
    }

    setSubmitting(true);
    try {
      const updatedConfig = await updateConfig(config.id, {
        ...formData,
        embedding_model_id: formData.embedding_model_id || null,
        knowledge_store_id: formData.knowledge_store_id || null,
        dataset_ids:
          formData.dataset_ids && formData.dataset_ids.length > 0
            ? formData.dataset_ids
            : null,
        instruction_prompt: formData.instruction_prompt || "",
      });

      if (updatedConfig) {
        // Update store directly without refetching (no UI flicker)
        // Store already updated via updateConfig action
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to update config:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!config) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Chat Config</DialogTitle>
          <DialogDescription>
            Update the chat configuration settings
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {!dataLoaded ? (
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
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <Tabs
                defaultValue="basic"
                className="flex flex-col flex-1 min-h-0"
              >
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="basic" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="integrate" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Integrate
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

                <div className="flex-1 overflow-y-auto min-h-0">
                  <TabsContent value="basic" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Name *</Label>
                      <Input
                        id="edit-name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="My Chat Config"
                        required
                      />
                    </div>

                    <ModelSelector
                      label="Chat Model *"
                      value={formData.chat_model_id || null}
                      onChange={(value) =>
                        setFormData({ ...formData, chat_model_id: value || "" })
                      }
                      models={chatModels}
                      loading={modelsLoading}
                      required
                      placeholder="Select chat model"
                      id="edit-chat_model"
                    />

                    <div className="space-y-2">
                      <Label htmlFor="edit-instruction_prompt">
                        Instruction Prompt (Optional)
                      </Label>
                      <Textarea
                        id="edit-instruction_prompt"
                        value={formData.instruction_prompt || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            instruction_prompt: e.target.value,
                          })
                        }
                        placeholder="Custom instructions for the AI..."
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="integrate" className="space-y-4 mt-0">
                    <IntegrationsSelector
                      value={formData.integrations || null}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          integrations: value,
                        }));
                      }}
                      loading={modelsLoading}
                    />
                  </TabsContent>

                  <TabsContent value="store" className="space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <ModelSelector
                        label="Embedding Model (Optional)"
                        value={formData.embedding_model_id || null}
                        onChange={(value) => {
                          setFormData({
                            ...formData,
                            embedding_model_id: value,
                            knowledge_store_id:
                              value === null
                                ? null
                                : formData.knowledge_store_id || null,
                          });
                        }}
                        models={embeddingModels}
                        loading={modelsLoading}
                        placeholder="Select embedding model (optional)"
                        id="edit-embedding_model"
                        allowNone
                      />

                      <KnowledgeStoreSelector
                        value={formData.knowledge_store_id || null}
                        onChange={(value) =>
                          setFormData({
                            ...formData,
                            knowledge_store_id: value,
                          })
                        }
                        stores={filteredKnowledgeStores}
                        loading={modelsLoading}
                        disabled={!formData.embedding_model_id}
                        id="edit-knowledge_store"
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
                      idPrefix="edit-dataset"
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
                <Button type="submit" disabled={submitting || !formData.name}>
                  {submitting ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ConfigCardProps {
  config: ChatConfig;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ConfigCard: React.FC<ConfigCardProps> = ({
  config,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyIdAlias = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (config.id_alias) {
      try {
        await navigator.clipboard.writeText(config.id_alias);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{config.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={config.is_used}
              title={
                config.is_used
                  ? "Cannot delete: config is being used by sessions"
                  : "Delete"
              }
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Created {new Date(config.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {config.id_alias && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground">
                {config.id_alias}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={handleCopyIdAlias}
                title="Copy ID"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          )}
          <div className="space-y-1 text-sm text-muted-foreground">
            {config.embedding_model_id && <p>✓ Embedding model configured</p>}
            {config.knowledge_store_id && <p>✓ Knowledge store configured</p>}
            {config.dataset_ids && config.dataset_ids.length > 0 && (
              <p>✓ {config.dataset_ids.length} dataset(s) configured</p>
            )}
            {config.integrations && config.integrations.length > 0 && (
              <div className="space-y-2">
                {config.integrations.map((integration, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Cloud className="w-3 h-3" />
                      <p>
                        {integration.provider === "google" && "Google"}
                        {integration.enable ? " (enabled)" : " (disabled)"}
                      </p>
                    </div>
                    {integration.provider === "google" &&
                      integration.resources && (
                        <div className="ml-4 space-y-0.5 text-xs text-muted-foreground">
                          {integration.resources.sheets?.sheet_name && (
                            <p>• Sheet: {integration.resources.sheets.sheet_name}</p>
                          )}
                          {integration.resources.pdfs?.pdf_name && (
                            <p>• PDF: {integration.resources.pdfs.pdf_name}</p>
                          )}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
            {config.instruction_prompt && <p>✓ Custom instructions set</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ConfigListProps {
  onConfigSelect: (config: ChatConfig) => void;
  selectedConfigId?: string;
}

export const ConfigList: React.FC<ConfigListProps> = ({
  onConfigSelect,
  selectedConfigId,
}) => {
  const { configs, configsLoading, fetchConfigs, deleteConfig } =
    useChatStore();
  const [editingConfig, setEditingConfig] = useState<ChatConfig | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingConfigId, setDeletingConfigId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleDeleteClick = (id: string) => {
    setDeletingConfigId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingConfigId) {
      setIsDeleting(true);
      try {
        await deleteConfig(deletingConfigId);
        setDeletingConfigId(null);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error("Failed to delete config:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeletingConfigId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEdit = (config: ChatConfig) => {
    setEditingConfig(config);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingConfig(null);
  };

  if (configsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No chat configs</h3>
        <p className="text-muted-foreground">
          Create your first chat configuration to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {configs.map((config) => (
          <ConfigCard
            key={config.id}
            config={config}
            isSelected={config.id === selectedConfigId}
            onSelect={() => onConfigSelect(config)}
            onEdit={() => handleEdit(config)}
            onDelete={() => handleDeleteClick(config.id)}
          />
        ))}
      </div>

      <EditConfigDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        config={editingConfig}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat Config</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat configuration? This
              action cannot be undone and will also delete all associated chat
              sessions and messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
