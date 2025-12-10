import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Pencil, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import type { MCPListItem } from "../mcp-service";

interface MCPListProps {
  mcps: MCPListItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onViewTools: (mcp: MCPListItem) => void;
  onEdit?: (mcp: MCPListItem) => void;
  onDelete: (mcp: MCPListItem) => void;
  onSync?: (mcp: MCPListItem) => void;
  deletingId?: string | null;
  syncingId?: string | null;
}

export function MCPList({
  mcps,
  isLoading,
  onRefresh,
  onViewTools,
  onEdit,
  onDelete,
  onSync,
  deletingId,
  syncingId,
}: MCPListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>MCP Configurations</CardTitle>
        <CardDescription>
          Manage your Model Context Protocol (MCP) server configurations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : mcps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No MCP configurations found</p>
            <Button className="mt-4" variant="outline" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Transport</TableHead>
                <TableHead>Tools</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mcps.map((mcp) => (
                <TableRow key={mcp.id}>
                  <TableCell className="font-medium">{mcp.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{mcp.transport}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{mcp.tools_count} tools</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewTools(mcp)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Tools
                      </Button>
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(mcp)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                      {onSync && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSync(mcp)}
                          disabled={syncingId === mcp.id}
                        >
                          {syncingId === mcp.id ? (
                            <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4 mr-2" />
                          )}
                          Sync
                        </Button>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={mcp.is_used ? 0 : undefined}>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDelete(mcp)}
                                disabled={deletingId === mcp.id}
                              >
                                {deletingId === mcp.id ? (
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Delete
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {mcp.is_used && mcp.used_by?.length > 0 && (
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-sm">
                                In use by:{" "}
                                {mcp.used_by
                                  .slice(0, 3)
                                  .map((c) => c.name)
                                  .join(", ")}
                                {mcp.used_by.length > 3 &&
                                  ` +${mcp.used_by.length - 3} more`}
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
