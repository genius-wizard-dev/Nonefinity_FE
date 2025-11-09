import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { APIKeyService } from "./services";
import type { APIKey, APIKeyCreateResponse } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false);
  const [createdAPIKey, setCreatedAPIKey] = useState<APIKeyCreateResponse | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    expires_in_days: "",
    permissions: ["chat:read", "chat:write"],
  });

  // Fetch API keys
  const fetchAPIKeys = async () => {
    setLoading(true);
    try {
      const token = await getToken();
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

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  // Create API key
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    try {
      const token = await getToken();
      const result = await APIKeyService.create(
        {
          name: formData.name,
          expires_in_days: formData.expires_in_days ? parseInt(formData.expires_in_days) : null,
          permissions: formData.permissions,
        },
        token
      );

      if (result.success && result.data) {
        toast.success("API key created successfully!");
        setCreatedAPIKey(result.data);
        setShowAPIKeyDialog(true);
        setIsCreateDialogOpen(false);
        setFormData({ name: "", expires_in_days: "", permissions: ["chat:read", "chat:write"] });
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
  const handleDelete = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return;
    }

    try {
      const token = await getToken();
      const result = await APIKeyService.delete(keyId, token);

      if (result.success) {
        toast.success("API key deleted successfully");
        fetchAPIKeys();
      } else {
        toast.error(result.error || "Failed to delete API key");
      }
    } catch (error) {
      toast.error("Failed to delete API key");
      console.error(error);
    }
  };

  // Revoke API key
  const handleRevoke = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key?")) {
      return;
    }

    try {
      const token = await getToken();
      const result = await APIKeyService.revoke(keyId, token);

      if (result.success) {
        toast.success("API key revoked successfully");
        fetchAPIKeys();
      } else {
        toast.error(result.error || "Failed to revoke API key");
      }
    } catch (error) {
      toast.error("Failed to revoke API key");
      console.error(error);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getStatusBadge = (key: APIKey) => {
    const isExpired = key.expires_at && new Date(key.expires_at) < new Date();
    if (isExpired) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }
    return key.is_active ? (
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Key className="h-8 w-8" />
            API Keys
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage API keys for external integrations and SDK usage
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAPIKeys} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKeys}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {apiKeys.filter((k) => k.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {apiKeys.filter((k) => !k.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>API Key Security:</strong> API keys provide full access to your account. Never share
          your API keys publicly or commit them to version control. Use environment variables to store
          them securely.
        </AlertDescription>
      </Alert>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No API keys found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{key.name}</div>
                      <div className="text-sm text-muted-foreground">{key.key_prefix}...</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(key)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {key.permissions.map((perm) => (
                        <Badge key={perm} variant="outline">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {key.last_used_at
                      ? format(new Date(key.last_used_at), "MMM d, yyyy HH:mm")
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {key.expires_at ? format(new Date(key.expires_at), "MMM d, yyyy") : "Never"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(key.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {key.is_active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevoke(key.id)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
              Generate a new API key for external integrations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Production Website"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="expires">Expires In (Days)</Label>
              <Input
                id="expires"
                type="number"
                placeholder="Leave empty for no expiration"
                min="1"
                max="365"
                value={formData.expires_in_days}
                onChange={(e) => setFormData({ ...formData, expires_in_days: e.target.value })}
              />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["chat:read", "chat:write", "*"].map((perm) => (
                  <Badge
                    key={perm}
                    variant={formData.permissions.includes(perm) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (formData.permissions.includes(perm)) {
                        setFormData({
                          ...formData,
                          permissions: formData.permissions.filter((p) => p !== perm),
                        });
                      } else {
                        setFormData({
                          ...formData,
                          permissions: [...formData.permissions, perm],
                        });
                      }
                    }}
                  >
                    {perm}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show API Key Dialog */}
      <Dialog open={showAPIKeyDialog} onOpenChange={setShowAPIKeyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🔑 API Key Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Save this API key - you won't be able to see it again!
            </DialogDescription>
          </DialogHeader>
          {createdAPIKey && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This is the only time you will see this API key. Make sure to save it in a secure
                  location!
                </AlertDescription>
              </Alert>

              <div>
                <Label>Name</Label>
                <p className="text-sm mt-1">{createdAPIKey.name}</p>
              </div>

              <div>
                <Label>API Key</Label>
                <div className="mt-2 space-y-2">
                  <Input
                    value={createdAPIKey.api_key}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => copyToClipboard(createdAPIKey.api_key)}
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>SDK Configuration:</strong>
                  <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                    {`import { NonefinityClient } from "@nonefinity/ai-sdk";

const client = new NonefinityClient({
  apiUrl: "${window.location.origin}",
  apiKey: "${createdAPIKey.api_key}"
});`}
                  </pre>
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                setShowAPIKeyDialog(false);
                setCreatedAPIKey(null);
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
