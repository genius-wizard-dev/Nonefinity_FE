import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@clerk/clerk-react";
import { format } from "date-fns";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Copy,
  Key,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { APIKeyService } from "./services";
import type { APIKey, APIKeyCreateResponse } from "./types";

const MAX_EXPIRY_DAYS = 30;

interface APIKeyFormState {
  name: string;
  expires_in_days: string;
}

export default function APIKeysManagement() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [totalKeys, setTotalKeys] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false);
  const [createdAPIKey, setCreatedAPIKey] =
    useState<APIKeyCreateResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string>("");
  const [formData, setFormData] = useState<APIKeyFormState>({
    name: "",
    expires_in_days: "",
  });

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
      console.error(error);
      toast.error("Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAPIKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please provide a name for the API key");
      return;
    }

    let expiresInDays: number | undefined;
    if (formData.expires_in_days) {
      const parsed = parseInt(formData.expires_in_days, 10);
      if (Number.isNaN(parsed) || parsed <= 0) {
        toast.error("Expiration must be a positive number of days");
        return;
      }
      expiresInDays = Math.min(parsed, MAX_EXPIRY_DAYS);
      if (parsed > MAX_EXPIRY_DAYS) {
        toast.info(`Expiration limited to ${MAX_EXPIRY_DAYS} days per policy.`);
      }
    }

    try {
      const token = (await getToken()) || undefined;
      const result = await APIKeyService.create(
        {
          name: formData.name.trim(),
          expires_in_days: expiresInDays,
        },
        token
      );

      if (result.success && result.data) {
        toast.success("API key created successfully!");
        setCreatedAPIKey(result.data);
        setShowAPIKeyDialog(true);
        setIsCreateDialogOpen(false);
        setFormData({ name: "", expires_in_days: "" });
        fetchAPIKeys();
      } else {
        toast.error(result.error || "Failed to create API key");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create API key");
    }
  };

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
      console.error(error);
      toast.error("Failed to delete API key");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedKeyId("");
    }
  };

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
      console.error(error);
      toast.error("Failed to revoke API key");
    } finally {
      setRevokeDialogOpen(false);
      setSelectedKeyId("");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getStatusBadge = (apiKey: APIKey) => {
    const isExpired =
      apiKey.expires_at && new Date(apiKey.expires_at) < new Date();

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

  const createDialogDisabled = useMemo(
    () => !formData.name.trim(),
    [formData.name]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <Key className="h-6 w-6" />
            <h1 className="text-3xl font-bold">API Keys</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            API base URL auto-resolves in the SDK — you only need an API key
            now.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAPIKeys} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>
      </div>

      <Alert className="bg-muted/60">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>API Key Security</AlertTitle>
        <AlertDescription>
          Keys grant full access. Store them in environment variables and rotate
          them regularly. Keys can live for up to
          {` ${MAX_EXPIRY_DAYS} `}days.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKeys}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
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
            <CardTitle className="text-sm font-medium">
              Disabled & Expired
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiKeys.filter((k) => !k.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : apiKeys.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  No API keys yet. Generate one to get started.
                </TableCell>
              </TableRow>
            ) : (
              apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{apiKey.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {apiKey.key_prefix}...
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(apiKey)}</TableCell>
                  <TableCell>
                    {apiKey.last_used_at
                      ? format(
                          new Date(apiKey.last_used_at),
                          "MMM d, yyyy HH:mm"
                        )
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    {apiKey.expires_at
                      ? format(new Date(apiKey.expires_at), "MMM d, yyyy")
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(apiKey.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {apiKey.is_active && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
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
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Revoke API key</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
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
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete API key</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setFormData({ name: "", expires_in_days: "" });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate API Key</DialogTitle>
            <DialogDescription>
              Keys inherit full workspace access. Only share with trusted
              systems.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Production Backend"
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                required
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Use something recognizable so you know where this key is used.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires_in_days">Expires In (days)</Label>
              <Input
                id="expires_in_days"
                type="number"
                min={1}
                max={MAX_EXPIRY_DAYS}
                placeholder={`1-${MAX_EXPIRY_DAYS}`}
                value={formData.expires_in_days}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    expires_in_days: event.target.value,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Leave blank for no expiration. Otherwise, keys cannot exceed{" "}
                {MAX_EXPIRY_DAYS} days.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createDialogDisabled}>
                Create Key
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAPIKeyDialog} onOpenChange={setShowAPIKeyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy this key now — it will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 pb-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Save this key securely</AlertTitle>
                <AlertDescription>
                  Consider a password manager or secure secrets vault. You
                  cannot recover the full key later.
                </AlertDescription>
              </Alert>

              {createdAPIKey && (
                <>
                  <div>
                    <Label>Name</Label>
                    <p className="text-sm mt-1">{createdAPIKey.name}</p>
                  </div>
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
                </>
              )}
            </div>
          </ScrollArea>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the key and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Revoked keys stop working immediately but remain in your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke}>Revoke</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
