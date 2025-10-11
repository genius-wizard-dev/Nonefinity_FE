import { Badge } from "@/components/ui/badge";
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
import { Loader2 } from "lucide-react";
import type { CreateModelRequest } from "../type";

interface AddModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreateModelRequest;
  onFormChange: (field: string, value: any) => void;
  credentials: any[];
  loadingCredentials: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
  isFormValid: boolean;
}

export function AddModelDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  credentials,
  loadingCredentials,
  onSubmit,
  isSubmitting,
  isFormValid,
}: AddModelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New AI Model
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure a new AI model for your applications
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => onFormChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="embedding">Embedding</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="credential">Credential</Label>
            <Select
              value={formData.credential_id}
              onValueChange={(value) => onFormChange("credential_id", value)}
              disabled={loadingCredentials || credentials.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingCredentials
                      ? "Loading credentials..."
                      : credentials.length === 0
                      ? "No credentials available for this type"
                      : "Select a credential"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {loadingCredentials ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    Loading credentials...
                  </div>
                ) : credentials.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    No credentials support {formData.type} models.
                    <br />
                    Please add a compatible credential first.
                  </div>
                ) : (
                  credentials.map((credential) => (
                    <SelectItem key={credential.id} value={credential.id}>
                      <div className="flex items-center gap-2">
                        <span>{credential.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {credential.provider_name}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {!loadingCredentials && credentials.length === 0 && (
              <p className="text-xs text-amber-600">
                ⚠️ No compatible credentials found. Add a credential that
                supports {formData.type} models.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Model Name</Label>
            <Input
              id="name"
              placeholder="e.g., GPT-4 Turbo"
              value={formData.name}
              onChange={(e) => onFormChange("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model Identifier</Label>
            <Input
              id="model"
              placeholder="e.g., gpt-4-turbo-preview"
              value={formData.model}
              onChange={(e) => onFormChange("model", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter model description"
              value={formData.description}
              onChange={(e) => onFormChange("description", e.target.value)}
              rows={3}
            />
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
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !isFormValid || loadingCredentials}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Model
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
