import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useKnowledgeStoreStore } from "../store";
import type { KnowledgeStore, KnowledgeStoreUpdateRequest } from "../types";

interface EditKnowledgeStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledgeStore: KnowledgeStore | null;
}

export const EditKnowledgeStoreDialog: React.FC<
  EditKnowledgeStoreDialogProps
> = ({ open, onOpenChange, knowledgeStore }) => {
  const {
    nameValidation,
    loading,
    error,
    updateKnowledgeStore,
    checkNameAvailability,
  } = useKnowledgeStoreStore();

  const [formData, setFormData] = useState<KnowledgeStoreUpdateRequest>({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open && knowledgeStore) {
      setFormData({
        name: knowledgeStore.name,
        description: knowledgeStore.description || "",
      });
    }
  }, [open, knowledgeStore]);

  // Check name availability when name changes (only if different from original)
  useEffect(() => {
    if (
      formData.name &&
      formData.name.length > 2 &&
      knowledgeStore &&
      formData.name !== knowledgeStore.name
    ) {
      const timeoutId = setTimeout(() => {
        if (formData.name.trim() !== "") {
          checkNameAvailability(formData.name as string);
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.name, knowledgeStore, checkNameAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!knowledgeStore || !formData.name) {
      return;
    }

    // Only check name availability if name has changed
    if (
      formData.name !== knowledgeStore.name &&
      nameValidation.isAvailable === false
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateKnowledgeStore(knowledgeStore.id, formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update knowledge store:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const isNameChanged = knowledgeStore && formData.name !== knowledgeStore.name;
  const isFormValid =
    formData.name &&
    (isNameChanged ? nameValidation.isAvailable !== false : true);

  if (!knowledgeStore) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Knowledge Store</DialogTitle>
          <DialogDescription>
            Update the information for your knowledge store.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <div className="relative">
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                placeholder="Enter knowledge store name"
                disabled={isSubmitting}
              />
              {isNameChanged && nameValidation.isChecking && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
              )}
              {isNameChanged && nameValidation.isAvailable === true && (
                <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
              )}
              {isNameChanged && nameValidation.isAvailable === false && (
                <XCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
              )}
            </div>
            {isNameChanged && nameValidation.message && (
              <p
                className={`text-sm ${
                  nameValidation.isAvailable === false
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {nameValidation.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ description: e.target.value })}
              placeholder="Enter description (optional)"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm text-gray-700">
              Configuration (Read-only)
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Dimension:</span>
                <span className="ml-2 font-medium">
                  {knowledgeStore.dimension}D
                </span>
              </div>
              <div>
                <span className="text-gray-500">Distance:</span>
                <span className="ml-2 font-medium">
                  {knowledgeStore.distance}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Dimension and distance metric cannot be changed after creation.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !isFormValid ||
                isSubmitting ||
                (isNameChanged && nameValidation.isChecking)
              }
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Knowledge Store
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
