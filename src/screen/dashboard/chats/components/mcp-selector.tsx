import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Server } from "lucide-react";
import React, { useCallback } from "react";

export interface MCPConfig {
  id: string;
  name: string;
  description?: string;
  server_name: string;
  transport: string;
  tools_count: number;
}

interface MCPSelectorProps {
  mcps: MCPConfig[];
  selectedIds: string[] | null;
  onSelectionChange: (selectedIds: string[]) => void;
  loading?: boolean;
  idPrefix?: string;
}

export const MCPSelector: React.FC<MCPSelectorProps> = ({
  mcps,
  selectedIds,
  onSelectionChange,
  loading = false,
  idPrefix = "mcp",
}) => {
  const handleToggle = useCallback(
    (mcpId: string) => {
      const currentIds = selectedIds || [];
      if (currentIds.includes(mcpId)) {
        onSelectionChange(currentIds.filter((id) => id !== mcpId));
      } else {
        onSelectionChange([...currentIds, mcpId]);
      }
    },
    [selectedIds, onSelectionChange]
  );

  if (loading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <div className="space-y-2">
      <Label>MCP Configurations (Optional)</Label>
      <div className="border rounded-lg p-4 max-h-64 overflow-auto bg-muted/30">
        {mcps.length === 0 ? (
          <div className="text-center py-8">
            <Server className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No MCP configurations available. Please configure MCP servers first.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {mcps.map((mcp) => {
              const isSelected = selectedIds?.includes(mcp.id) || false;
              return (
                <div
                  key={mcp.id}
                  className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-accent"
                >
                  <Checkbox
                    id={`${idPrefix}-${mcp.id}`}
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(mcp.id)}
                  />
                  <Server className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={`${idPrefix}-${mcp.id}`}
                      className="cursor-pointer text-sm font-medium block"
                    >
                      {mcp.name}
                    </label>
                    {mcp.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {mcp.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {mcp.tools_count} tool
                      {mcp.tools_count !== 1 ? "s" : ""} • {mcp.transport}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedIds && selectedIds.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {selectedIds.length} MCP configuration
          {selectedIds.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
};

