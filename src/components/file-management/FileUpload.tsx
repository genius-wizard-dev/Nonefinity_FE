import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, File, CheckCircle, AlertCircle } from "lucide-react";
import api from "@/lib/axios";
import type { FileItem } from "./FileList";

interface FileUploadProps {
    onUploadComplete?: (file: any) => void;
    onUploadError?: (error: string) => void;
    acceptedTypes?: string[];
    maxFileSize?: number; // in MB
    multiple?: boolean;
}

interface UploadFile {
    file: File;
    progress: number;
    status: "pending" | "uploading" | "completed" | "error";
    error?: string;
    id: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onUploadComplete,
    onUploadError,
    acceptedTypes = [],
    maxFileSize = 10,
    multiple = false,
}) => {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const validateFile = (file: File): string | null => {
        if (maxFileSize && file.size > maxFileSize * 1024 * 1024) {
            return `File size exceeds ${maxFileSize}MB limit`;
        }
        if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
            return `File type ${file.type} is not supported`;
        }
        return null;
    };

    const handleFileSelect = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        const newFiles: UploadFile[] = [];
        Array.from(selectedFiles).forEach((file) => {
            const error = validateFile(file);
            newFiles.push({
                file,
                progress: 0,
                status: error ? "error" : "pending",
                error: error || undefined,
                id: generateId(),
            });
        });

        setFiles((prev) => (multiple ? [...prev, ...newFiles] : newFiles));
    };

    // Upload a single file entry
    const uploadSingleFile = async (fileEntry: UploadFile) => {
        const formData = new FormData();
        formData.append("file", fileEntry.file);

        try {
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileEntry.id ? { ...f, status: "uploading" } : f
                )
            );

            const response = await api.post("/api/v1/file/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total
                        ? Math.round(
                              (progressEvent.loaded * 100) / progressEvent.total
                          )
                        : 0;

                    setFiles((prev) =>
                        prev.map((f) =>
                            f.id === fileEntry.id ? { ...f, progress } : f
                        )
                    );
                },
            });

            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileEntry.id
                        ? { ...f, status: "completed", progress: 100 }
                        : f
                )
            );

            // Normalize upload response and map to FileItem shape for callers
            const payload = response.data;
            const uploaded = payload?.data ?? payload;
            const mapped: FileItem = {
                id: uploaded?.id ?? fileEntry.id,
                name: uploaded?.file_name
                    ? `${uploaded.file_name}${uploaded.file_ext || ""}`
                    : fileEntry.file.name,
                type: uploaded?.file_type || fileEntry.file.type || "",
                size: uploaded?.file_size ?? fileEntry.file.size,
                createdAt: uploaded?.created_at ?? new Date().toISOString(),
                updatedAt:
                    uploaded?.updated_at ??
                    uploaded?.created_at ??
                    new Date().toISOString(),
                url: uploaded?.url,
                owner: uploaded?.owner_id,
            };

            onUploadComplete?.(mapped);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || "Upload failed";
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileEntry.id
                        ? { ...f, status: "error", error: errorMessage }
                        : f
                )
            );
            onUploadError?.(errorMessage);
        }
    };

    const handleUploadAll = () => {
        const pendingFiles = files.filter((f) => f.status === "pending");
        pendingFiles.forEach(uploadSingleFile);
    };

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const clearCompleted = () => {
        setFiles((prev) => prev.filter((f) => f.status !== "completed"));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getStatusIcon = (status: UploadFile["status"]) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "error":
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <File className="h-4 w-4 text-blue-500" />;
        }
    };

    const pendingUploads = files.filter((f) => f.status === "pending");
    const completedUploads = files.filter((f) => f.status === "completed");

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    File Upload
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Drop Zone */}
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragOver
                            ? "border-primary bg-primary/5"
                            : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">
                        Drop files here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                        {acceptedTypes.length > 0 && (
                            <>
                                Supported types: {acceptedTypes.join(", ")}
                                <br />
                            </>
                        )}
                        Maximum file size: {maxFileSize}MB
                    </p>
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                    >
                        Select Files
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple={multiple}
                        accept={acceptedTypes.join(",")}
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                    />
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">
                                Files ({files.length})
                            </h3>
                            <div className="flex gap-2">
                                {pendingUploads.length > 0 && (
                                    <Button onClick={handleUploadAll} size="sm">
                                        Upload All ({pendingUploads.length})
                                    </Button>
                                )}
                                {completedUploads.length > 0 && (
                                    <Button
                                        onClick={clearCompleted}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Clear Completed
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {files.map((fileEntry) => (
                                <div
                                    key={fileEntry.id}
                                    className="flex items-center gap-3 p-3 border rounded-lg"
                                >
                                    {getStatusIcon(fileEntry.status)}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                            {fileEntry.file.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatFileSize(
                                                fileEntry.file.size
                                            )}
                                        </p>
                                        {fileEntry.status === "uploading" && (
                                            <Progress
                                                value={fileEntry.progress}
                                                className="mt-1"
                                            />
                                        )}
                                        {fileEntry.error && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {fileEntry.error}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {fileEntry.status === "pending" && (
                                            <Button
                                                onClick={() =>
                                                    uploadSingleFile(fileEntry)
                                                }
                                                size="sm"
                                                variant="outline"
                                            >
                                                Upload
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() =>
                                                removeFile(fileEntry.id)
                                            }
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
