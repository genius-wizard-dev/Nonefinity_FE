import { Button } from "@/components/ui/button";
import { useCredentialStore } from "@/screen/dashboard/credentials/store";
import { Brain, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AddModelDialog,
  DeleteModelDialog,
  EditModelDialog,
  ModelFilters,
  ModelStats,
  ModelTable,
} from "./components";
import { ModelService } from "./service";
import { useModelSelectors, useModelStore } from "./store";
import type { UpdateModelRequest } from "./type";

const ModelManagement = () => {
  const {
    models,
    loading,
    filters,
    stats,
    fetchModels,
    fetchModelStats,
    createModel,
    updateModel,
    deleteModel,
    setFilters,
    setFormData,
    resetFormData,
  } = useModelStore();

  const { modelCredentials, modelCredentialLoading, formData } =
    useModelSelectors();

  const { credentials, fetchCredentials } = useCredentialStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingModel, setEditingModel] = useState<any>(null);
  const [addingModel, setAddingModel] = useState(false);
  const [editingModelLoading, setEditingModelLoading] = useState(false);
  const [deletingModel, setDeletingModel] = useState(false);

  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  const [filteredCredentialsForAdd, setFilteredCredentialsForAdd] = useState<
    any[]
  >([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  useEffect(() => {
    fetchModels();
    fetchModelStats();
    fetchCredentials();
  }, [fetchModels, fetchModelStats, fetchCredentials]);

  useEffect(() => {
    const fetchCredentialsByType = async () => {
      if (formData.type && isAddDialogOpen) {
        setLoadingCredentials(true);
        try {
          const response = await ModelService.getCredentialByTaskType(
            formData.type
          );
          if (response && response.credentials) {
            const activeCredentials = response.credentials.filter(
              (c) => c.is_active
            );
            setFilteredCredentialsForAdd(activeCredentials);
          } else {
            setFilteredCredentialsForAdd([]);
          }
        } catch (error) {
          console.error("❌ Failed to fetch credentials by type:", error);
          setFilteredCredentialsForAdd([]);
          toast.error("Failed to load credentials", {
            description:
              "Could not fetch compatible credentials for this type.",
          });
        } finally {
          setLoadingCredentials(false);
        }
      }
    };

    fetchCredentialsByType();
  }, [formData.type, isAddDialogOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(field, value);
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters({ [field]: value });
  };

  const isAddFormValid = () => {
    return (
      formData.credential_id !== "" &&
      formData.name.trim() !== "" &&
      formData.model.trim() !== ""
    );
  };

  const hasEditChanges = () => {
    if (!editingModel) return false;
    return (
      formData.name !== editingModel.name ||
      (formData.description || "") !== (editingModel.description || "") ||
      formData.is_active !== editingModel.is_active
    );
  };

  const resetForm = () => {
    resetFormData();
  };

  const handleAddModel = async () => {
    setAddingModel(true);
    try {
      await createModel(formData);
      resetForm();
      setIsAddDialogOpen(false);
      toast.success("Model created successfully", {
        description: `${formData.name} has been added to your models.`,
      });
    } catch (error: any) {
      toast.error("Failed to create model", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred.",
      });
    } finally {
      setAddingModel(false);
    }
  };

  const handleEditModel = async () => {
    if (!editingModel) return;

    setEditingModelLoading(true);
    try {
      const updateData: UpdateModelRequest = {};

      if (formData.name !== editingModel.name) {
        updateData.name = formData.name;
      }
      if ((formData.description || "") !== (editingModel.description || "")) {
        updateData.description = formData.description;
      }
      if (formData.is_active !== editingModel.is_active) {
        updateData.is_active = formData.is_active;
      }

      await updateModel(editingModel.id, updateData);
      resetForm();
      setEditingModel(null);
      setIsEditDialogOpen(false);
      toast.success("Model updated successfully", {
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      toast.error("Failed to update model", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred.",
      });
    } finally {
      setEditingModelLoading(false);
    }
  };

  const handleDeleteModel = async () => {
    if (!deleteId) return;
    setDeletingModel(true);
    try {
      await deleteModel(deleteId);
      setDeleteId(null);
      toast.success("Model deleted", {
        description: "The model has been permanently removed.",
      });
    } catch (error: any) {
      toast.error("Failed to delete model", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred.",
      });
    } finally {
      setDeletingModel(false);
    }
  };

  const handleToggleStatus = async (
    modelId: string,
    currentStatus: boolean
  ) => {
    setTogglingStatus(modelId);
    try {
      await updateModel(modelId, { is_active: !currentStatus });
      toast.success("Status updated successfully", {
        description: `Model is now ${!currentStatus ? "active" : "inactive"}.`,
      });
    } catch (error: any) {
      toast.error("Failed to update status", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred.",
      });
    } finally {
      setTogglingStatus(null);
    }
  };

  const openEditDialog = (model: any) => {
    setEditingModel(model);
    setFormData("credential_id", model.credential_id);
    setFormData("name", model.name);
    setFormData("model", model.model);
    setFormData("type", model.type);
    setFormData("description", model.description || "");
    setFormData("is_active", model.is_active);
    setIsEditDialogOpen(true);
  };

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      !filters.search ||
      model.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      model.model.toLowerCase().includes(filters.search.toLowerCase());

    const matchesType =
      !filters.type || filters.type === "all" || model.type === filters.type;
    const matchesCredential =
      !filters.credential_id || model.credential_id === filters.credential_id;
    const matchesActive =
      filters.active_only === undefined ||
      !filters.active_only ||
      model.is_active;

    return matchesSearch && matchesType && matchesCredential && matchesActive;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-card shadow-sm rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                AI Models
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your AI models and configurations
              </p>
            </div>
          </div>
          <Button
            disabled={loading}
            onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Model
          </Button>
        </div>
      </div>

      {/* Stats */}
      <ModelStats stats={stats} />

      {/* Filters */}
      <ModelFilters
        filters={filters}
        credentials={credentials}
        onFilterChange={handleFilterChange}
      />

      {/* Models Table */}
      <ModelTable
        models={filteredModels}
        loading={loading}
        credentials={credentials}
        togglingStatus={togglingStatus}
        deletingModelId={null}
        onEdit={openEditDialog}
        onDelete={setDeleteId}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add Dialog */}
      <AddModelDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}
        formData={formData}
        onFormChange={handleInputChange}
        credentials={filteredCredentialsForAdd}
        loadingCredentials={loadingCredentials}
        modelCredentials={modelCredentials}
        loadingModelCredentials={modelCredentialLoading}
        onSubmit={handleAddModel}
        isSubmitting={addingModel}
        isFormValid={isAddFormValid()}
        onTypeChange={useCallback(
          (type: "chat" | "embedding") => {
            setFormData("type", type);
            // Reset credential and model when type changes
            setFormData("credential_id", "");
            setFormData("model", "");
          },
          [setFormData]
        )}
      />

      {/* Edit Dialog */}
      <EditModelDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            resetForm();
            setEditingModel(null);
          }
        }}
        formData={formData}
        onFormChange={handleInputChange}
        editingModel={editingModel}
        credentials={credentials}
        onSubmit={handleEditModel}
        isSubmitting={editingModelLoading}
        hasChanges={hasEditChanges()}
      />

      {/* Delete Dialog */}
      <DeleteModelDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteModel}
        isDeleting={deletingModel}
      />
    </div>
  );
};

export default ModelManagement;
