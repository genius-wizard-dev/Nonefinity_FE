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
import { AlertTriangle, Link2 } from "lucide-react";

interface MCPDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mcpName: string;
  isUsed?: boolean;
  usedBy?: Array<{ id: string; name: string }>;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function MCPDeleteDialog({
  open,
  onOpenChange,
  mcpName,
  isUsed = false,
  usedBy = [],
  onConfirm,
  isDeleting = false,
}: MCPDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete MCP Configuration
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  "{mcpName}"
                </span>
                ?
              </p>

              {isUsed && usedBy.length > 0 ? (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                    <Link2 className="h-4 w-4" />
                    <span>Cannot delete - MCP is in use</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    This MCP configuration is currently being used by the
                    following chat configurations. Please remove it from these
                    chats before deleting:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {usedBy.slice(0, 5).map((chat) => (
                      <Badge
                        key={chat.id}
                        variant="outline"
                        className="text-xs"
                      >
                        {chat.name}
                      </Badge>
                    ))}
                    {usedBy.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{usedBy.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. The MCP configuration and all
                  its associated tools will be permanently removed.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          {!isUsed && (
            <AlertDialogAction
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
