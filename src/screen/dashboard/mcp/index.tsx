import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Server, Plus, RefreshCw } from "lucide-react";
import {
  MCPFormDialog,
  MCPList,
  MCPToolsSheet,
} from "./components";
import { MCPService, type MCPConfig, type MCPDetail, type MCPListItem, type MCPTool } from "./mcp-service";

export default function MCP() {
  const { getToken } = useAuth();
  const [mcps, setMcps] = useState<MCPListItem[]>([]);
  const [isLoadingMcps, setIsLoadingMcps] = useState(false);
  const [isMCPFormOpen, setIsMCPFormOpen] = useState(false);
  const [isSubmittingMCP, setIsSubmittingMCP] = useState(false);
  const [selectedMCP, setSelectedMCP] = useState<MCPListItem | null>(null);
  const [mcpTools, setMcpTools] = useState<MCPTool[]>([]);
  const [isLoadingMcpTools, setIsLoadingMcpTools] = useState(false);
  const [isMcpToolsSheetOpen, setIsMcpToolsSheetOpen] = useState(false);
  const [mcpSearchQuery, setMcpSearchQuery] = useState("");
  const [deletingMCPId, setDeletingMCPId] = useState<string | null>(null);
  const [syncingMCPId, setSyncingMCPId] = useState<string | null>(null);
  const [editingMCP, setEditingMCP] = useState<MCPDetail | null>(null);

  // Load MCPs on mount
  useEffect(() => {
    const loadMcps = async () => {
      const token = await getToken();
      if (token) {
        await fetchMcps(token);
      }
    };
    loadMcps();
  }, [getToken]);

  const fetchMcps = async (token: string) => {
    setIsLoadingMcps(true);
    try {
      const data = await MCPService.getMCPs(token);
      if (data) {
        setMcps(data);
      }
    } catch (error: any) {
      toast.error("Failed to load MCPs", {
        description: error?.message || "An error occurred while loading MCPs.",
      });
    } finally {
      setIsLoadingMcps(false);
    }
  };

  const handleRefresh = async () => {
    const token = await getToken();
    if (token) {
      await fetchMcps(token);
    }
  };

  const handleCreateMCP = async (config: MCPConfig) => {
    setIsSubmittingMCP(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required", {
          description: "Please sign in to create MCP configuration.",
        });
        return;
      }

      const mcp = await MCPService.createMCP(config, token);
      if (mcp) {
        // Extract server name from config
        const serverName = Object.keys(config.config)[0] || "Unknown";
        const action = editingMCP ? "updated" : "created";
        toast.success(`MCP configuration ${action} successfully`, {
          description: `${serverName} has been ${action} and validated.`,
        });
        setIsMCPFormOpen(false);
        setEditingMCP(null);
        await fetchMcps(token);
      } else {
        toast.error("Failed to save MCP configuration", {
          description: "The configuration could not be validated or saved.",
        });
      }
    } catch (error: any) {
      toast.error("Failed to save MCP configuration", {
        description: error?.message || "An error occurred while saving the configuration.",
      });
    } finally {
      setIsSubmittingMCP(false);
    }
  };

  const handleEditMCP = async (mcp: MCPListItem) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required", {
          description: "Please sign in to edit MCP configuration.",
        });
        return;
      }

      // Fetch full MCP detail
      const mcpDetail = await MCPService.getMCP(mcp.id, token);
      if (mcpDetail) {
        setEditingMCP(mcpDetail);
        setIsMCPFormOpen(true);
      } else {
        toast.error("Failed to load MCP configuration", {
          description: "An error occurred while loading the configuration.",
        });
      }
    } catch (error: any) {
      toast.error("Failed to load MCP configuration", {
        description: error?.message || "An error occurred while loading the configuration.",
      });
    }
  };

  const handleViewMcpTools = async (mcp: MCPListItem) => {
    setSelectedMCP(mcp);
    setIsMcpToolsSheetOpen(true);
    setMcpSearchQuery("");
    setIsLoadingMcpTools(true);

    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required", {
          description: "Please sign in to view tools.",
        });
        setIsMcpToolsSheetOpen(false);
        setSelectedMCP(null);
        return;
      }

      const tools = await MCPService.getMCPTools(mcp.id, token);
      if (tools) {
        setMcpTools(tools);
      } else {
        toast.error("Failed to load tools", {
          description: "An error occurred while loading tools.",
        });
        setIsMcpToolsSheetOpen(false);
        setSelectedMCP(null);
      }
    } catch (error: any) {
      toast.error("Failed to load tools", {
        description: error?.message || "An error occurred while loading tools.",
      });
      setIsMcpToolsSheetOpen(false);
      setSelectedMCP(null);
    } finally {
      setIsLoadingMcpTools(false);
    }
  };

  const handleSyncMCP = async (mcp: MCPListItem) => {
    setSyncingMCPId(mcp.id);
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required", {
          description: "Please sign in to sync MCP tools.",
        });
        return;
      }

      const updatedMCP = await MCPService.syncMCPTools(mcp.id, token);
      if (updatedMCP) {
        toast.success("MCP tools synced successfully", {
          description: `${mcp.name} tools have been updated from the MCP server.`,
        });
        await fetchMcps(token);
        // If tools sheet is open for this MCP, refresh tools
        if (selectedMCP?.id === mcp.id && isMcpToolsSheetOpen) {
          const tools = await MCPService.getMCPTools(mcp.id, token);
          if (tools) {
            setMcpTools(tools);
          }
        }
      } else {
        toast.error("Failed to sync MCP tools", {
          description: "An error occurred while syncing tools from the MCP server.",
        });
      }
    } catch (error: any) {
      toast.error("Failed to sync MCP tools", {
        description: error?.message || "An error occurred while syncing tools.",
      });
    } finally {
      setSyncingMCPId(null);
    }
  };

  const handleDeleteMCP = async (mcp: MCPListItem) => {
    if (!confirm(`Are you sure you want to delete "${mcp.name}"?`)) {
      return;
    }

    setDeletingMCPId(mcp.id);
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required", {
          description: "Please sign in to delete MCP configuration.",
        });
        return;
      }

      const success = await MCPService.deleteMCP(mcp.id, token);
      if (success) {
        toast.success("MCP configuration deleted successfully", {
          description: `${mcp.name} has been deleted.`,
        });
        await fetchMcps(token);
      } else {
        toast.error("Failed to delete MCP configuration", {
          description: "An error occurred while deleting the configuration.",
        });
      }
    } catch (error: any) {
      toast.error("Failed to delete MCP configuration", {
        description: error?.message || "An error occurred while deleting the configuration.",
      });
    } finally {
      setDeletingMCPId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-card shadow-sm rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                MCP Servers
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage Model Context Protocol (MCP) server configurations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoadingMcps}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoadingMcps ? "animate-spin" : ""}`}
              />
            </Button>
            <Button onClick={() => setIsMCPFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create MCP
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card shadow-sm rounded-lg border p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Total Configurations</div>
          </div>
          <div className="text-2xl font-bold">{mcps.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {mcps.filter((m) => m.tools_count > 0).length} with tools
          </p>
        </div>
        <div className="bg-card shadow-sm rounded-lg border p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Total Tools</div>
          </div>
          <div className="text-2xl font-bold">
            {mcps.reduce((sum, m) => sum + m.tools_count, 0)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Available tools</p>
        </div>
        <div className="bg-card shadow-sm rounded-lg border p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Transport Types</div>
          </div>
          <div className="text-2xl font-bold">
            {new Set(mcps.map((m) => m.transport)).size}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Different transports</p>
        </div>
      </div>

      {/* MCP List */}
      <MCPList
        mcps={mcps}
        isLoading={isLoadingMcps}
        onRefresh={handleRefresh}
        onViewTools={handleViewMcpTools}
        onEdit={handleEditMCP}
        onDelete={handleDeleteMCP}
        onSync={handleSyncMCP}
        deletingId={deletingMCPId}
        syncingId={syncingMCPId}
      />

      {/* MCP Form Dialog */}
      <MCPFormDialog
        open={isMCPFormOpen}
        onOpenChange={(open) => {
          setIsMCPFormOpen(open);
          if (!open) {
            setEditingMCP(null);
          }
        }}
        onSubmit={handleCreateMCP}
        isSubmitting={isSubmittingMCP}
        initialData={editingMCP}
      />

      {/* MCP Tools Sheet */}
      <MCPToolsSheet
        isOpen={isMcpToolsSheetOpen}
        onOpenChange={setIsMcpToolsSheetOpen}
        mcpName={selectedMCP?.name || ""}
        tools={mcpTools}
        isLoading={isLoadingMcpTools}
        searchQuery={mcpSearchQuery}
        onSearchChange={setMcpSearchQuery}
      />
    </div>
  );
}
