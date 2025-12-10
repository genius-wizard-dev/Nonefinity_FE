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
import {
  BookOpen,
  Database,
  Plug,
  Server,
  Settings,
  Wrench,
} from "lucide-react";
import React, { memo, useEffect } from "react";
import type { Dataset } from "../../dataset-management/types";
import type { KnowledgeStore } from "../../knowledge-stores/types";
import type { Model } from "../../models/type";
import type {
  ChatConfigCreate,
  ChatConfigUpdate,
  IntegrationConfig,
} from "../types";
import { DatasetSelector } from "./dataset-selector";
import { IntegrateSelector } from "./integrate-selector";
import { KnowledgeStoreSelector } from "./knowledge-store-selector";
import { MCPSelector, type MCPConfig } from "./mcp-selector";
import { ModelSelector } from "./model-selector";
import { ToolSelector } from "./tool-selector";
import { ChatService } from "../services";
import { useChatStore } from "../store";

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

const TabsHeader = memo(function TabsHeader() {
  return (
    <TabsList className="grid w-full grid-cols-6 mb-4 flex-shrink-0">
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
      <TabsTrigger value="integrate" className="gap-2">
        <Plug className="w-4 h-4" />
        Integrate
      </TabsTrigger>
      <TabsTrigger value="tools" className="gap-2">
        <Wrench className="w-4 h-4" />
        Tools
      </TabsTrigger>
      <TabsTrigger value="mcp" className="gap-2">
        <Server className="w-4 h-4" />
        MCP
      </TabsTrigger>
    </TabsList>
  );
});

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
  const configActiveTab = useChatStore((state) => state.configActiveTab);
  const setConfigActiveTab = useChatStore((state) => state.setConfigActiveTab);
  const resetConfigActiveTab = useChatStore(
    (state) => state.resetConfigActiveTab
  );

  useEffect(() => {
    if (!open) {
      resetConfigActiveTab();
    }
  }, [open, resetConfigActiveTab]);
  const handleDatasetSelectionChange = (selectedIds: string[]) => {
    onFormDataChange({
      ...formData,
      dataset_ids: selectedIds.length > 0 ? selectedIds : null,
    });
  };

  const handleIntegrateSelectionChange = (selectedIds: string[]) => {
    // When integrations change, we should also update selected_tools
    // Remove tools that are no longer from selected integrations
    const currentSelectedTools = formData.selected_tools || {};

    // Filter out tools from integrations that are no longer selected
    const selectedIntegrationNames = new Set(
      selectedIds
        .map((id) => integrations.find((i) => i.id === id)?.name)
        .filter((name): name is string => name !== undefined)
    );

    const filteredSelectedTools: Record<string, { tools: string[] }> = {};
    Object.keys(currentSelectedTools).forEach((integrationName) => {
      if (selectedIntegrationNames.has(integrationName)) {
        filteredSelectedTools[integrationName] = currentSelectedTools[integrationName];
      }
    });

    onFormDataChange({
      ...formData,
      integration_ids: selectedIds.length > 0 ? selectedIds : null,
      selected_tools:
        Object.keys(filteredSelectedTools).length > 0
          ? filteredSelectedTools
          : null,
    });
  };

  const handleToolSelectionChange = async (selectedSlugs: string[]) => {
    // Convert array of tool slugs to Record format grouped by integration
    // We need to find which integration each tool belongs to
    const selectedIntegrationIds = formData.integration_ids || [];
    const toolsByIntegration: Record<string, { tools: string[] }> = {};

    // Fetch tools for each integration to determine which integration each tool belongs to
    try {
      const toolsPromises = selectedIntegrationIds.map(async (integrationId) => {
        const integration = integrations.find((i) => i.id === integrationId);
        if (!integration) return { integrationName: "", tools: [] };

        const tools = await ChatService.getAvailableTools(integrationId);
        return {
          integrationName: integration.name,
          tools: tools || [],
        };
      });

      const toolsData = await Promise.all(toolsPromises);

      // Create a map of tool slug to integration name
      const toolToIntegrationMap = new Map<string, string>();
      toolsData.forEach(({ integrationName, tools }) => {
        tools.forEach((tool) => {
          toolToIntegrationMap.set(tool.slug, integrationName);
        });
      });

      // Group selected tools by their integration
      selectedSlugs.forEach((slug) => {
        const integrationName = toolToIntegrationMap.get(slug);
        if (integrationName) {
          if (!toolsByIntegration[integrationName]) {
            toolsByIntegration[integrationName] = { tools: [] };
          }
          if (!toolsByIntegration[integrationName].tools.includes(slug)) {
            toolsByIntegration[integrationName].tools.push(slug);
          }
        }
      });
    } catch (error) {
      console.error("Error fetching tools for conversion:", error);
      // Fallback: if we can't determine which integration each tool belongs to,
      // we'll group all tools under the first integration (not ideal but better than nothing)
      if (selectedSlugs.length > 0 && selectedIntegrationIds.length > 0) {
        const firstIntegration = integrations.find(
          (i) => i.id === selectedIntegrationIds[0]
        );
        if (firstIntegration) {
          toolsByIntegration[firstIntegration.name] = { tools: selectedSlugs };
        }
      }
    }

    onFormDataChange({
      ...formData,
      selected_tools:
        Object.keys(toolsByIntegration).length > 0
          ? toolsByIntegration
          : null,
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
              <Tabs
                value={configActiveTab}
                onValueChange={setConfigActiveTab}
                className="flex flex-col"
              >
                <TabsHeader />

                <div className="overflow-y-auto">
                  <TabsContent value="basic" className="space-y-4 mt-0">
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

                  <TabsContent value="integrate" className="space-y-4 mt-0">
                    <IntegrateSelector
                      integrations={integrations}
                      selectedIds={formData.integration_ids || null}
                      onSelectionChange={handleIntegrateSelectionChange}
                      loading={modelsLoading}
                      idPrefix={`${idPrefix}integrate`}
                    />
                  </TabsContent>

                  <TabsContent value="tools" className="space-y-4 mt-0">
                    <ToolSelector
                      integrations={integrations}
                      selectedIntegrationIds={formData.integration_ids || null}
                      selectedToolSlugs={
                        formData.selected_tools
                          ? Object.values(formData.selected_tools)
                              .flatMap((item) => item.tools)
                          : null
                      }
                      onToolSelectionChange={handleToolSelectionChange}
                      loading={modelsLoading}
                      idPrefix={`${idPrefix}tool`}
                    />
                  </TabsContent>

                  <TabsContent value="mcp" className="space-y-4 mt-0">
                    <MCPSelector
                      mcps={mcps}
                      selectedIds={formData.mcp_ids || null}
                      onSelectionChange={handleMCPSelectionChange}
                      loading={modelsLoading}
                      idPrefix={`${idPrefix}mcp`}
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
                  disabled={
                    submitting || !formData.name || !formData.chat_model_id
                  }
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
