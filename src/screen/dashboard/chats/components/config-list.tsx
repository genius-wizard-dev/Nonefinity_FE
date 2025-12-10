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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@clerk/clerk-react";
import { Check, Copy, Edit, MessageSquare, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useChatConfigFormStore } from "../chat-config-form-store";
import { useChatStore, useIntegrations } from "../store";
import type { ChatConfig } from "../types";
import { ConfigSheet } from "./config-sheet";

interface CreateConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateConfigDialog: React.FC<CreateConfigDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { createConfig } = useChatStore();
  const { formData, setSubmitting, resetForm } = useChatConfigFormStore();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.chat_model_id) {
      return;
    }

    // Validate: if embedding_model_id is set, knowledge_store_id must be set too
    if (formData.embedding_model_id && !formData.knowledge_store_id) {
      alert("Knowledge store is required when embedding model is selected");
      return;
    }

    if (formData.knowledge_store_id && !formData.embedding_model_id) {
      alert("Embedding model is required when knowledge store is selected");
      return;
    }

    setSubmitting(true);
    try {
      const config = await createConfig({
        ...formData,
        name: formData.name || "",
        chat_model_id: formData.chat_model_id || "",
        embedding_model_id: formData.embedding_model_id || null,
        knowledge_store_id: formData.knowledge_store_id || null,
        dataset_ids:
          formData.dataset_ids && formData.dataset_ids.length > 0
            ? formData.dataset_ids
            : null,
        instruction_prompt: formData.instruction_prompt || "",
        mcp_ids:
          formData.mcp_ids && formData.mcp_ids.length > 0
            ? formData.mcp_ids
            : null,
        selected_tools: formData.selected_tools || null,
        middleware: formData.middleware || null,
      });

      if (config) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to create config:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfigSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Create Chat Config"
      description="Configure a new chat configuration with AI model and optional knowledge store"
      onSubmit={handleSubmit}
    />
  );
};

interface EditConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ChatConfig | null;
}

export const EditConfigDialog: React.FC<EditConfigDialogProps> = ({
  open,
  onOpenChange,
  config,
}) => {
  const { updateConfig } = useChatStore();
  const { formData, setSubmitting, initializeForm } = useChatConfigFormStore();

  // Initialize form data when dialog opens with a config
  useEffect(() => {
    if (open && config) {
      initializeForm({
        name: config.name,
        chat_model_id: config.chat_model_id,
        embedding_model_id: config.embedding_model_id || null,
        knowledge_store_id: config.knowledge_store_id || null,
        dataset_ids: config.dataset_ids || null,
        instruction_prompt: config.instruction_prompt || "",
        mcp_ids: config.mcp_ids || null,
        selected_tools: config.selected_tools || null,
        middleware: config.middleware || null,
      });
    }
  }, [open, config, initializeForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !formData.name || !formData.chat_model_id) {
      return;
    }

    // Validate: if embedding_model_id is set, knowledge_store_id must be set too
    if (formData.embedding_model_id && !formData.knowledge_store_id) {
      alert("Knowledge store is required when embedding model is selected");
      return;
    }

    if (formData.knowledge_store_id && !formData.embedding_model_id) {
      alert("Embedding model is required when knowledge store is selected");
      return;
    }

    setSubmitting(true);
    try {
      const updatedConfig = await updateConfig(config.id, {
        ...formData,
        embedding_model_id: formData.embedding_model_id || null,
        knowledge_store_id: formData.knowledge_store_id || null,
        dataset_ids:
          formData.dataset_ids && formData.dataset_ids.length > 0
            ? formData.dataset_ids
            : null,
        instruction_prompt: formData.instruction_prompt || "",
        mcp_ids:
          formData.mcp_ids && formData.mcp_ids.length > 0
            ? formData.mcp_ids
            : null,
        selected_tools: formData.selected_tools || null,
        middleware: formData.middleware || null,
      });

      if (updatedConfig) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to update config:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!config) return null;

  return (
    <ConfigSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Chat Config"
      description="Update the chat configuration settings"
      onSubmit={handleSubmit}
      idPrefix="edit-"
    />
  );
};

interface ConfigCardProps {
  config: ChatConfig;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ConfigCard: React.FC<ConfigCardProps> = ({
  config,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyIdAlias = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (config.id_alias) {
      try {
        await navigator.clipboard.writeText(config.id_alias);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 group ${
        isSelected ? "ring-2 ring-primary border-primary" : "border-border/50"
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold leading-none mb-1.5">
                {config.name}
              </CardTitle>
              <CardDescription className="text-xs">
                Created {new Date(config.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit config</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!config.is_used) {
                          onDelete();
                        }
                      }}
                      disabled={config.is_used}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {config.is_used
                      ? "Cannot delete: Config is being used by sessions."
                      : "Delete config"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {config.id_alias && (
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/50 border border-border/50 group/alias w-fit"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[10px] font-mono text-muted-foreground">
                {config.id_alias}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 opacity-0 group-hover/alias:opacity-100 transition-opacity"
                onClick={handleCopyIdAlias}
                title="Copy ID"
              >
                {copied ? (
                  <Check className="w-2.5 h-2.5 text-green-600" />
                ) : (
                  <Copy className="w-2.5 h-2.5 text-muted-foreground" />
                )}
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border text-xs font-medium text-foreground">
              Chat Model
            </div>
            {config.embedding_model_id && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border text-xs font-medium text-foreground">
                Embedding
              </div>
            )}
            {config.knowledge_store_id && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border text-xs font-medium text-foreground">
                Knowledge
              </div>
            )}
            {config.dataset_ids && config.dataset_ids.length > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border text-xs font-medium text-foreground">
                {config.dataset_ids.length} Dataset
                {config.dataset_ids.length > 1 ? "s" : ""}
              </div>
            )}
            {config.instruction_prompt && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border text-xs font-medium text-foreground">
                Custom Prompt
              </div>
            )}
            {config.middleware && config.middleware.length > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border text-xs font-medium text-foreground">
                {config.middleware.length} Middleware
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ConfigListProps {
  onConfigSelect: (config: ChatConfig) => void;
  selectedConfigId?: string;
  searchQuery?: string;
}

export const ConfigList: React.FC<ConfigListProps> = ({
  onConfigSelect,
  selectedConfigId,
  searchQuery = "",
}) => {
  const { getToken } = useAuth();
  const {
    configs,
    configsLoading,
    fetchConfigs,
    deleteConfig,
    fetchChatModels,
    fetchEmbeddingModels,
    fetchDatasets,
    fetchIntegrations,
    fetchMcps,
    fetchIntegrationToolsBatch,
    integrationToolsLastFetch,
  } = useChatStore();
  const integrations = useIntegrations();
  const [editingConfig, setEditingConfig] = useState<ChatConfig | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingConfigId, setDeletingConfigId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter configs based on search query
  const filteredConfigs = React.useMemo(() => {
    if (!searchQuery.trim()) return configs;
    const query = searchQuery.toLowerCase();
    return configs.filter((config) =>
      config.name.toLowerCase().includes(query)
    );
  }, [configs, searchQuery]);

  // Fetch all data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      const token = await getToken();
      // Fetch all data in parallel
      await Promise.all([
        fetchConfigs(),
        fetchChatModels(),
        fetchEmbeddingModels(),
        fetchDatasets(),
        fetchIntegrations(),
        token ? fetchMcps(token) : Promise.resolve(),
      ]);
    };
    fetchAllData();
  }, [
    fetchConfigs,
    fetchChatModels,
    fetchEmbeddingModels,
    fetchDatasets,
    fetchIntegrations,
    fetchMcps,
    getToken,
  ]);

  // Fetch integration tools when integrations are loaded
  useEffect(() => {
    if (integrations.length > 0 && integrationToolsLastFetch === null) {
      fetchIntegrationToolsBatch();
    }
  }, [integrations, integrationToolsLastFetch, fetchIntegrationToolsBatch]);

  const handleDeleteClick = (id: string) => {
    setDeletingConfigId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingConfigId) {
      setIsDeleting(true);
      try {
        await deleteConfig(deletingConfigId);
        setDeletingConfigId(null);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error("Failed to delete config:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeletingConfigId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEdit = (config: ChatConfig) => {
    setEditingConfig(config);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingConfig(null);
  };

  if (configsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No chat configs</h3>
        <p className="text-muted-foreground">
          Create your first chat configuration to get started
        </p>
      </div>
    );
  }

  if (filteredConfigs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-muted mb-4">
          <MessageSquare className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground">
          No chat configs match "{searchQuery}"
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConfigs.map((config) => (
          <ConfigCard
            key={config.id}
            config={config}
            isSelected={config.id === selectedConfigId}
            onSelect={() => onConfigSelect(config)}
            onEdit={() => handleEdit(config)}
            onDelete={() => handleDeleteClick(config.id)}
          />
        ))}
      </div>

      <EditConfigDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        config={editingConfig}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat Config</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat configuration? This
              action cannot be undone and will also delete all associated chat
              sessions and messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
