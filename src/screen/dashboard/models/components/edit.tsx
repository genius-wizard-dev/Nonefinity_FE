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
import { LogoSpinner } from "@/components/shared";
import type { CreateModelRequest } from "../type";

interface EditModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreateModelRequest;
  onFormChange: (field: string, value: any) => void;
  editingModel: any;
  credentials: any[];
  onSubmit: () => void;
  isSubmitting: boolean;
  hasChanges: boolean;
}

export function EditModelDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  editingModel,
  credentials,
  onSubmit,
  isSubmitting,
  hasChanges,
}: EditModelDialogProps) {
  const getCredentialById = (credentialId: string) => {
    return credentials.find((c) => c.id === credentialId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit AI Model
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your AI model configuration
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Model Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => onFormChange("name", e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Textarea
              id="edit-description"
              placeholder="Enter model description"
              value={formData.description}
              onChange={(e) => onFormChange("description", e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="p-3 bg-muted/50 rounded-lg space-y-1">
            <p className="text-xs text-muted-foreground">
              <strong>Model ID:</strong> {editingModel?.model}
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Type:</strong> {editingModel?.type}
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Credential:</strong>{" "}
              {getCredentialById(editingModel?.credential_id)?.name || "N/A"}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting || !hasChanges}>
            {isSubmitting && <LogoSpinner size="sm" className="mr-2" />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
