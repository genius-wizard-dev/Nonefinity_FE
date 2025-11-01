import { LogoSpinner } from "@/components/shared";
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
import { AlertTriangle } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useKnowledgeStoreStore } from "../store";
import type { KnowledgeStore } from "../types";

interface DeleteKnowledgeStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledgeStore: KnowledgeStore | null;
}

export const DeleteKnowledgeStoreDialog: React.FC<
  DeleteKnowledgeStoreDialogProps
> = ({ open, onOpenChange, knowledgeStore }) => {
  const { deleteKnowledgeStore } = useKnowledgeStoreStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!knowledgeStore) return;

    setIsDeleting(true);

    try {
      await deleteKnowledgeStore(knowledgeStore.id);
      toast.success("Knowledge store deleted successfully", {
        description: `${knowledgeStore.name} has been permanently deleted.`,
      });
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to delete knowledge store";

      toast.error("Failed to delete knowledge store", {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  if (!knowledgeStore) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">
            Delete Knowledge Store
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            knowledge store and all its data from the database and Qdrant
            collection. All related embedding tasks will also be deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {knowledgeStore.is_use ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cannot Delete:</strong> This knowledge store is
                currently being used in one or more chat configurations. Please
                remove it from all chat configs before deleting.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This will permanently delete:
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li>Knowledge store "{knowledgeStore.name}"</li>
                  <li>All vectors in the Qdrant collection</li>
                  <li>All associated metadata</li>
                  <li>All related embedding tasks</li>
                </ul>
                <p className="mt-2 font-medium">
                  This action cannot be reversed!
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm text-gray-700 mb-2">
              Knowledge Store Details:
            </h4>
            <div className="text-sm space-y-1">
              <div>
                <span className="text-gray-500">Name:</span>{" "}
                <span className="font-medium">{knowledgeStore.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Dimension:</span>{" "}
                <span className="font-medium">{knowledgeStore.dimension}D</span>
              </div>
              <div>
                <span className="text-gray-500">Distance:</span>{" "}
                <span className="font-medium">{knowledgeStore.distance}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>{" "}
                <span className="font-medium">{knowledgeStore.status}</span>
              </div>
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || knowledgeStore.is_use}
          >
            {isDeleting && (
              <LogoSpinner size="sm" className="mr-2" variant="light" />
            )}
            Delete Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
