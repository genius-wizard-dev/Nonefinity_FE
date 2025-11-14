import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { APIKeyService } from "./services";
import type { APIKey, APIKeyCreateResponse } from "./types";
import { ChatService } from "../chats/services";
import type { ChatConfig } from "../chats/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Key,
  Plus,
  RefreshCw,
  Copy,
  Trash2,
  Ban,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function APIKeysManagement() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [totalKeys, setTotalKeys] = useState(0);
  const [chatConfigs, setChatConfigs] = useState<ChatConfig[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false);
  const [createdAPIKey, setCreatedAPIKey] = useState<APIKeyCreateResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    chat_config_id: "",
    expires_in_days: "",
    permissions: ["chat:read", "chat:write"],
  });

  // Fetch API keys
  const fetchAPIKeys = async () => {
    setLoading(true);
    try {
      const token = (await getToken()) || undefined;
      const result = await APIKeyService.list(0, 100, false, token);

      if (result.success && result.data) {
        setApiKeys(result.data.api_keys);
        setTotalKeys(result.data.total);
      } else {
        toast.error(result.error || "Failed to fetch API keys");
      }
    } catch (error) {
      toast.error("Failed to fetch API keys");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch chat configs
  const fetchChatConfigs = async () => {
    try {
      const result = await ChatService.listConfigs(0, 100);
      if (result) {
        setChatConfigs(result.chat_configs);
      } else {
        toast.error("Failed to fetch chat configs");
      }
    } catch (error) {
      toast.error("Failed to fetch chat configs");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAPIKeys();
    fetchChatConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create API key
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = (await getToken()) || undefined;
      const expiresInDays = formData.expires_in_days ? parseInt(formData.expires_in_days) : undefined;

      const result = await APIKeyService.create(
        {
          name: formData.name,
          chat_config_id: formData.chat_config_id,
          expires_in_days: expiresInDays,
          permissions: formData.permissions,
        },
        token
      );

      if (result.success && result.data) {
        toast.success("API key created successfully!");
        setCreatedAPIKey(result.data);
        setShowAPIKeyDialog(true);
        setIsCreateDialogOpen(false);
        setFormData({
          name: "",
          chat_config_id: "",
          expires_in_days: "",
          permissions: ["chat:read", "chat:write"],
        });
        fetchAPIKeys();
      } else {
        toast.error(result.error || "Failed to create API key");
      }
    } catch (error) {
      toast.error("Failed to create API key");
      console.error(error);
    }
  };

  // Delete API key
  const handleDelete = async () => {
    try {
      const token = (await getToken()) || undefined;
      const result = await APIKeyService.delete(selectedKeyId, token);

      if (result.success) {
        toast.success("API key deleted successfully");
        fetchAPIKeys();
      } else {
        toast.error(result.error || "Failed to delete API key");
      }
    } catch (error) {
      toast.error("Failed to delete API key");
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedKeyId("");
    }
  };

  // Revoke API key
  const handleRevoke = async () => {
    try {
      const token = (await getToken()) || undefined;
      const result = await APIKeyService.revoke(selectedKeyId, token);

      if (result.success) {
        toast.success("API key revoked successfully");
        fetchAPIKeys();
      } else {
        toast.error(result.error || "Failed to revoke API key");
      }
    } catch (error) {
      toast.error("Failed to revoke API key");
      console.error(error);
    } finally {
      setRevokeDialogOpen(false);
      setSelectedKeyId("");
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getStatusBadge = (apiKey: APIKey) => {
    const isExpired = apiKey.expires_at && new Date(apiKey.expires_at) < new Date();

    if (isExpired) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }

    return apiKey.is_active ? (
      <Badge variant="default" className="gap-1 bg-green-600">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="gap-1">
        <XCircle className="h-3 w-3" />
        Inactive
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <Key className="h-6 w-6" />
            <h1 className="text-3xl font-bold">API Keys</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Manage API keys for external integrations and SDK usage
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAPIKeys} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKeys}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {apiKeys.filter((k) => k.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Keys</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiKeys.filter((k) => !k.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>API Key Security</AlertTitle>
        <AlertDescription>
          API keys provide full access to your account. Never share your API keys publicly or commit them to version control. Use environment variables to store them securely.
        </AlertDescription>
      </Alert>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Chat Config ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : apiKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No API keys found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{apiKey.name}</span>
                      <span className="text-sm text-muted-foreground">{apiKey.key_prefix}...</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {apiKey.chat_config_id ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">{apiKey.chat_config_id}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(apiKey.chat_config_id!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(apiKey)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {apiKey.permissions.map((perm) => (
                        <Badge key={perm} variant="outline">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {apiKey.last_used_at ? format(new Date(apiKey.last_used_at), "MMM d, yyyy HH:mm") : "Never"}
                  </TableCell>
                  <TableCell>
                    {apiKey.expires_at ? format(new Date(apiKey.expires_at), "MMM d, yyyy") : "Never"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(apiKey.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {apiKey.is_active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedKeyId(apiKey.id);
                            setRevokeDialogOpen(true);
                          }}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedKeyId(apiKey.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for external integrations
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Production Website"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chat_config">Chat Configuration</Label>
              <Select
                value={formData.chat_config_id}
                onValueChange={(value) => setFormData({ ...formData, chat_config_id: value })}
                required
                disabled={chatConfigs.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={chatConfigs.length === 0 ? "No chat configurations available" : "Select a chat configuration"} />
                </SelectTrigger>
                <SelectContent>
                  {chatConfigs.map((config) => (
                    <SelectItem key={config.id} value={config.id}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {chatConfigs.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Please create a chat configuration first in the Chats section.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires_in_days">Expires In (Days)</Label>
              <Input
                id="expires_in_days"
                type="number"
                placeholder="Leave empty for no expiration"
                value={formData.expires_in_days}
                onChange={(e) => setFormData({ ...formData, expires_in_days: e.target.value })}
                min={1}
                max={365}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permissions">Permissions</Label>
              <Select
                value={formData.permissions[0]}
                onValueChange={(value) => setFormData({ ...formData, permissions: [value] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select permissions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat:read">Chat Read</SelectItem>
                  <SelectItem value="chat:write">Chat Write</SelectItem>
                  <SelectItem value="*">All Permissions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.chat_config_id}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Show API Key Dialog */}
      <Dialog open={showAPIKeyDialog} onOpenChange={setShowAPIKeyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>🔑 API Key Created Successfully!</DialogTitle>
            <DialogDescription>
              Save this key now - you won't be able to see it again
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Save Your API Key</AlertTitle>
              <AlertDescription>
                This is the only time you will see this API key. Make sure to save it in a secure location!
              </AlertDescription>
            </Alert>

            {createdAPIKey && (
              <>
                <div>
                  <Label>Name</Label>
                  <p className="text-sm mt-1">{createdAPIKey.name}</p>
                </div>

                {createdAPIKey.chat_config_id && (
                  <div className="space-y-2">
                    <Label>Chat Config ID</Label>
                    <div className="flex gap-2">
                      <Input
                        value={createdAPIKey.chat_config_id}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(createdAPIKey.chat_config_id!)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Textarea
                    value={createdAPIKey.api_key}
                    readOnly
                    rows={2}
                    className="font-mono text-sm"
                  />
                  <Button
                    className="w-full"
                    onClick={() => copyToClipboard(createdAPIKey.api_key)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>SDK Configuration</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">Use this API key with the Nonefinity SDK:</p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-auto">
{`import { NonefinityClient } from "@nonefinity/ai-sdk";

const client = new NonefinityClient({
  apiUrl: "${window.location.origin}",
  apiKey: "${createdAPIKey.api_key}"${createdAPIKey.chat_config_id ? `,
  chatConfigId: "${createdAPIKey.chat_config_id}"` : ''}
});`}
                    </pre>
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setShowAPIKeyDialog(false);
              setCreatedAPIKey(null);
            }}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the API key and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the API key immediately. The key will no longer work for API requests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke}>
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
