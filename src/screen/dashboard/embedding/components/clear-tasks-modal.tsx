import { LogoSpinner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useEffect } from "react";

interface ClearTasksModalProps {
  clearType: "all" | "success" | "failed" | "completed";
  onConfirm: () => void;
  onCancel: () => void;
  isClearing?: boolean;
}

const CLEAR_TYPE_CONFIG = {
  all: {
    title: "Clear All Tasks",
    description: "This will permanently delete ALL tasks from your history.",
    color: "destructive",
  },
  success: {
    title: "Clear Successful Tasks",
    description:
      "This will permanently delete all successfully completed tasks.",
    color: "green",
  },
  failed: {
    title: "Clear Failed Tasks",
    description: "This will permanently delete all failed and error tasks.",
    color: "red",
  },
  completed: {
    title: "Clear Completed Tasks",
    description:
      "This will permanently delete all completed tasks (both successful and failed).",
    color: "blue",
  },
};

export function ClearTasksModal({
  clearType,
  onConfirm,
  onCancel,
  isClearing = false,
}: ClearTasksModalProps) {
  const config = CLEAR_TYPE_CONFIG[clearType];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isClearing) {
        e.preventDefault();
        onConfirm();
      }
      if (e.key === "Escape" && !isClearing) {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onConfirm, onCancel, isClearing]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg animate-in fade-in-0 zoom-in-95">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-destructive/10 p-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              {config.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {config.description}
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {isClearing && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Clearing tasks...</span>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isClearing}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <LogoSpinner size="sm" className="mr-2" variant="light" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Tasks
              </>
            )}
          </Button>
        </div>

        {!isClearing && (
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
        )}
      </div>
    </div>
  );
}
