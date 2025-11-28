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
  Plug,
  RefreshCw,
  Server,
  Settings,
} from "lucide-react";
import React, { useState } from "react";
import type { Dataset } from "../../dataset-management/types";
import type { KnowledgeStore } from "../../knowledge-stores/types";
import type { Model } from "../../models/type";
import { useChatStore } from "../store";
import type {
  ChatConfigCreate,
  ChatConfigUpdate,
  IntegrationConfig,
} from "../types";
import { DatasetSelector } from "./dataset-selector";
import {
  IntegrateToolsSelector,
  type SelectedToolsMap,
} from "./integrate-tools-selector";
import { KnowledgeStoreSelector } from "./knowledge-store-selector";
import { MCPSelector, type MCPConfig } from "./mcp-selector";
import { ModelSelector } from "./model-selector";

interface ConfigSheetProps {
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
  integrations: IntegrationConfig[];
  mcps: MCPConfig[];
  selectedEmbeddingModel: Model | null | undefined;
  modelsLoading: boolean;
  dataLoaded: boolean;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  idPrefix?: string;
  onEmbeddingModelChange?: (value: string | null) => void;
}

export const ConfigSheet: React.FC<ConfigSheetProps> = ({
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
  integrations,
  mcps,
  selectedEmbeddingModel,
  modelsLoading,
  dataLoaded,
  submitting,
  onSubmit,
  idPrefix = "",
  onEmbeddingModelChange,
}) => {
  const [isRefreshingModels, setIsRefreshingModels] = useState(false);
  const fetchChatModels = useChatStore((state) => state.fetchChatModels);
  const fetchEmbeddingModels = useChatStore(
    (state) => state.fetchEmbeddingModels
  );

  const handleRefreshModels = async () => {
    setIsRefreshingModels(true);
    await Promise.all([fetchChatModels(true), fetchEmbeddingModels(true)]);
    setIsRefreshingModels(false);
  };

  const handleDatasetSelectionChange = (selectedIds: string[]) => {
    onFormDataChange({
      ...formData,
      dataset_ids: selectedIds.length > 0 ? selectedIds : null,
    });
  };

  const handleSelectedToolsChange = (
    selectedTools: SelectedToolsMap | null
  ) => {
    onFormDataChange({
      ...formData,
      selected_tools: selectedTools,
    });
  };

  const handleMCPSelectionChange = (selectedIds: string[]) => {
    onFormDataChange({
      ...formData,
      mcp_ids: selectedIds.length > 0 ? selectedIds : null,
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl lg:max-w-4xl flex flex-col p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 flex-shrink-0">
          <SheetTitle className="text-xl">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          {!dataLoaded ? (
            <div className="p-6">
              <LoadingSkeleton />
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col h-full">
              <Tabs defaultValue="basic" className="flex flex-col h-full">
                <div className="px-6 pt-4 flex-shrink-0">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger
                      value="basic"
                      className="gap-1.5 text-xs sm:text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Basic</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="store"
                      className="gap-1.5 text-xs sm:text-sm"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="hidden sm:inline">Store</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="dataset"
                      className="gap-1.5 text-xs sm:text-sm"
                    >
                      <Database className="w-4 h-4" />
                      <span className="hidden sm:inline">Dataset</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="integrate"
                      className="gap-1.5 text-xs sm:text-sm"
                    >
                      <Plug className="w-4 h-4" />
                      <span className="hidden sm:inline">Tools</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="mcp"
                      className="gap-1.5 text-xs sm:text-sm"
                    >
                      <Server className="w-4 h-4" />
                      <span className="hidden sm:inline">MCP</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1 px-6">
                  <div className="py-4 space-y-4">
                    <TabsContent value="basic" className="mt-0 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${idPrefix}name`}>Name *</Label>
                        <Input
                          id={`${idPrefix}name`}
                          value={formData.name}
                          onChange={(e) =>
                            onFormDataChange({
                              ...formData,
                              name: e.target.value,
                            })
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
                          rows={6}
                          className="resize-none"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="store" className="mt-0 space-y-4">
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

                    <TabsContent value="dataset" className="mt-0">
                      <DatasetSelector
                        datasets={datasets}
                        selectedIds={formData.dataset_ids || null}
                        onSelectionChange={handleDatasetSelectionChange}
                        loading={modelsLoading}
                        idPrefix={`${idPrefix}dataset`}
                      />
                    </TabsContent>

                    <TabsContent value="integrate" className="mt-0">
                      <IntegrateToolsSelector
                        integrations={integrations}
                        selectedTools={formData.selected_tools || null}
                        onSelectedToolsChange={handleSelectedToolsChange}
                        loading={modelsLoading}
                        idPrefix={`${idPrefix}integrate`}
                      />
                    </TabsContent>

                    <TabsContent value="mcp" className="mt-0">
                      <MCPSelector
                        mcps={mcps}
                        selectedIds={formData.mcp_ids || null}
                        onSelectionChange={handleMCPSelectionChange}
                        loading={modelsLoading}
                        idPrefix={`${idPrefix}mcp`}
                      />
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>

              <SheetFooter className="flex-shrink-0 border-t px-6 py-4 bg-background">
                <div className="flex gap-3 w-full justify-end">
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
                    disabled={
                      submitting || !formData.name || !formData.chat_model_id
                    }
                  >
                    {submitting ? "Saving..." : "Save"}
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
