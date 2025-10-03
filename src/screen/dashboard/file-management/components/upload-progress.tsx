"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, File, Upload, XCircle } from "lucide-react";
import type { UploadFile } from "../types";

interface UploadProgressProps {
  files: UploadFile[];
  onClose: () => void;
  onRetry?: (fileId: string) => void;
}

export function UploadProgress({
  files,
  onClose,
  onRetry,
}: UploadProgressProps) {
  const completedCount = files.filter((f) => f.status === "completed").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;

  const allCompleted = files.length > 0 && completedCount === files.length;
  const hasErrors = errorCount > 0;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "uploading":
        return (
          <div className="relative h-4 w-4">
            <div className="absolute inset-0 rounded-full border-2 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
        );
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: UploadFile["status"]) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "error":
        return "Failed";
      case "uploading":
        return "Uploading...";
      default:
        return "Pending";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">
              Uploading Files
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {completedCount} completed
            </span>
            {uploadingCount > 0 && (
              <span className="flex items-center gap-1">
                <Upload className="h-4 w-4 text-blue-500 animate-pulse" />
                {uploadingCount} uploading
              </span>
            )}
            {errorCount > 0 && (
              <span className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                {errorCount} failed
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {files.map((uploadFile) => (
            <div
              key={uploadFile.id}
              className={cn(
                "rounded-lg border p-4 transition-colors",
                uploadFile.status === "completed" &&
                  "border-green-200 bg-green-50/50",
                uploadFile.status === "error" && "border-red-200 bg-red-50/50",
                uploadFile.status === "uploading" &&
                  "border-blue-200 bg-blue-50/50"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getStatusIcon(uploadFile.status)}
                  <span className="font-medium text-sm truncate">
                    {uploadFile.file.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(uploadFile.file.size)}
                  </span>
                  {uploadFile.status === "error" && onRetry && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRetry(uploadFile.id)}
                      className="h-6 px-2 text-xs"
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>

              {uploadFile.status === "uploading" && (
                <div className="text-xs text-blue-600">
                  {getStatusText(uploadFile.status)}
                </div>
              )}

              {uploadFile.status === "completed" && (
                <div className="text-xs text-green-600 font-medium">
                  {getStatusText(uploadFile.status)}
                </div>
              )}

              {uploadFile.status === "error" && (
                <div className="text-xs text-red-600">
                  {uploadFile.error || "Upload failed"}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {allCompleted && !hasErrors ? (
            <Button onClick={onClose} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Done
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
