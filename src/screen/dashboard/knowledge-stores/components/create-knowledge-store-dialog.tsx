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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";
import { LogoSpinner } from "@/components/shared";
import React, { useEffect, useState } from "react";
import { useKnowledgeStoreStore } from "../store";
import type { KnowledgeStoreCreateRequest } from "../types";
import { DIMENSION_OPTIONS, DISTANCE_OPTIONS } from "../types";

interface CreateKnowledgeStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateKnowledgeStoreDialog: React.FC<
  CreateKnowledgeStoreDialogProps
> = ({ open, onOpenChange }) => {
  const {
    formData,
    nameValidation,
    loading,
    error,
    setFormData,
    resetFormData,
    createKnowledgeStore,
    checkNameAvailability,
  } = useKnowledgeStoreStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      resetFormData();
    }
  }, [open, resetFormData]);

  // Check name availability when name changes
  useEffect(() => {
    if (formData.name && formData.name.length > 2) {
      const timeoutId = setTimeout(() => {
        checkNameAvailability(formData.name);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.name, checkNameAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.dimension || !formData.distance) {
      return;
    }

    if (nameValidation.isAvailable === false) {
      return;
    }

    setIsSubmitting(true);

    try {
      const createData: KnowledgeStoreCreateRequest = {
        name: formData.name,
        description: formData.description || undefined,
        dimension: formData.dimension,
        distance: formData.distance,
      };

      await createKnowledgeStore(createData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create knowledge store:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const isFormValid =
    formData.name &&
    formData.dimension &&
    formData.distance &&
    nameValidation.isAvailable !== false;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Knowledge Store</DialogTitle>
          <DialogDescription>
            Create a new knowledge store to manage your vector data.
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
              {nameValidation.isChecking && (
                <LogoSpinner size="sm" className="absolute right-3 top-3 text-gray-400" />
              )}
              {nameValidation.isAvailable === true && (
                <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
              )}
              {nameValidation.isAvailable === false && (
                <XCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
              )}
            </div>
            {nameValidation.message && (
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dimension">Dimension *</Label>
              <Select
                value={formData.dimension.toString()}
                onValueChange={(value) =>
                  setFormData({ dimension: parseInt(value) })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dimension" />
                </SelectTrigger>
                <SelectContent>
                  {DIMENSION_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">Distance Metric *</Label>
              <Select
                value={formData.distance}
                onValueChange={(value: "Cosine" | "Dot" | "Euclid") =>
                  setFormData({ distance: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select distance" />
                </SelectTrigger>
                <SelectContent>
                  {DISTANCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                !isFormValid || isSubmitting || nameValidation.isChecking
              }
            >
              {isSubmitting && (
                <LogoSpinner size="sm" className="mr-2" />
              )}
              Create Knowledge Store
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
