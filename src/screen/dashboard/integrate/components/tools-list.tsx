import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import type { Tool } from "../types";

interface ToolsListProps {
  tools: Tool[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTools: Set<string>;
  onToggleTool: (toolSlug: string) => void;
  isConnected?: boolean;
  onAddTools?: () => void;
}

export function ToolsList({
  tools,
  isLoading,
  searchQuery,
  onSearchChange,
  selectedTools,
  onToggleTool,
  isConnected = false,
  onAddTools,
}: ToolsListProps) {
  // Count tools with is_selected = true from BE
  const activeToolsCount = tools.filter((tool) => tool.is_selected).length;

  // Get set of tools that are selected from BE
  const beSelectedTools = new Set(
    tools.filter((tool) => tool.is_selected).map((tool) => tool.slug)
  );

  // Check if there are changes (selectedTools differs from BE selected tools)
  const hasChanges =
    selectedTools.size !== beSelectedTools.size ||
    Array.from(selectedTools).some((slug) => !beSelectedTools.has(slug)) ||
    Array.from(beSelectedTools).some((slug) => !selectedTools.has(slug));

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-3/5 border-r flex flex-col min-h-0">
      <div className="p-4 border-b flex-shrink-0">
        <Tabs defaultValue="tools" className="w-full">
          <TabsList>
            <TabsTrigger value="tools">
              Tools {isConnected && activeToolsCount > 0 && `(active ${activeToolsCount})`}
            </TabsTrigger>
            <TabsTrigger value="triggers" disabled>
              Triggers
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tools" className="mt-0"></TabsContent>
        </Tabs>
      </div>

      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          {isConnected && onAddTools && hasChanges && (
            <Button
              onClick={onAddTools}
              className="gap-2 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Update
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
        <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Tools</h3>
        <ScrollArea className="flex-1 min-h-0">
          <div className="pr-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredTools.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery
                  ? "No tools found matching your search"
                  : "No tools available"}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTools.map((tool) => {
                  const isSelected = selectedTools.has(tool.slug);
                  return (
                    <div
                      key={tool.slug}
                      className={`p-4 rounded-lg border transition-all flex items-start gap-3 ${
                        isConnected
                          ? isSelected
                            ? "border-primary bg-primary/5 hover:bg-primary/10 cursor-pointer"
                            : "hover:bg-accent hover:border-accent-foreground/20 cursor-pointer"
                          : "cursor-default"
                      }`}
                      onClick={isConnected ? () => onToggleTool(tool.slug) : undefined}
                    >
                      {isConnected && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleTool(tool.slug)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground">
                          {tool.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                          {tool.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
