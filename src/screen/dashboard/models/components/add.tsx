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
import { mapProviderIconWithSize } from "@/utils/map-provider-icon";
import { Database, Loader2, MessageSquare, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import type { CreateModelRequest, ModelCredential } from "../type";

interface AddModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreateModelRequest;
  onFormChange: (field: string, value: any) => void;
  credentials: any[];
  loadingCredentials: boolean;
  modelCredentials: ModelCredential[];
  loadingModelCredentials: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
  isFormValid: boolean;
  onTypeChange?: (type: "chat" | "embedding") => void;
}

export function AddModelDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  credentials,
  loadingCredentials,
  modelCredentials,
  loadingModelCredentials,
  onSubmit,
  isSubmitting,
  isFormValid,
  onTypeChange,
}: AddModelDialogProps) {
  // Handle type change - reset credential and model when type changes
  useEffect(() => {
    if (onTypeChange && formData.type) {
      onTypeChange(formData.type);
    }
  }, [formData.type, onTypeChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-black text-sm font-bold">
                AI
              </span>
            </div>
            Add New AI Model
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure a new AI model for your applications. Select a credential
            and choose from available models.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Model Type
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => onFormChange("type", value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chat" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </SelectItem>
                <SelectItem
                  value="embedding"
                  className="flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  Embedding
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="credential" className="text-sm font-medium">
              Credential
            </Label>
            <Select
              value={formData.credential_id}
              onValueChange={(value) => onFormChange("credential_id", value)}
              disabled={loadingCredentials}
            >
              <SelectTrigger className="w-full h-10">
                <div className="flex items-center gap-2">
                  {loadingCredentials && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </>
                  )}
                  <SelectValue
                    placeholder={
                      loadingCredentials
                        ? "Loading credentials..."
                        : "Select a credential"
                    }
                  />
                </div>
              </SelectTrigger>
              <SelectContent className="w-full">
                {loadingCredentials ? (
                  <div className="flex items-center gap-2 p-4 text-left">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Loading credentials...
                    </span>
                  </div>
                ) : credentials.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    <div className="mb-2">
                      No credentials support {formData.type} models.
                    </div>
                    <div>Please add a compatible credential first.</div>
                  </div>
                ) : (
                  credentials.map((credential) => (
                    <SelectItem key={credential.id} value={credential.id}>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {(() => {
                          const ProviderIcon = mapProviderIconWithSize(
                            credential.provider.toLowerCase() as any,
                            "icon",
                            "light",
                            true
                          );
                          return ProviderIcon ? (
                            <span className="flex items-center h-5 w-5 flex-shrink-0">
                              <ProviderIcon />
                            </span>
                          ) : null;
                        })()}
                        <span className="truncate">{credential.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {!loadingCredentials && credentials.length === 0 && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <span>⚠️</span>
                <span>
                  No compatible credentials found. Add a credential that
                  supports {formData.type} models.
                </span>
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Model Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., GPT-4 Turbo"
              value={formData.name}
              onChange={(e) => onFormChange("name", e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model" className="text-sm font-medium">
              Model Identifier
            </Label>
            <Select
              value={formData.model}
              onValueChange={(value) => onFormChange("model", value)}
              disabled={loadingModelCredentials || !formData.credential_id}
            >
              <SelectTrigger className="w-full h-10">
                <div className="flex items-center gap-2">
                  {loadingModelCredentials && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </>
                  )}
                  <SelectValue
                    placeholder={
                      loadingModelCredentials
                        ? "Loading models..."
                        : !formData.credential_id
                        ? "Select a credential first"
                        : modelCredentials.length === 0
                        ? "No models available"
                        : "Select a model"
                    }
                  />
                </div>
              </SelectTrigger>
              <SelectContent className="w-full">
                {!formData.credential_id ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Please select a credential first.
                  </div>
                ) : modelCredentials.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    <div className="mb-2">
                      No models available for this credential.
                    </div>
                    <div>Please select a different credential.</div>
                  </div>
                ) : (
                  modelCredentials.map((modelCredential) => (
                    <SelectItem
                      key={modelCredential.id}
                      value={modelCredential.id}
                      className="flex items-center gap-2"
                    >
                      <span className="truncate">{modelCredential.id}</span>
                      {modelCredential.owned_by && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {modelCredential.owned_by}
                        </Badge>
                      )}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {!loadingModelCredentials &&
              modelCredentials.length === 0 &&
              formData.credential_id && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>No models found for the selected credential.</span>
                </p>
              )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Enter model description"
              value={formData.description}
              onChange={(e) => onFormChange("description", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter className="flex-shrink-0 gap-3 pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
            <span>Credentials and models will refresh when type changes</span>
          </div>
          <div className="flex gap-3 ml-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={
                isSubmitting ||
                !isFormValid ||
                loadingCredentials ||
                loadingModelCredentials
              }
              className="h-10 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isSubmitting ? "Adding Model..." : "Add Model"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
