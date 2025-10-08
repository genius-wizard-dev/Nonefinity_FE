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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Check,
  Copy,
  Edit,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCredentialStore } from "./store";
import type { CredentialFormData } from "./type";

function ManageAICredentials() {
  const {
    providers,
    credentials,
    loading,
    fetchProviders,
    fetchCredentials,
    createCredential,
    updateCredential,
    deleteCredential,
  } = useCredentialStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingCredential, setEditingCredential] = useState<any>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addingCredential, setAddingCredential] = useState(false);
  const [editingCredentialLoading, setEditingCredentialLoading] =
    useState(false);
  const [deletingCredential, setDeletingCredential] = useState(false);
  const [deletingCredentialId, setDeletingCredentialId] = useState<
    string | null
  >(null);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  const [formData, setFormData] = useState<CredentialFormData>({
    name: "",
    provider_id: "",
    api_key: "",
    base_url: "",
  });

  // Load data on component mount
  useEffect(() => {
    fetchProviders();
    fetchCredentials();
  }, [fetchProviders, fetchCredentials]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (field === "provider_id") {
        newData.base_url = "";
      }

      return newData;
    });
  };

  // Get the selected provider's default base URL
  const getSelectedProvider = () => {
    return providers.find((p) => p.id === formData.provider_id);
  };

  const selectedProvider = getSelectedProvider();

  // Validation for add form
  const isAddFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.provider_id !== "" &&
      formData.api_key.trim() !== ""
    );
  };

  // Check if edit form has changes
  const hasEditChanges = () => {
    if (!editingCredential) return false;

    const hasNameChange = formData.name !== editingCredential.name;
    const hasProviderChange =
      formData.provider_id !== editingCredential.provider_id;
    const hasApiKeyChange =
      formData.api_key.trim() !== "" &&
      formData.api_key !== (editingCredential.api_key || "");
    const hasBaseUrlChange =
      formData.base_url !== (editingCredential.base_url || "");

    // If credential is in use, only allow name, api_key, and base_url changes
    if (editingCredential.usage_count > 0) {
      return hasNameChange || hasApiKeyChange || hasBaseUrlChange;
    }

    return (
      hasNameChange || hasProviderChange || hasApiKeyChange || hasBaseUrlChange
    );
  };

  const handleAddCredential = async () => {
    setAddingCredential(true);
    try {
      await createCredential(formData);
      setFormData({ name: "", provider_id: "", api_key: "", base_url: "" });
      setIsAddDialogOpen(false);
      toast.success("Credential created successfully", {
        description: `${formData.name} has been added to your credentials.`,
      });
    } catch (error: any) {
      toast.error("Failed to create credential", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred. Please try again.",
      });
    } finally {
      setAddingCredential(false);
    }
  };

  const handleOpenAddDialog = () => {
    setFormData({ name: "", provider_id: "", api_key: "", base_url: "" });
    setIsAddDialogOpen(true);
  };

  const handleEditCredential = async () => {
    if (!editingCredential) return;

    setEditingCredentialLoading(true);
    try {
      const updateData: any = {};

      // Only include fields that have changed
      if (formData.name !== editingCredential.name) {
        updateData.name = formData.name;
      }

      // Only allow provider changes if credential is not in use
      if (
        editingCredential.usage_count === 0 &&
        formData.provider_id !== editingCredential.provider_id
      ) {
        updateData.provider_id = formData.provider_id;
      }

      if (
        formData.api_key.trim() !== "" &&
        formData.api_key !== (editingCredential.api_key || "")
      ) {
        updateData.api_key = formData.api_key;
      }

      if (formData.base_url !== (editingCredential.base_url || "")) {
        updateData.base_url = formData.base_url;
      }

      await updateCredential(editingCredential.id, updateData);
      setFormData({ name: "", provider_id: "", api_key: "", base_url: "" });
      setEditingCredential(null);
      setIsEditDialogOpen(false);
      toast.success("Credential updated successfully", {
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      toast.error("Failed to update credential", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred. Please try again.",
      });
    } finally {
      setEditingCredentialLoading(false);
    }
  };

  const handleCloseAddDialog = () => {
    setFormData({ name: "", provider_id: "", api_key: "", base_url: "" });
    setIsAddDialogOpen(false);
  };

  const handleCloseEditDialog = () => {
    setFormData({ name: "", provider_id: "", api_key: "", base_url: "" });
    setEditingCredential(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteCredential = async () => {
    if (!deleteId) return;
    setDeletingCredential(true);
    try {
      await deleteCredential(deleteId);
      setDeleteId(null);
      toast.success("Credential deleted", {
        description: "The credential has been permanently removed.",
      });
    } catch (error: any) {
      toast.error("Failed to delete credential", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred. Please try again.",
      });
    } finally {
      setDeletingCredential(false);
    }
  };

  const handleDirectDelete = async (credentialId: string) => {
    setDeletingCredentialId(credentialId);
    try {
      await deleteCredential(credentialId);
      toast.success("Credential deleted", {
        description: "The credential has been permanently removed.",
      });
    } catch (error: any) {
      toast.error("Failed to delete credential", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred. Please try again.",
      });
    } finally {
      setDeletingCredentialId(null);
    }
  };

  const handleToggleStatus = async (
    credentialId: string,
    currentStatus: boolean
  ) => {
    setTogglingStatus(credentialId);

    try {
      await updateCredential(credentialId, { is_active: !currentStatus });
      toast.success("Status updated successfully", {
        description: `Credential is now ${
          !currentStatus ? "active" : "inactive"
        }.`,
      });
    } catch (error: any) {
      toast.error("Failed to update status", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred. Please try again.",
      });
    } finally {
      setTogglingStatus(null);
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = (id: string, apiKey: string) => {
    navigator.clipboard.writeText(apiKey).then(
      () => {
        setCopiedId(id);
        toast.success("API key copied", {
          description: "The API key has been copied to your clipboard.",
        });
        setTimeout(() => setCopiedId(null), 2000);
      },
      () => {
        toast.error("Failed to copy", {
          description: "Could not copy to clipboard. Please try again.",
        });
      }
    );
  };

  const openEditDialog = (credential: any) => {
    setEditingCredential(credential);
    setFormData({
      name: credential.name,
      provider_id: credential.provider_id,
      api_key: credential.api_key,
      base_url: credential.base_url,
    });
    setIsEditDialogOpen(true);
  };

  const maskApiKey = (key: string) => {
    if (!key || typeof key !== "string") return "••••••••";
    if (key.length <= 8) return "••••••••";
    return key.substring(0, 8) + "..." + "••••••••";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-card shadow-sm rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                AI Credentials
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your AI provider API keys and credentials
              </p>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={loading} onClick={handleOpenAddDialog}>
                <Plus className="h-4 w-4" />
                Add Credential
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Add New AI Credential
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Add a new API key for your AI provider
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Credential Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., OpenAI Production"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select
                    value={formData.provider_id}
                    onValueChange={(value) =>
                      handleInputChange("provider_id", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div className="flex items-center gap-2">
                            <span>{provider.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {provider.provider}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your API key"
                    value={formData.api_key}
                    onChange={(e) =>
                      handleInputChange("api_key", e.target.value)
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleCloseAddDialog}
                  disabled={addingCredential}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCredential}
                  disabled={addingCredential || !isAddFormValid()}
                >
                  {addingCredential && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Add Credential
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card shadow-sm rounded-lg border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading credentials...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="font-semibold text-foreground">
                  Name
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Provider
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  API Key
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Active
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Created
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Base URL
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Usage Count
                </TableHead>
                <TableHead className="w-[70px] font-semibold text-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credentials.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No credentials found. Add your first credential to get
                    started.
                  </TableCell>
                </TableRow>
              ) : (
                credentials.map((credential) => (
                  <TableRow
                    key={credential.id}
                    className="border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">
                      {credential.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {credential.provider_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono">
                          {visibleKeys.has(credential.id)
                            ? "••••••••••••••••"
                            : maskApiKey(credential.api_key)}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => toggleKeyVisibility(credential.id)}
                        >
                          {visibleKeys.has(credential.id) ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() =>
                            copyToClipboard(credential.id, credential.api_key)
                          }
                        >
                          {copiedId === credential.id ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={credential.is_active}
                          onCheckedChange={() =>
                            handleToggleStatus(
                              credential.id,
                              credential.is_active
                            )
                          }
                          disabled={
                            togglingStatus === credential.id ||
                            credential.usage_count > 0
                          }
                        />
                        {togglingStatus === credential.id && (
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(credential.created_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="text-sm">
                        {credential.base_url || (
                          <span className="text-muted-foreground/60">
                            Default
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {credential.usage_count}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(credential)}
                          aria-label="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600"
                          onClick={() => handleDirectDelete(credential.id)}
                          aria-label="Delete"
                          disabled={
                            credential.usage_count > 0 ||
                            deletingCredentialId === credential.id
                          }
                        >
                          {deletingCredentialId === credential.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit AI Credential
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingCredential?.usage_count > 0 ? (
                <span>
                  Update your AI provider credentials. Some fields are
                  restricted when credential is in use.
                </span>
              ) : (
                "Update your AI provider credentials"
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Credential Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-provider">Provider</Label>
              <Select
                value={formData.provider_id}
                onValueChange={(value) =>
                  handleInputChange("provider_id", value)
                }
                disabled={editingCredential?.usage_count > 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex items-center gap-2">
                        <span>{provider.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {provider.provider}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editingCredential?.usage_count > 0 && (
                <p className="text-xs text-muted-foreground">
                  Provider cannot be changed when credential is in use
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-apiKey">API Key</Label>
              <Input
                id="edit-apiKey"
                type="password"
                placeholder="Enter new API key"
                value={formData.api_key}
                onChange={(e) => handleInputChange("api_key", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to keep current API key
              </p>
            </div>
            </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseEditDialog}
              disabled={editingCredentialLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditCredential}
              disabled={editingCredentialLoading || !hasEditChanges()}
            >
              {editingCredentialLoading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the
              credential and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingCredential}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCredential}
              disabled={deletingCredential}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingCredential && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ManageAICredentials;
