import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Search, Wrench } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChatService } from "../services";
import type { IntegrationConfig, ToolItem } from "../types";

interface ToolSelectorProps {
  integrations: IntegrationConfig[];
  selectedIntegrationIds: string[] | null;
  selectedToolSlugs: string[] | null;
  onToolSelectionChange: (selectedSlugs: string[]) => void;
  loading?: boolean;
  idPrefix?: string;
}

interface ToolWithIntegration extends ToolItem {
  integrationId: string;
  integrationName: string;
  integrationLogo: string;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({
  integrations,
  selectedIntegrationIds,
  selectedToolSlugs,
  onToolSelectionChange,
  loading = false,
  idPrefix = "tool",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [toolsLoading, setToolsLoading] = useState(false);
  const [allTools, setAllTools] = useState<ToolWithIntegration[]>([]);

  // Fetch tools when selected integrations change
  useEffect(() => {
    const fetchToolsForIntegrations = async () => {
      if (!selectedIntegrationIds || selectedIntegrationIds.length === 0) {
        setAllTools([]);
        return;
      }

      setToolsLoading(true);
      try {
        const toolsPromises = selectedIntegrationIds.map(
          async (integrationId) => {
            const integration = integrations.find(
              (i) => i.id === integrationId
            );
            if (!integration) return [];

            const tools = await ChatService.getAvailableTools(integrationId);
            if (!tools) return [];

            return tools.map((tool) => ({
              ...tool,
              integrationId: integration.id,
              integrationName: integration.name,
              integrationLogo: integration.logo,
            }));
          }
        );

        const toolsArrays = await Promise.all(toolsPromises);
        const flatTools = toolsArrays.flat();
        setAllTools(flatTools);
      } catch (error) {
        console.error("Failed to fetch tools:", error);
        setAllTools([]);
      } finally {
        setToolsLoading(false);
      }
    };

    fetchToolsForIntegrations();
  }, [selectedIntegrationIds, integrations]);

  // Filter tools based on search query
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return allTools;
    const query = searchQuery.toLowerCase();
    return allTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.slug.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
    );
  }, [allTools, searchQuery]);

  // Group tools by integration
  const groupedTools = useMemo(() => {
    const groups: Record<string, ToolWithIntegration[]> = {};
    filteredTools.forEach((tool) => {
      if (!groups[tool.integrationId]) {
        groups[tool.integrationId] = [];
      }
      groups[tool.integrationId].push(tool);
    });
    return groups;
  }, [filteredTools]);

  const handleToggle = useCallback(
    (toolSlug: string) => {
      const currentSlugs = selectedToolSlugs || [];
      if (currentSlugs.includes(toolSlug)) {
        onToolSelectionChange(currentSlugs.filter((s) => s !== toolSlug));
      } else {
        onToolSelectionChange([...currentSlugs, toolSlug]);
      }
    },
    [selectedToolSlugs, onToolSelectionChange]
  );

  const handleSelectAll = useCallback(
    (integrationId: string) => {
      const integrationTools = allTools.filter(
        (t) => t.integrationId === integrationId
      );
      const integrationSlugs = integrationTools.map((t) => t.slug);
      const currentSlugs = selectedToolSlugs || [];

      // Check if all tools from this integration are selected
      const allSelected = integrationSlugs.every((slug) =>
        currentSlugs.includes(slug)
      );

      if (allSelected) {
        // Deselect all tools from this integration
        onToolSelectionChange(
          currentSlugs.filter((s) => !integrationSlugs.includes(s))
        );
      } else {
        // Select all tools from this integration
        const newSlugs = [...currentSlugs];
        integrationSlugs.forEach((slug) => {
          if (!newSlugs.includes(slug)) {
            newSlugs.push(slug);
          }
        });
        onToolSelectionChange(newSlugs);
      }
    },
    [allTools, selectedToolSlugs, onToolSelectionChange]
  );

  if (loading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!selectedIntegrationIds || selectedIntegrationIds.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Tools (Optional)</Label>
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="text-center py-8">
            <Wrench className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Please select at least one integration first to configure tools.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Tools (Optional)</Label>
        {selectedToolSlugs && selectedToolSlugs.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selectedToolSlugs.length} selected
          </Badge>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tools List */}
      <div className="border rounded-lg p-4 max-h-80 overflow-auto bg-muted/30">
        {toolsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-8">
            <Wrench className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "No tools found matching your search."
                : "No tools available for selected integrations."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedTools).map(([integrationId, tools]) => {
              const integration = integrations.find(
                (i) => i.id === integrationId
              );
              if (!integration) return null;

              const allSelected = tools.every((t) =>
                selectedToolSlugs?.includes(t.slug)
              );

              return (
                <div key={integrationId} className="space-y-2">
                  {/* Integration Header */}
                  <div className="flex items-center gap-2 pb-1 border-b">
                    {integration.logo ? (
                      <img
                        src={integration.logo}
                        alt={integration.name}
                        className="w-5 h-5 rounded object-contain"
                      />
                    ) : (
                      <Wrench className="w-5 h-5 text-primary" />
                    )}
                    <span className="font-medium text-sm flex-1">
                      {integration.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectAll(integrationId)}
                      className="text-xs text-primary hover:underline"
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </button>
                    <Badge variant="outline" className="text-xs">
                      {tools.length} tools
                    </Badge>
                  </div>

                  {/* Tools */}
                  <div className="space-y-1 pl-2">
                    {tools.map((tool) => {
                      const isSelected =
                        selectedToolSlugs?.includes(tool.slug) || false;
                      return (
                        <div
                          key={tool.slug}
                          className="flex items-start gap-3 py-2 px-2 rounded-md hover:bg-accent"
                        >
                          <Checkbox
                            id={`${idPrefix}-${tool.slug}`}
                            checked={isSelected}
                            onCheckedChange={() => handleToggle(tool.slug)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor={`${idPrefix}-${tool.slug}`}
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
                            <p className="text-xs text-muted-foreground truncate">
                              {tool.slug}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
