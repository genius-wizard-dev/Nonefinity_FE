import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ENDPOINTS } from "@/consts/endpoint";
import api from "@/lib/axios";
import { Check, Edit3, FileText, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface FileRenameProps {
  fileId: string;
  currentName: string;
  onRenameSuccess?: (fileId: string, newName: string) => void;
  onRenameError?: (error: string) => void;
  trigger?: React.ReactNode;
  disabled?: boolean;
  inline?: boolean; // For inline editing
}

export const FileRename: React.FC<FileRenameProps> = ({
  fileId,
  currentName,
  onRenameSuccess,
  onRenameError,
  trigger,
  disabled = false,
  inline = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen || isEditing) {
      setNewName(currentName);
      setError(null);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, isEditing, currentName]);

  const getExt = (name: string) => {
    const idx = name.lastIndexOf(".");
    return idx > 0 ? name.slice(idx + 1) : "";
  };

  const stripMatchingExt = (name: string, currentExt: string) => {
    if (!currentExt) return name;
    const idx = name.lastIndexOf(".");
    if (
      idx > 0 &&
      name.slice(idx + 1).toLowerCase() === currentExt.toLowerCase()
    ) {
      return name.slice(0, idx);
    }
    return name;
  };

  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return "File name cannot be empty";
    }
    if (name.length > 255) {
      return "File name is too long (max 255 characters)";
    }
    if (/[<>:"/\\|?*]/.test(name)) {
      return "File name contains invalid characters";
    }
    if (name === currentName) {
      return "Please enter a different name";
    }
    // Prevent changing extension: if user typed one, it must match existing
    const currentExt = getExt(currentName);
    const idx = name.lastIndexOf(".");
    if (idx > 0) {
      const newExt = name.slice(idx + 1);
      if (currentExt && newExt.toLowerCase() !== currentExt.toLowerCase()) {
        return `You cannot change the file extension (.${currentExt})`;
      }
    }
    return null;
  };

  const handleRename = async () => {
    const trimmedName = newName.trim();
    const validationError = validateName(trimmedName);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsRenaming(true);
    setError(null);

    try {
      const currentExt = getExt(currentName);
      const baseName = stripMatchingExt(trimmedName, currentExt);
      const res = await api.put(ENDPOINTS.FILES.RENAME_ALT(fileId), undefined, {
        params: { new_name: baseName },
      });

      setIsOpen(false);
      setIsEditing(false);

      // Default final name (client-side reconstruction)
      let finalName = currentExt
        ? `${baseName}${baseName ? "." : ""}${currentExt}`
        : baseName;

      // Prefer server response if provided
      const data = (res as any)?.data;
      const payload = data?.data ?? data;
      const serverName = payload?.file_name ?? payload?.file?.file_name;
      const serverExt = payload?.file_ext ?? payload?.file?.file_ext;
      if (serverName) {
        if (serverExt) {
          finalName = `${serverName}${serverExt ? "." + serverExt : ""}`;
        } else if (currentExt) {
          // If server returns name without ext, preserve prior ext
          finalName = `${serverName}${serverName ? "." : ""}${currentExt}`;
        } else {
          finalName = serverName;
        }
      }

      onRenameSuccess?.(fileId, finalName);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to rename file";
      setError(errorMessage);
      onRenameError?.(errorMessage);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleCancel = () => {
    setNewName(currentName);
    setError(null);
    setIsOpen(false);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      className="flex items-center gap-2"
    >
      <Edit3 className="h-4 w-4" />
      Rename
    </Button>
  );

  // Inline editing mode
  if (inline) {
    return (
      <div className="flex items-center gap-2 w-full">
        {isEditing ? (
          <>
            <Input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                // Only cancel if not currently renaming
                if (!isRenaming) {
                  handleCancel();
                }
              }}
              className={`flex-1 ${error ? "border-destructive" : ""}`}
              disabled={isRenaming}
            />
            <Button
              size="sm"
              onClick={handleRename}
              disabled={isRenaming}
              className="flex items-center gap-1"
            >
              {isRenaming ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isRenaming}
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <div
            className="flex-1 cursor-pointer hover:bg-muted rounded px-2 py-1 flex items-center gap-2"
            onClick={() => !disabled && setIsEditing(true)}
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{currentName}</span>
            <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
          </div>
        )}
        {error && <div className="text-xs text-destructive mt-1">{error}</div>}
      </div>
    );
  }

  // Dialog mode
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Rename File
          </DialogTitle>
          <DialogDescription>
            Enter a new name for the file. The file extension will be preserved.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="filename" className="text-sm font-medium">
              File Name
            </label>
            <Input
              id="filename"
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              className={error ? "border-destructive" : ""}
              disabled={isRenaming}
              placeholder="Enter new file name"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Current name:</p>
                <p className="text-muted-foreground break-all">{currentName}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isRenaming}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRename}
            disabled={isRenaming || !newName || newName === currentName}
            className="flex items-center gap-2"
          >
            {isRenaming ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Renaming...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Rename File
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook for programmatic renaming
export const useFileRename = () => {
  const [isRenaming, setIsRenaming] = useState(false);

  const renameFile = async (
    fileId: string,
    newName: string,
    options?: {
      onSuccess?: (fileId: string, newName: string) => void;
      onError?: (error: string) => void;
    }
  ) => {
    setIsRenaming(true);
    try {
      const res = await api.put(ENDPOINTS.FILES.RENAME_ALT(fileId), undefined, {
        params: { new_name: newName.trim() },
      });
      // Derive final name from server response when available; fallback to provided newName
      const data = (res as any)?.data;
      const payload = data?.data ?? data;
      const serverName = payload?.file_name ?? payload?.file?.file_name;
      const serverExt = payload?.file_ext ?? payload?.file?.file_ext;
      const finalName = serverName
        ? `${serverName}${serverExt ? "." + serverExt : ""}`
        : newName;
      options?.onSuccess?.(fileId, finalName);
      return true;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to rename file";
      options?.onError?.(errorMessage);
      return false;
    } finally {
      setIsRenaming(false);
    }
  };

  return { renameFile, isRenaming };
};
