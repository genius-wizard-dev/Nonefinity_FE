"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { File, Trash2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  onClose: () => void;
}

export function UploadZone({ onUpload, onClose }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [replacedFiles, setReplacedFiles] = useState<string[]>([]);

  // File validation function
  const validateFile = (file: File): boolean => {
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "application/pdf",
    ];

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".csv",
      ".xlsx",
      ".xls",
      ".txt",
      ".pdf",
    ];

    // Check file size
    if (file.size > maxSize) {
      setFileErrors((prev) => [
        ...prev,
        `${file.name}: File size exceeds 50MB limit`,
      ]);
      return false;
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      setFileErrors((prev) => [
        ...prev,
        `${file.name}: File type not allowed. Only images, CSV, XLSX, TXT, and PDF files are accepted`,
      ]);
      return false;
    }

    return true;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setFileErrors([]); // Clear previous errors
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(validateFile);

    // Handle duplicate file names - replace existing files with same name
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      const replaced: string[] = [];

      validFiles.forEach((newFile) => {
        const existingIndex = newFiles.findIndex(
          (file) => file.name === newFile.name
        );
        if (existingIndex !== -1) {
          // Replace existing file with same name
          newFiles[existingIndex] = newFile;
          replaced.push(newFile.name);
        } else {
          // Add new file
          newFiles.push(newFile);
        }
      });

      setReplacedFiles(replaced);

      // Clear replaced files indicator after 3 seconds
      if (replaced.length > 0) {
        setTimeout(() => {
          setReplacedFiles([]);
        }, 3000);
      }

      return newFiles;
    });
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setFileErrors([]); // Clear previous errors
        const files = Array.from(e.target.files);
        const validFiles = files.filter(validateFile);

        // Handle duplicate file names - replace existing files with same name
        setSelectedFiles((prev) => {
          const newFiles = [...prev];
          const replaced: string[] = [];

          validFiles.forEach((newFile) => {
            const existingIndex = newFiles.findIndex(
              (file) => file.name === newFile.name
            );
            if (existingIndex !== -1) {
              // Replace existing file with same name
              newFiles[existingIndex] = newFile;
              replaced.push(newFile.name);
            } else {
              // Add new file
              newFiles.push(newFile);
            }
          });

          setReplacedFiles(replaced);

          // Clear replaced files indicator after 3 seconds
          if (replaced.length > 0) {
            setTimeout(() => {
              setReplacedFiles([]);
            }, 3000);
          }

          return newFiles;
        });
      }
    },
    []
  );

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setFileErrors([]); // Clear errors when files are removed
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setFileErrors([]);
    setReplacedFiles([]);
  };

  const handleUpload = () => {

    if (selectedFiles.length > 0) {

      onUpload(selectedFiles);
    } else {
      console.error("No files selected for upload");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-lg border border-border bg-card p-6 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>

        <h2 className="mb-6 text-2xl font-semibold text-foreground">
          Upload Files
        </h2>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30"
          }`}
        >
          <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-medium text-foreground">
            Drag and drop files here
          </p>
          <p className="mb-2 text-sm text-muted-foreground">
            Supported formats: Images (JPG, PNG, GIF, WebP), CSV, XLSX, TXT, PDF
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            Maximum file size: 50MB
          </p>
          <p className="mb-4 text-sm text-muted-foreground">or</p>
          <label htmlFor="file-upload">
            <Button variant="outline" asChild>
              <span>Browse Files</span>
            </Button>
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.webp,.csv,.xlsx,.xls,.txt,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">
                Selected Files ({selectedFiles.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear All
              </Button>
            </div>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between rounded p-2 ${
                    replacedFiles.includes(file.name)
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-card"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground truncate">
                      {file.name}
                    </span>
                    {replacedFiles.includes(file.name) && (
                      <span className="text-xs text-blue-600 font-medium">
                        (replaced)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {formatBytes(file.size)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {fileErrors.length > 0 && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <h4 className="mb-2 text-sm font-medium text-red-800">
              File Upload Errors:
            </h4>
            <ul className="space-y-1 text-sm text-red-700">
              {fileErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
