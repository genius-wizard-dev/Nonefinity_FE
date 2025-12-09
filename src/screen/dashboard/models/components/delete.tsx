import { LogoSpinner } from "@/components/shared";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DeleteModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteModelDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteModelDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (open) {
      setConfirmText("");
    }
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold">
            Are you sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            This action cannot be undone. This will permanently delete the model
            and remove it from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2">
          <Label
            htmlFor="confirm-delete"
            className="text-sm font-medium block mb-3"
          >
            Type{" "}
            <span
              className="font-bold text-destructive cursor-pointer hover:underline"
              onClick={() => {
                navigator.clipboard.writeText("DELETE");
                toast.success("Copied 'DELETE' to clipboard");
              }}
              title="Click to copy"
            >
              DELETE
            </span>{" "}
            to confirm
          </Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            disabled={isDeleting}
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            onClick={onConfirm}
            disabled={confirmText !== "DELETE" || isDeleting}
            variant="destructive"
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting && (
              <LogoSpinner size="sm" className="mr-2" variant="light" />
            )}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
