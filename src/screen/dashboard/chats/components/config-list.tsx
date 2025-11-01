import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Database, Edit, MessageSquare, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

interface CreateConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateConfigDialog: React.FC<CreateConfigDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { createConfig, fetchConfigs } = useChatStore();
  const [formData, setFormData] = useState<ChatConfigCreate>({
    name: "",
    chat_model_id: "",
    embedding_model_id: null,
    knowledge_store_id: null,
    dataset_ids: null,
    instruction_prompt: "",
  });
  const [chatModels, setChatModels] = useState<Model[]>([]);
  const [embeddingModels, setEmbeddingModels] = useState<Model[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      setFormData({
        name: "",
        chat_model_id: "",
        embedding_model_id: null,
        knowledge_store_id: null,
        dataset_ids: null,
        instruction_prompt: "",
      });
      loadModelsAndStores();
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
        await fetchConfigs();
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Chat Config</DialogTitle>
          <DialogDescription>
            Configure a new chat configuration with AI model and optional
            knowledge store
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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

            <div className="space-y-2">
              <Label htmlFor="chat_model">Chat Model *</Label>
              {modelsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={formData.chat_model_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, chat_model_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chat model" />
                  </SelectTrigger>
                  <SelectContent>
                    {chatModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="embedding_model">
                Embedding Model (Optional)
              </Label>
              {modelsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={formData.embedding_model_id || "__none__"}
                  onValueChange={(value) => {
                    const newEmbeddingModelId =
                      value === "__none__" ? null : value;
                    // Clear knowledge store when embedding model is removed
                    setFormData({
                      ...formData,
                      embedding_model_id: newEmbeddingModelId,
                      knowledge_store_id:
                        newEmbeddingModelId === null
                          ? null
                          : formData.knowledge_store_id,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select embedding model (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {embeddingModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="knowledge_store">
                Knowledge Store (Optional)
              </Label>
              {modelsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={formData.knowledge_store_id || "__none__"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      knowledge_store_id: value === "__none__" ? null : value,
                    })
                  }
                  disabled={!formData.embedding_model_id}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        formData.embedding_model_id
                          ? "Select knowledge store (optional)"
                          : "Select embedding model first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {filteredKnowledgeStores.length === 0 ? (
                      <SelectItem value="__no_stores__" disabled>
                        {selectedEmbeddingModel
                          ? `No stores with dimension ${selectedEmbeddingModel.dimension}`
                          : "Select embedding model first"}
                      </SelectItem>
                    ) : (
                      filteredKnowledgeStores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name} (dim: {store.dimension})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Datasets (Optional)</Label>
              {modelsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <div className="border rounded-md p-3 max-h-48 overflow-auto">
                  {datasets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No datasets available
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {datasets.map((dataset) => (
                        <div
                          key={dataset.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-accent/50 transition-colors"
                        >
                          <Checkbox
                            id={`dataset-${dataset.id}`}
                            checked={
                              formData.dataset_ids?.includes(dataset.id) ||
                              false
                            }
                            onCheckedChange={(checked) => {
                              const currentIds = formData.dataset_ids || [];
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  dataset_ids: [...currentIds, dataset.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  dataset_ids: currentIds.filter(
                                    (id) => id !== dataset.id
                                  ),
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={`dataset-${dataset.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-muted-foreground" />
                              <span>{dataset.name}</span>
                            </div>
                            {dataset.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {dataset.description}
                              </p>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {formData.dataset_ids && formData.dataset_ids.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formData.dataset_ids.length} dataset
                  {formData.dataset_ids.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

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
          </div>

          <DialogFooter>
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
  const { updateConfig, fetchConfigs } = useChatStore();
  const [formData, setFormData] = useState<ChatConfigUpdate>({
    name: "",
    chat_model_id: "",
    embedding_model_id: null,
    knowledge_store_id: null,
    dataset_ids: null,
    instruction_prompt: "",
  });
  const [chatModels, setChatModels] = useState<Model[]>([]);
  const [embeddingModels, setEmbeddingModels] = useState<Model[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      setFormData({
        name: config.name,
        chat_model_id: config.chat_model_id,
        embedding_model_id: config.embedding_model_id || null,
        knowledge_store_id: config.knowledge_store_id || null,
        dataset_ids: config.dataset_ids || null,
        instruction_prompt: config.instruction_prompt || "",
      });
      loadModelsAndStores();
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
        await fetchConfigs();
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Chat Config</DialogTitle>
          <DialogDescription>
            Update the chat configuration settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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

            <div className="space-y-2">
              <Label htmlFor="edit-chat_model">Chat Model *</Label>
              {modelsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={formData.chat_model_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, chat_model_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chat model" />
                  </SelectTrigger>
                  <SelectContent>
                    {chatModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-embedding_model">
                Embedding Model (Optional)
              </Label>
              {modelsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={formData.embedding_model_id || "__none__"}
                  onValueChange={(value) => {
                    const newEmbeddingModelId =
                      value === "__none__" ? null : value;
                    setFormData({
                      ...formData,
                      embedding_model_id: newEmbeddingModelId,
                      knowledge_store_id:
                        newEmbeddingModelId === null
                          ? null
                          : formData.knowledge_store_id,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select embedding model (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {embeddingModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-knowledge_store">
                Knowledge Store (Optional)
              </Label>
              {modelsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={formData.knowledge_store_id || "__none__"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      knowledge_store_id: value === "__none__" ? null : value,
                    })
                  }
                  disabled={!formData.embedding_model_id}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        formData.embedding_model_id
                          ? "Select knowledge store (optional)"
                          : "Select embedding model first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {filteredKnowledgeStores.length === 0 ? (
                      <SelectItem value="__no_stores__" disabled>
                        {selectedEmbeddingModel
                          ? `No stores with dimension ${selectedEmbeddingModel.dimension}`
                          : "Select embedding model first"}
                      </SelectItem>
                    ) : (
                      filteredKnowledgeStores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name} (dim: {store.dimension})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Datasets (Optional)</Label>
              {modelsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <div className="border rounded-md p-3 max-h-48 overflow-auto">
                  {datasets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No datasets available
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {datasets.map((dataset) => (
                        <div
                          key={dataset.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-accent/50 transition-colors"
                        >
                          <Checkbox
                            id={`edit-dataset-${dataset.id}`}
                            checked={
                              formData.dataset_ids?.includes(dataset.id) ||
                              false
                            }
                            onCheckedChange={(checked) => {
                              const currentIds = formData.dataset_ids || [];
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  dataset_ids: [...currentIds, dataset.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  dataset_ids: currentIds.filter(
                                    (id) => id !== dataset.id
                                  ),
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={`edit-dataset-${dataset.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-muted-foreground" />
                              <span>{dataset.name}</span>
                            </div>
                            {dataset.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {dataset.description}
                              </p>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {formData.dataset_ids && formData.dataset_ids.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formData.dataset_ids.length} dataset
                  {formData.dataset_ids.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

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
          </div>

          <DialogFooter>
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
        <div className="space-y-1 text-sm text-muted-foreground">
          {config.embedding_model_id && <p>✓ Embedding model configured</p>}
          {config.knowledge_store_id && <p>✓ Knowledge store configured</p>}
          {config.dataset_ids && config.dataset_ids.length > 0 && (
            <p>✓ {config.dataset_ids.length} dataset(s) configured</p>
          )}
          {config.instruction_prompt && <p>✓ Custom instructions set</p>}
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

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this config?")) {
      await deleteConfig(id);
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
            onDelete={() => handleDelete(config.id)}
          />
        ))}
      </div>

      <EditConfigDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        config={editingConfig}
      />
    </>
  );
};
