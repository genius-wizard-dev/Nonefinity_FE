import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Server, Plus, RefreshCw, Trash2, Edit, Play, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Mock API service
const MCPService = {
  async getServers() {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      servers: [
        {
          id: "1",
          name: "GitHub MCP Server",
          type: "github",
          status: "running",
          endpoint: "https://mcp.example.com/github",
          description: "Model Context Protocol server for GitHub integration",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T14:30:00Z",
        },
        {
          id: "2",
          name: "Slack MCP Server",
          type: "slack",
          status: "stopped",
          endpoint: "https://mcp.example.com/slack",
          description: "MCP server for Slack workspace communication",
          created_at: "2024-01-10T09:00:00Z",
          updated_at: "2024-01-18T11:20:00Z",
        },
        {
          id: "3",
          name: "Database MCP Server",
          type: "database",
          status: "running",
          endpoint: "https://mcp.example.com/db",
          description: "Database connection via MCP protocol",
          created_at: "2024-01-05T08:00:00Z",
          updated_at: "2024-01-12T16:45:00Z",
        },
      ],
    };
  },

  async createServer(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, server: { id: Date.now().toString(), ...data } };
  },

  async updateServer(id: string, data: any) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
  },

  async deleteServer(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
  },

  async toggleServerStatus(id: string, status: string) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
  },
};

interface MCPServer {
  id: string;
  name: string;
  type: string;
  status: "running" | "stopped";
  endpoint: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function MCP() {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchServers = async () => {
    setLoading(true);
    try {
      const response = await MCPService.getServers();
      setServers(response.servers);
    } catch (error) {
      toast.error("Failed to fetch MCP servers", {
        description: "Could not load MCP servers. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await MCPService.deleteServer(id);
      setServers(servers.filter((item) => item.id !== id));
      toast.success("MCP server deleted", {
        description: "The MCP server has been removed.",
      });
    } catch (error) {
      toast.error("Failed to delete MCP server", {
        description: "Could not delete the server. Please try again.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setTogglingId(id);
    try {
      const newStatus = currentStatus === "running" ? "stopped" : "running";
      await MCPService.toggleServerStatus(id, newStatus);
      setServers(
        servers.map((item) =>
          item.id === id
            ? { ...item, status: newStatus as "running" | "stopped" }
            : item
        )
      );
      toast.success("Server status updated", {
        description: `MCP server is now ${newStatus}.`,
      });
    } catch (error) {
      toast.error("Failed to update server status", {
        description: "Could not update the status. Please try again.",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
                Manage Model Context Protocol (MCP) servers and connections
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchServers}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add MCP Server
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servers.length}</div>
            <p className="text-xs text-muted-foreground">
              {servers.filter((s) => s.status === "running").length} running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {servers.filter((s) => s.status === "running").length}
            </div>
            <p className="text-xs text-muted-foreground">Active servers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stopped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {servers.filter((s) => s.status === "stopped").length}
            </div>
            <p className="text-xs text-muted-foreground">Inactive servers</p>
          </CardContent>
        </Card>
      </div>

      {/* Servers Table */}
      <Card>
        <CardHeader>
          <CardTitle>MCP Server List</CardTitle>
          <CardDescription>
            Manage and configure your MCP servers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : servers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No MCP servers found</p>
              <Button className="mt-4" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First MCP Server
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servers.map((server) => (
                  <TableRow key={server.id}>
                    <TableCell className="font-medium">{server.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{server.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={server.status === "running" ? "default" : "secondary"}
                      >
                        {server.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {server.endpoint}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {server.description}
                    </TableCell>
                    <TableCell>{formatDate(server.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(server.id, server.status)}
                          disabled={togglingId === server.id}
                          title={server.status === "running" ? "Stop" : "Start"}
                        >
                          {server.status === "running" ? (
                            <Square className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={togglingId === server.id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(server.id)}
                          disabled={deletingId === server.id}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

