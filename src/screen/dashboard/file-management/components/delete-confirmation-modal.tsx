import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";
import { LogoSpinner } from "@/components/shared";
import { useEffect } from "react";

interface DeleteConfirmationModalProps {
  fileCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
  progress?: number;
}

export function DeleteConfirmationModal({
  fileCount,
  onConfirm,
  onCancel,
  isDeleting = false,
  progress = 0,
}: DeleteConfirmationModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onConfirm, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-destructive/10 p-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              Delete {fileCount} file{fileCount > 1 ? "s" : ""}?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This action cannot be undone. The selected file
              {fileCount > 1 ? "s" : ""} will be permanently deleted.
            </p>
          </div>
        </div>

        {isDeleting && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deleting files...</span>
              <span className="text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <LogoSpinner size="sm" className="mr-2" variant="light" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Press{" "}
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            Enter
          </kbd>{" "}
          to confirm or{" "}
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            Esc
          </kbd>{" "}
          to cancel
        </p>
      </div>
    </div>
  );
}
