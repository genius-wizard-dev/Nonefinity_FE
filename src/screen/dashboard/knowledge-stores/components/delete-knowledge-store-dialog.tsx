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
import { AlertTriangle, Loader2 } from "lucide-react";
import React, { useState } from "react";
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
  const { deleteKnowledgeStore, error } = useKnowledgeStoreStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!knowledgeStore) return;

    setIsDeleting(true);

    try {
      await deleteKnowledgeStore(knowledgeStore.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete knowledge store:", error);
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
            collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This will permanently delete:
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Knowledge store "{knowledgeStore.name}"</li>
                <li>All vectors in the Qdrant collection</li>
                <li>All associated metadata</li>
              </ul>
              <p className="mt-2 font-medium">
                This action cannot be reversed!
              </p>
            </AlertDescription>
          </Alert>

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

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
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
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
