import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronRight,
  Info,
  Plug,
  RefreshCw,
  Search,
  Wrench,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import {
  useChatStore,
  useIntegrationTools,
  useIntegrationToolsLoading,
} from "../store";
import type { IntegrationConfig, ToolItem } from "../types";

// Selected tools format: { integration_name: { tools: [tool_slug, ...] } }
export type SelectedToolsMap = Record<string, { tools: string[] }>;

interface IntegrateToolsSelectorProps {
  integrations: IntegrationConfig[];
  selectedTools: SelectedToolsMap | null;
  onSelectedToolsChange: (selectedTools: SelectedToolsMap | null) => void;
  loading?: boolean;
  idPrefix?: string;
}

interface IntegrationWithTools {
  integration: IntegrationConfig;
  tools: ToolItem[];
}

export const IntegrateToolsSelector: React.FC<IntegrateToolsSelectorProps> = ({
  integrations,
  selectedTools,
  onSelectedToolsChange,
  loading = false,
  idPrefix = "integrate-tools",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIntegrations, setExpandedIntegrations] = useState<Set<string>>(
    new Set()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use store for integration tools
  const integrationTools = useIntegrationTools();
  const integrationToolsLoading = useIntegrationToolsLoading();
  const fetchIntegrationToolsBatch = useChatStore(
    (state) => state.fetchIntegrationToolsBatch
  );

  // Build integrationsWithTools from props + store data
  const integrationsWithTools = useMemo<IntegrationWithTools[]>(() => {
    return integrations.map((integration) => ({
      integration,
      tools: integrationTools[integration.id] || [],
    }));
  }, [integrations, integrationTools]);

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchIntegrationToolsBatch(true);
    setIsRefreshing(false);
  };

  // Overall loading state
  const isLoading = loading || integrationToolsLoading;

  // Filter integrations and tools based on search query
  const filteredIntegrations = useMemo(() => {
    if (!searchQuery.trim()) return integrationsWithTools;

    const query = searchQuery.toLowerCase();
    return integrationsWithTools.filter((item) => {
      // Match integration name
      if (item.integration.name.toLowerCase().includes(query)) return true;
      // Match any tool name or description
      return item.tools.some(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.slug.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query)
      );
    });
  }, [integrationsWithTools, searchQuery]);

  // Count selected tools for an integration
  const getSelectedToolsCount = useCallback(
    (integrationName: string) => {
      return selectedTools?.[integrationName]?.tools?.length || 0;
    },
    [selectedTools]
  );

  // Check if integration has any selected tools
  const hasSelectedTools = useCallback(
    (integrationName: string) => {
      return getSelectedToolsCount(integrationName) > 0;
    },
    [getSelectedToolsCount]
  );

  // Toggle expand/collapse
  const toggleExpand = useCallback((integrationId: string) => {
    setExpandedIntegrations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(integrationId)) {
        newSet.delete(integrationId);
      } else {
        newSet.add(integrationId);
      }
      return newSet;
    });
  }, []);

  // Toggle single tool selection
  const toggleTool = useCallback(
    (integrationName: string, toolSlug: string) => {
      const currentTools = selectedTools?.[integrationName]?.tools || [];
      let newTools: string[];

      if (currentTools.includes(toolSlug)) {
        newTools = currentTools.filter((t) => t !== toolSlug);
      } else {
        newTools = [...currentTools, toolSlug];
      }

      const newSelectedTools = { ...selectedTools };

      if (newTools.length > 0) {
        newSelectedTools[integrationName] = { tools: newTools };
      } else {
        delete newSelectedTools[integrationName];
      }

      onSelectedToolsChange(
        Object.keys(newSelectedTools).length > 0 ? newSelectedTools : null
      );
    },
    [selectedTools, onSelectedToolsChange]
  );

  // Toggle all tools for an integration
  const toggleAllTools = useCallback(
    (integrationName: string, allToolSlugs: string[]) => {
      const currentTools = selectedTools?.[integrationName]?.tools || [];
      const allSelected = allToolSlugs.every((slug) =>
        currentTools.includes(slug)
      );

      const newSelectedTools = { ...selectedTools };

      if (allSelected) {
        // Deselect all
        delete newSelectedTools[integrationName];
      } else {
        // Select all
        newSelectedTools[integrationName] = { tools: allToolSlugs };
      }

      onSelectedToolsChange(
        Object.keys(newSelectedTools).length > 0 ? newSelectedTools : null
      );
    },
    [selectedTools, onSelectedToolsChange]
  );

  // Check if tool is selected
  const isToolSelected = useCallback(
    (integrationName: string, toolSlug: string) => {
      return (
        selectedTools?.[integrationName]?.tools?.includes(toolSlug) || false
      );
    },
    [selectedTools]
  );

  // Count total selected tools
  const totalSelectedTools = useMemo(() => {
    if (!selectedTools) return 0;
    return Object.values(selectedTools).reduce(
      (sum, item) => sum + (item.tools?.length || 0),
      0
    );
  }, [selectedTools]);

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Integrations & Tools (Optional)</Label>
        <div className="flex items-center gap-2">
          {totalSelectedTools > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalSelectedTools} tool{totalSelectedTools !== 1 ? "s" : ""}{" "}
              selected
            </Badge>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh tools"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search integrations or tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Integrations List */}
      <div className="border rounded-lg p-2 max-h-[400px] overflow-auto bg-muted/30">
        {filteredIntegrations.length === 0 ? (
          <div className="text-center py-8">
            <Plug className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "No integrations or tools found."
                : "No integrations available."}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredIntegrations.map(({ integration, tools }) => {
              const isExpanded = expandedIntegrations.has(integration.id);
              const selectedCount = getSelectedToolsCount(integration.name);
              const allToolSlugs = tools.map((t) => t.slug);
              const allSelected =
                allToolSlugs.length > 0 &&
                allToolSlugs.every((slug) =>
                  isToolSelected(integration.name, slug)
                );

              return (
                <Collapsible
                  key={integration.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpand(integration.id)}
                >
                  {/* Integration Header */}
                  <CollapsibleTrigger asChild>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                        hasSelectedTools(integration.name)
                          ? "bg-primary/10 hover:bg-primary/15"
                          : "hover:bg-accent"
                      }`}
                    >
                      {/* Expand/Collapse Icon */}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}

                      {/* Integration Logo */}
                      {integration.logo ? (
                        <img
                          src={integration.logo}
                          alt={integration.name}
                          className="w-6 h-6 rounded flex-shrink-0 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const icon = e.currentTarget
                              .nextElementSibling as HTMLElement;
                            if (icon) icon.style.display = "block";
                          }}
                        />
                      ) : null}
                      <Plug
                        className="w-6 h-6 text-primary flex-shrink-0"
                        style={{ display: integration.logo ? "none" : "block" }}
                      />

                      {/* Integration Name */}
                      <span className="font-medium text-sm flex-1">
                        {integration.name}
                      </span>

                      {/* Tools Count Badge */}
                      <div className="flex items-center gap-2">
                        {selectedCount > 0 && (
                          <Badge variant="default" className="text-xs">
                            {selectedCount} selected
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {`${tools.length} tools`}
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  {/* Tools List */}
                  <CollapsibleContent>
                    <div className="pl-8 pr-2 py-2 space-y-1 border-l-2 border-muted ml-5">
                      {tools.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2 px-2">
                          No tools available for this integration.
                        </p>
                      ) : (
                        <>
                          {/* Select All Button */}
                          <div className="flex justify-end pb-1 border-b mb-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAllTools(integration.name, allToolSlugs);
                              }}
                              className="text-xs text-primary hover:underline"
                            >
                              {allSelected ? "Deselect All" : "Select All"}
                            </button>
                          </div>

                          {/* Tools */}
                          {tools.map((tool) => {
                            const isSelected = isToolSelected(
                              integration.name,
                              tool.slug
                            );
                            return (
                              <div
                                key={tool.slug}
                                className="flex items-start gap-3 py-2 px-2 rounded-md hover:bg-accent"
                              >
                                <Checkbox
                                  id={`${idPrefix}-${integration.id}-${tool.slug}`}
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    toggleTool(integration.name, tool.slug)
                                  }
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
                                    <label
                                      htmlFor={`${idPrefix}-${integration.id}-${tool.slug}`}
                                      className="cursor-pointer text-sm font-medium"
                                    >
                                      {tool.name}
                                    </label>
                                    {tool.description && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                          </TooltipTrigger>
                                          <TooltipContent
                                            side="right"
                                            className="max-w-xs"
                                          >
                                            <p className="text-xs">
                                              {tool.description}
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate pl-5">
                                    {tool.slug}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
