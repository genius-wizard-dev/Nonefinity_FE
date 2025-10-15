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
import { AlertTriangle, Trash2 } from "lucide-react";
import React, { useState } from "react";

interface DeleteTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  taskInfo?: {
    taskId: string;
    fileName?: string;
    status: string;
  };
}

export const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  taskInfo,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Delete Task
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            embedding task and its associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This will permanently delete:
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Task record from database</li>
                <li>Task status and metadata</li>
                <li>Task execution history</li>
              </ul>
              <p className="mt-2 font-medium">
                This action cannot be reversed!
              </p>
            </AlertDescription>
          </Alert>

          {taskInfo && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                Task Details:
              </h4>
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Task ID:
                  </span>{" "}
                  <span className="font-medium font-mono text-xs">
                    {taskInfo.taskId.substring(0, 12)}...
                  </span>
                </div>
                {taskInfo.fileName && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      File:
                    </span>{" "}
                    <span className="font-medium">{taskInfo.fileName}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Status:
                  </span>{" "}
                  <span className="font-medium capitalize">
                    {taskInfo.status.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
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
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting && (
              <LogoSpinner size="sm" className="mr-2" variant="light" />
            )}
            Delete Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
