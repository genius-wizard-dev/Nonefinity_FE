import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getClerkToken } from "@/consts/endpoint";
import { DatasetService } from "@/screen/dashboard/dataset-management/services";
import type { Dataset } from "@/screen/dashboard/dataset-management/types";
import { KnowledgeStoreService } from "@/screen/dashboard/knowledge-stores/services";
import type { KnowledgeStore } from "@/screen/dashboard/knowledge-stores/types";
import { ModelService } from "@/screen/dashboard/models/service";
import type { Model } from "@/screen/dashboard/models/type";
import { HelpCircle, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useChatStore } from "../store";

export default function CreateChatDialog() {
  const { createChat, isCreating } = useChatStore();
  const [open, setOpen] = useState(false);

  // API data state
  const [chatModels, setChatModels] = useState<Model[]>([]);
  const [embeddingModels, setEmbeddingModels] = useState<Model[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [knowledgeStores, setKnowledgeStores] = useState<KnowledgeStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    chat_model_id: "",
    embedding_model_id: "",
    knowledge_store_id: "",
    dataset_ids: [] as string[],
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 1.0,
    instruction_prompt: "You are a helpful AI assistant.",
  });

  // Load data from APIs when dialog opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getClerkToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      // Load all data in parallel
      const [
        chatModelsData,
        embeddingModelsData,
        datasetsData,
        knowledgeStoresData,
      ] = await Promise.all([
        ModelService.listModels({ type: "chat", active_only: true }, token),
        ModelService.listModels(
          { type: "embedding", active_only: true },
          token
        ),
        DatasetService.getDatasets(1, 100, token),
        KnowledgeStoreService.list({ skip: 0, limit: 100 }, {}),
      ]);

      setChatModels(chatModelsData?.models || []);
      setEmbeddingModels(embeddingModelsData?.models || []);
      setDatasets(datasetsData || []);
      setKnowledgeStores(knowledgeStoresData?.knowledge_stores || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Filter embedding models by knowledge store dimension
  const getCompatibleEmbeddingModels = (knowledgeStoreId: string) => {
    if (!knowledgeStoreId || knowledgeStoreId === "none") {
      return embeddingModels;
    }

    const selectedKnowledgeStore = knowledgeStores.find(
      (ks) => ks.id === knowledgeStoreId
    );
    if (!selectedKnowledgeStore) {
      return embeddingModels;
    }

    return embeddingModels.filter(
      (model) => model.dimension === selectedKnowledgeStore.dimension
    );
  };

  // Filter knowledge stores by embedding model dimension
  const getCompatibleKnowledgeStores = (embeddingModelId: string) => {
    if (!embeddingModelId || embeddingModelId === "none") {
      return knowledgeStores;
    }

    const selectedEmbeddingModel = embeddingModels.find(
      (model) => model.id === embeddingModelId
    );
    if (!selectedEmbeddingModel || !selectedEmbeddingModel.dimension) {
      return knowledgeStores;
    }

    return knowledgeStores.filter(
      (ks) => ks.dimension === selectedEmbeddingModel.dimension
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.chat_model_id) {
      return;
    }

    // Validate that knowledge store is selected if embedding model is selected
    if (
      formData.embedding_model_id !== "none" &&
      formData.knowledge_store_id === "none"
    ) {
      toast.error("Validation Error", {
        description:
          "Knowledge store is required when using an embedding model",
      });
      return;
    }

    try {
      const chatData = {
        name: formData.name.trim(),
        chat_model_id: formData.chat_model_id,
        embedding_model_id:
          formData.embedding_model_id === "none" || !formData.embedding_model_id
            ? null
            : formData.embedding_model_id,
        knowledge_store_id:
          formData.knowledge_store_id === "none" || !formData.knowledge_store_id
            ? null
            : formData.knowledge_store_id,
        dataset_ids: formData.dataset_ids,
        temperature: formData.temperature,
        max_tokens: formData.max_tokens,
        top_p: formData.top_p,
        instruction_prompt: formData.instruction_prompt,
      };

      const result = await createChat(chatData);

      // Only close dialog and reset form if chat was created successfully
      if (result) {
        setOpen(false);
        setFormData({
          name: "",
          chat_model_id: "",
          embedding_model_id: "",
          knowledge_store_id: "",
          dataset_ids: [],
          temperature: 0.7,
          max_tokens: 2048,
          top_p: 1.0,
          instruction_prompt: "You are a helpful AI assistant.",
        });
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-semibold">
            Create New Chat
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Configure your AI assistant with custom models and settings
          </p>
        </DialogHeader>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-muted-foreground">Loading data...</p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 space-y-8"
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Basic Configuration */}
          <div className="space-y-6">
            <div className="border-b pb-3">
              <h3 className="text-xl font-semibold">Basic Configuration</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Essential settings for your chat
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Chat Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter chat name"
                  className="h-10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chat_model" className="text-sm font-medium">
                  Chat Model <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.chat_model_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, chat_model_id: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue
                      placeholder={
                        loading ? "Loading models..." : "Select chat model"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {chatModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Advanced Configuration */}
          <div className="space-y-6">
            <div className="border-b pb-3">
              <h3 className="text-xl font-semibold">Advanced Configuration</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Optional AI capabilities and knowledge integration
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="embedding_model"
                  className="text-sm font-medium"
                >
                  Embedding Model
                  <span className="text-xs text-muted-foreground ml-1">
                    (Optional)
                  </span>
                </Label>
                <Select
                  value={formData.embedding_model_id}
                  onValueChange={(value) => {
                    const newEmbeddingId = value === "none" ? "none" : value;
                    setFormData({
                      ...formData,
                      embedding_model_id: newEmbeddingId,
                      // Clear knowledge store if embedding is cleared
                      knowledge_store_id:
                        newEmbeddingId === "none"
                          ? "none"
                          : formData.knowledge_store_id,
                      // Clear datasets if embedding is cleared
                      dataset_ids:
                        newEmbeddingId === "none" ? [] : formData.dataset_ids,
                    });

                    // Clear knowledge store if embedding model changes and they're incompatible
                    if (
                      value !== "none" &&
                      formData.knowledge_store_id !== "none"
                    ) {
                      const compatibleStores =
                        getCompatibleKnowledgeStores(value);
                      if (
                        !compatibleStores.find(
                          (ks) => ks.id === formData.knowledge_store_id
                        )
                      ) {
                        setFormData((prev) => ({
                          ...prev,
                          knowledge_store_id: "none",
                        }));
                      }
                    }
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue
                      placeholder={
                        loading ? "Loading models..." : "Select embedding model"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">----</SelectItem>
                    {getCompatibleEmbeddingModels(
                      formData.knowledge_store_id
                    ).map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} (Dim: {model.dimension})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="knowledge_store"
                  className="text-sm font-medium"
                >
                  Knowledge Store
                  <span className="text-xs text-muted-foreground ml-1">
                    {formData.embedding_model_id !== "none"
                      ? "(Required)"
                      : "(Optional)"}
                  </span>
                </Label>
                <Select
                  value={formData.knowledge_store_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, knowledge_store_id: value });
                    // Clear embedding model if knowledge store changes and they're incompatible
                    if (
                      value !== "none" &&
                      formData.embedding_model_id !== "none"
                    ) {
                      const compatibleModels =
                        getCompatibleEmbeddingModels(value);
                      if (
                        !compatibleModels.find(
                          (model) => model.id === formData.embedding_model_id
                        )
                      ) {
                        setFormData((prev) => ({
                          ...prev,
                          embedding_model_id: "none",
                        }));
                      }
                    }
                  }}
                  disabled={loading || formData.embedding_model_id === "none"}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue
                      placeholder={
                        formData.embedding_model_id === "none"
                          ? "Select embedding model first"
                          : loading
                          ? "Loading stores..."
                          : "Select knowledge store"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">----</SelectItem>
                    {getCompatibleKnowledgeStores(
                      formData.embedding_model_id
                    ).map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name} (Dim: {store.dimension})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.embedding_model_id !== "none" &&
                  formData.knowledge_store_id === "none" && (
                    <p className="text-xs text-destructive">
                      Knowledge store is required when using an embedding model
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="space-y-6">
            <div className="border-b pb-3">
              <h3 className="text-xl font-semibold">Data Sources</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Connect datasets to enhance AI responses
              </p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="datasets" className="text-sm font-medium">
                Datasets
                <span className="text-xs text-muted-foreground ml-1">
                  (Optional - Select multiple)
                </span>
              </Label>

              {/* Selected Datasets Display */}
              {formData.dataset_ids.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.dataset_ids.map((datasetId) => {
                    const dataset = datasets.find((d) => d.id === datasetId);
                    return dataset ? (
                      <div
                        key={datasetId}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm shadow-sm"
                      >
                        <span className="max-w-[250px] truncate font-medium">
                          {dataset.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              dataset_ids: formData.dataset_ids.filter(
                                (id) => id !== datasetId
                              ),
                            });
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !formData.dataset_ids.includes(value)) {
                    setFormData({
                      ...formData,
                      dataset_ids: [...formData.dataset_ids, value],
                    });
                  }
                }}
                disabled={loading}
              >
                <SelectTrigger className="h-10">
                  <SelectValue
                    placeholder={
                      loading ? "Loading datasets..." : "Add dataset"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {datasets
                    .filter(
                      (dataset) => !formData.dataset_ids.includes(dataset.id)
                    )
                    .map((dataset) => (
                      <SelectItem key={dataset.id} value={dataset.id}>
                        {dataset.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {formData.dataset_ids.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, dataset_ids: [] })}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all datasets
                </button>
              )}
            </div>
          </div>

          {/* AI Behavior */}
          <div className="space-y-6">
            <div className="border-b pb-3">
              <h3 className="text-xl font-semibold">AI Behavior</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Customize how the AI responds and behaves
              </p>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="instruction_prompt"
                className="text-sm font-medium"
              >
                Instruction Prompt
              </Label>
              <Textarea
                id="instruction_prompt"
                value={formData.instruction_prompt}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instruction_prompt: e.target.value,
                  })
                }
                placeholder="Enter system instruction for the AI"
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                System instruction that guides the AI's behavior and responses
              </p>
            </div>
          </div>

          {/* Model Parameters */}
          <div className="space-y-6">
            <div className="border-b pb-3">
              <h3 className="text-xl font-semibold">Model Parameters</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="temperature" className="text-sm font-medium">
                    Temperature
                    <span className="text-xs text-muted-foreground ml-1">
                      (0.0 - 2.0)
                    </span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Controls randomness in AI responses</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      temperature: parseFloat(e.target.value),
                    })
                  }
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="max_tokens" className="text-sm font-medium">
                    Max Tokens
                    <span className="text-xs text-muted-foreground ml-1">
                      (1 - 4096)
                    </span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Maximum number of tokens in AI response</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="max_tokens"
                  type="number"
                  min="1"
                  max="4096"
                  value={formData.max_tokens}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_tokens: parseInt(e.target.value),
                    })
                  }
                  placeholder="2048"
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="top_p" className="text-sm font-medium">
                    Top P
                    <span className="text-xs text-muted-foreground ml-1">
                      (0.0 - 1.0)
                    </span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Controls diversity of AI responses</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="top_p"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.top_p}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      top_p: parseFloat(e.target.value),
                    })
                  }
                  placeholder="1.0"
                  className="h-12 text-base"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t mt-6 bg-background px-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating || loading}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || loading}
              className="min-w-[140px] gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                "Create Chat"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
