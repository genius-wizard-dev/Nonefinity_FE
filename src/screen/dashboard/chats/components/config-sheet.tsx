import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Database,
  FileText,
  Layers,
  Plug,
  RefreshCw,
  Server,
  Settings,
} from "lucide-react";
import React, { memo, useCallback, useEffect, useState } from "react";
import {
  useFetchStoresByDimension,
  useKnowledgeStores,
} from "../../knowledge-stores/store";
import { useChatConfigFormStore } from "../chat-config-form-store";
import {
  useChatModels,
  useChatModelsLoading,
  useChatStore,
  useDatasets,
  useDatasetsLoading,
  useEmbeddingModels,
  useEmbeddingModelsLoading,
  useIntegrations,
  useIntegrationsLoading,
  useIntegrationToolsLoading,
  useMcps,
  useMcpsLoading,
} from "../store";
import { DatasetSelector } from "./dataset-selector";
import {
  IntegrateToolsSelector,
  type SelectedToolsMap,
} from "./integrate-tools-selector";
import { KnowledgeStoreSelector } from "./knowledge-store-selector";
import { MCPSelector } from "./mcp-selector";
import { ModelSelector } from "./model-selector";

interface ConfigSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  idPrefix?: string;
  dataLoaded?: boolean; // Kept for interface compatibility but logic moved inside
}

const TabsHeader = memo(function TabsHeader() {
  return (
    <div className="px-6 pt-4 flex-shrink-0">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="basic" className="gap-1.5 text-xs sm:text-sm">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Basic</span>
        </TabsTrigger>
        <TabsTrigger value="middleware" className="gap-1.5 text-xs sm:text-sm">
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">Middleware</span>
        </TabsTrigger>
        <TabsTrigger value="store" className="gap-1.5 text-xs sm:text-sm">
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Store</span>
        </TabsTrigger>
        <TabsTrigger value="dataset" className="gap-1.5 text-xs sm:text-sm">
          <Database className="w-4 h-4" />
          <span className="hidden sm:inline">Dataset</span>
        </TabsTrigger>
        <TabsTrigger value="integrate" className="gap-1.5 text-xs sm:text-sm">
          <Plug className="w-4 h-4" />
          <span className="hidden sm:inline">Tools</span>
        </TabsTrigger>
        <TabsTrigger value="mcp" className="gap-1.5 text-xs sm:text-sm">
          <Server className="w-4 h-4" />
          <span className="hidden sm:inline">MCP</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
});

const BasicTabContent = memo(({ idPrefix }: { idPrefix: string }) => {
  const { formData, updateField } = useChatConfigFormStore();
  const chatModels = useChatModels();
  const modelsLoading = useChatModelsLoading();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}name`}>Name *</Label>
        <Input
          id={`${idPrefix}name`}
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="My Chat Config"
          required
        />
      </div>

      <ModelSelector
        label="Chat Model *"
        value={formData.chat_model_id || null}
        onChange={(value) => updateField("chat_model_id", value || "")}
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
          onChange={(e) => updateField("instruction_prompt", e.target.value)}
          placeholder="Custom instructions for the AI..."
          rows={6}
          className="resize-none"
        />
      </div>
    </div>
  );
});

const MiddlewareTabContent = memo(({ idPrefix }: { idPrefix: string }) => {
  const { formData, updateField } = useChatConfigFormStore();
  const chatModels = useChatModels();
  const modelsLoading = useChatModelsLoading();

  const summaryConfig = React.useMemo(() => {
    const middleware = formData.middleware || [];
    const summaryMw = middleware.find((m) => "summary" in m);
    return summaryMw ? summaryMw.summary : {};
  }, [formData.middleware]);

  const updateSummaryConfig = useCallback(
    (key: string, value: any) => {
      const middleware = [...(formData.middleware || [])];
      const summaryIndex = middleware.findIndex((m) => "summary" in m);

      const currentConfig = middleware[summaryIndex]?.summary || {};
      const newSummaryConfig = {
        ...currentConfig,
        [key]: value,
      };

      const newMiddlewareItem = { summary: newSummaryConfig };

      if (summaryIndex >= 0) {
        middleware[summaryIndex] = newMiddlewareItem;
      } else {
        middleware.push(newMiddlewareItem);
      }

      updateField("middleware", middleware);
    },
    [formData.middleware, updateField]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Summarization
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure how the chat history is summarized to maintain context.
          </p>
        </div>
        <div className="p-6 pt-0 space-y-4">
          <ModelSelector
            label="Summary Model (Optional)"
            value={summaryConfig.model_id || null}
            onChange={(value) => updateSummaryConfig("model_id", value)}
            models={chatModels}
            loading={modelsLoading}
            placeholder="Default (Same as Chat Model)"
            id={`${idPrefix}summary_model`}
            allowNone
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}max_message_to_keep`}>
                Max Messages to Keep
              </Label>
              <Input
                id={`${idPrefix}max_message_to_keep`}
                type="number"
                value={summaryConfig.max_message_to_keep || ""}
                onChange={(e) =>
                  updateSummaryConfig(
                    "max_message_to_keep",
                    parseInt(e.target.value) || 0
                  )
                }
                placeholder="10"
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}max_tokens_before_summary`}>
                Max Tokens Before Summarize
              </Label>
              <Input
                id={`${idPrefix}max_tokens_before_summary`}
                type="number"
                value={summaryConfig.max_tokens_before_summary || ""}
                onChange={(e) =>
                  updateSummaryConfig(
                    "max_tokens_before_summary",
                    parseInt(e.target.value) || 0
                  )
                }
                placeholder="4000"
                min={1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}summary_prompt`}>Summary Prompt</Label>
            <Textarea
              id={`${idPrefix}summary_prompt`}
              value={summaryConfig.prompt || ""}
              onChange={(e) => updateSummaryConfig("prompt", e.target.value)}
              placeholder="You are a helpful assistant that summarizes the conversation history into a concise summary."
              rows={6}
              className="resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

const StoreTabContent = memo(({ idPrefix }: { idPrefix: string }) => {
  const { formData, updateField } = useChatConfigFormStore();
  const embeddingModels = useEmbeddingModels();
  const modelsLoading = useEmbeddingModelsLoading();

  const knowledgeStores = useKnowledgeStores();
  const fetchStoresByDimension = useFetchStoresByDimension();

  const [isRefreshingModels, setIsRefreshingModels] = useState(false);
  const fetchChatModels = useChatStore((state) => state.fetchChatModels);
  const fetchEmbeddingModels = useChatStore(
    (state) => state.fetchEmbeddingModels
  );

  // Get selected embedding model to filter stores
  const selectedEmbeddingModel = React.useMemo(() => {
    if (!formData.embedding_model_id) return null;
    return embeddingModels.find((m) => m.id === formData.embedding_model_id);
  }, [formData.embedding_model_id, embeddingModels]);

  // Filter knowledge stores by dimension
  const filteredKnowledgeStores = React.useMemo(() => {
    if (!selectedEmbeddingModel?.dimension) return [];
    return knowledgeStores.filter(
      (store) => store.dimension === selectedEmbeddingModel.dimension
    );
  }, [selectedEmbeddingModel, knowledgeStores]);

  // Effect to fetch stores when dimension changes
  useEffect(() => {
    if (selectedEmbeddingModel?.dimension) {
      fetchStoresByDimension(selectedEmbeddingModel.dimension);
    }
  }, [selectedEmbeddingModel?.dimension, fetchStoresByDimension]);

  // Effect to clear selection if it becomes invalid
  useEffect(() => {
    if (
      formData.embedding_model_id &&
      formData.knowledge_store_id &&
      filteredKnowledgeStores.length > 0 &&
      !filteredKnowledgeStores.some(
        (store) => store.id === formData.knowledge_store_id
      )
    ) {
      updateField("knowledge_store_id", null);
    }
  }, [
    filteredKnowledgeStores,
    formData.embedding_model_id,
    formData.knowledge_store_id,
    updateField,
  ]);

  const handleRefreshModels = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRefreshingModels(true);
    await Promise.all([fetchChatModels(true), fetchEmbeddingModels(true)]);
    setIsRefreshingModels(false);
  };

  const handleEmbeddingModelChange = (value: string | null) => {
    updateField("embedding_model_id", value);
    if (value === null) {
      updateField("knowledge_store_id", null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Knowledge Store Configuration
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleRefreshModels}
          disabled={isRefreshingModels}
          title="Refresh embedding models"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isRefreshingModels ? "animate-spin" : ""
            }`}
          />
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          onChange={(value) => updateField("knowledge_store_id", value)}
          stores={filteredKnowledgeStores}
          loading={modelsLoading}
          disabled={!formData.embedding_model_id}
          id={`${idPrefix}knowledge_store`}
          selectedEmbeddingModel={selectedEmbeddingModel}
        />
      </div>
    </div>
  );
});

const DatasetTabContent = memo(({ idPrefix }: { idPrefix: string }) => {
  const { formData, updateField } = useChatConfigFormStore();
  const datasets = useDatasets();
  const loading = useDatasetsLoading();

  const handleDatasetSelectionChange = (selectedIds: string[]) => {
    updateField("dataset_ids", selectedIds.length > 0 ? selectedIds : null);
  };

  return (
    <DatasetSelector
      datasets={datasets}
      selectedIds={formData.dataset_ids || null}
      onSelectionChange={handleDatasetSelectionChange}
      loading={loading}
      idPrefix={`${idPrefix}dataset`}
    />
  );
});

const IntegrateTabContent = memo(({ idPrefix }: { idPrefix: string }) => {
  const { formData, updateField } = useChatConfigFormStore();
  const integrations = useIntegrations();
  const integrationsLoading = useIntegrationsLoading();
  const toolsLoading = useIntegrationToolsLoading();
  const loading = integrationsLoading || toolsLoading;

  const handleSelectedToolsChange = (
    selectedTools: SelectedToolsMap | null
  ) => {
    updateField("selected_tools", selectedTools);
  };

  return (
    <IntegrateToolsSelector
      integrations={integrations}
      selectedTools={formData.selected_tools || null}
      onSelectedToolsChange={handleSelectedToolsChange}
      loading={loading}
      idPrefix={`${idPrefix}integrate`}
    />
  );
});

const McpTabContent = memo(({ idPrefix }: { idPrefix: string }) => {
  const { formData, updateField } = useChatConfigFormStore();
  const mcps = useMcps();
  const loading = useMcpsLoading();

  const handleMCPSelectionChange = (selectedIds: string[]) => {
    updateField("mcp_ids", selectedIds.length > 0 ? selectedIds : null);
  };

  return (
    <MCPSelector
      mcps={mcps}
      selectedIds={formData.mcp_ids || null}
      onSelectionChange={handleMCPSelectionChange}
      loading={loading}
      idPrefix={`${idPrefix}mcp`}
    />
  );
});

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

export const ConfigSheet: React.FC<ConfigSheetProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  idPrefix = "",
}) => {
  const { formData, isSubmitting, activeTab, setActiveTab, resetForm } =
    useChatConfigFormStore();

  // Checking data loading state here to show skeleton if strictly necessary,
  // but individual components handle their own loading data now.
  // We can check if *critical* data is missing.
  const chatModels = useChatModels();
  const chatModelsLoading = useChatModelsLoading();
  const dataLoaded = !chatModelsLoading || chatModels.length > 0;

  // Reset tab when closing
  useEffect(() => {
    if (!open) {
      resetForm(); // Optional: do we want to clear form on close? Typically yes.
      setActiveTab("basic");
    }
  }, [open, resetForm, setActiveTab]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl lg:max-w-4xl flex flex-col p-0 max-h-screen"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 flex-shrink-0">
          <SheetTitle className="text-xl">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {!dataLoaded ? (
            <div className="p-6 overflow-y-auto">
              <LoadingSkeleton />
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col h-full min-h-0">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex flex-col flex-1 min-h-0"
              >
                <TabsHeader />

                <ScrollArea className="flex-1 min-h-0 px-6">
                  <div className="py-4 space-y-4">
                    <TabsContent value="basic" className="mt-0 space-y-4">
                      <BasicTabContent idPrefix={idPrefix} />
                    </TabsContent>

                    <TabsContent value="store" className="mt-0 space-y-4">
                      <StoreTabContent idPrefix={idPrefix} />
                    </TabsContent>

                    <TabsContent value="dataset" className="mt-0">
                      <DatasetTabContent idPrefix={idPrefix} />
                    </TabsContent>

                    <TabsContent value="integrate" className="mt-0">
                      <IntegrateTabContent idPrefix={idPrefix} />
                    </TabsContent>

                    <TabsContent value="mcp" className="mt-0">
                      <McpTabContent idPrefix={idPrefix} />
                    </TabsContent>

                    <TabsContent value="middleware" className="mt-0 space-y-6">
                      <MiddlewareTabContent idPrefix={idPrefix} />
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>

              <SheetFooter className="flex-shrink-0 border-t px-6 py-4 bg-background mt-auto">
                <div className="flex gap-3 w-full justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || !formData.name || !formData.chat_model_id
                    }
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </SheetFooter>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
