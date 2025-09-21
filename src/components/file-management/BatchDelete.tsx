import React, { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Trash2,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Files,
    RefreshCw,
} from "lucide-react";
import api from "@/lib/axios";
import type { FileItem } from "./FileList";

interface BatchDeleteProps {
    fileIds: string[];
    files?: FileItem[];
    onDeleteSuccess?: (deletedIds: string[]) => void;
    onDeleteError?: (error: string, failedIds: string[]) => void;
    onDeleteProgress?: (progress: {
        completed: number;
        total: number;
        current?: string;
    }) => void;
    trigger?: React.ReactNode;
    disabled?: boolean;
    batchSize?: number;
}

interface DeleteResult {
    fileId: string;
    fileName?: string;
    status: "pending" | "success" | "error";
    error?: string;
}

export const BatchDelete: React.FC<BatchDeleteProps> = ({
    fileIds,
    files = [],
    onDeleteSuccess,
    onDeleteError,
    onDeleteProgress,
    trigger,
    disabled = false,
    batchSize = 10,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteResults, setDeleteResults] = useState<DeleteResult[]>([]);
    const [currentProgress, setCurrentProgress] = useState(0);
    const fileMap = new Map(files.map((file) => [file.id, file]));

    const handleBatchDelete = async () => {
        if (fileIds.length === 0) return;

        setIsDeleting(true);
        setCurrentProgress(0);

        const initialResults: DeleteResult[] = fileIds.map((id) => ({
            fileId: id,
            fileName: fileMap.get(id)?.name,
            status: "pending" as const,
        }));
        setDeleteResults(initialResults);

        try {
            if (batchSize >= fileIds.length) {
                await performBatchDelete(fileIds);
            } else {
                await performChunkedDelete(fileIds);
            }
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || "Batch delete failed";
            onDeleteError?.(errorMessage, fileIds);
        } finally {
            setIsDeleting(false);
        }
    };

    const performBatchDelete = async (ids: string[]) => {
        try {
            const response = await api.post("/api/v1/file/batch/delete", {
                file_ids: ids,
            });

            const data = response.data || {};
            const successIds: string[] = [];
            const failedIds: string[] = [];

            const nestedData = data.data || data;

            if (
                Array.isArray(nestedData.successful) ||
                Array.isArray(nestedData.failed)
            ) {
                const successful = (nestedData.successful || []) as string[];
                const failed = (nestedData.failed || []) as string[];
                successIds.push(...successful);
                failedIds.push(...failed);
            } else if (Array.isArray(data.results)) {
                const results = data.results || [];
                const getResultId = (r: any) =>
                    r?.fileId ?? r?.file_id ?? r?.id;

                results.forEach((result: any) => {
                    const id = getResultId(result);
                    if (id) {
                        if (result.success) {
                            successIds.push(id);
                        } else {
                            failedIds.push(id);
                        }
                    }
                });
            }

            const finalResults: DeleteResult[] = ids.map((id) => {
                if (successIds.includes(id)) {
                    return {
                        fileId: id,
                        fileName: fileMap.get(id)?.name,
                        status: "success" as const,
                    };
                } else if (failedIds.includes(id)) {
                    return {
                        fileId: id,
                        fileName: fileMap.get(id)?.name,
                        status: "error" as const,
                        error: "Delete failed",
                    };
                } else {
                    failedIds.push(id);
                    return {
                        fileId: id,
                        fileName: fileMap.get(id)?.name,
                        status: "error" as const,
                        error: "No status returned",
                    };
                }
            });

            setDeleteResults(finalResults);
            setCurrentProgress(100);

            if (successIds.length > 0) {
                onDeleteSuccess?.(successIds);
            }
            if (failedIds.length > 0) {
                onDeleteError?.("Some files could not be deleted", failedIds);
            }
        } catch (error: any) {
            await performChunkedDelete(ids);
        }
    };

    const performChunkedDelete = async (ids: string[]) => {
        const results: DeleteResult[] = [];
        let completed = 0;

        for (let i = 0; i < ids.length; i += batchSize) {
            const chunk = ids.slice(i, i + batchSize);

            for (const fileId of chunk) {
                const fileName = fileMap.get(fileId)?.name;

                try {
                    onDeleteProgress?.({
                        completed,
                        total: ids.length,
                        current: fileName,
                    });

                    await api.delete(`/api/v1/file/${fileId}`);

                    results.push({
                        fileId,
                        fileName,
                        status: "success",
                    });
                } catch (error: any) {
                    results.push({
                        fileId,
                        fileName,
                        status: "error",
                        error: error.response?.data?.message || "Delete failed",
                    });
                }

                completed++;
                setCurrentProgress((completed / ids.length) * 100);
                setDeleteResults([...results]);

                if (chunk.length > 1) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
            }
        }

        const successIds = results
            .filter((r) => r.status === "success")
            .map((r) => r.fileId);
        const failedIds = results
            .filter((r) => r.status === "error")
            .map((r) => r.fileId);

        if (successIds.length > 0) {
            onDeleteSuccess?.(successIds);
        }
        if (failedIds.length > 0) {
            onDeleteError?.("Some files could not be deleted", failedIds);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (isDeleting) return;

        setIsOpen(open);

        if (!open) {
            setTimeout(() => {
                setDeleteResults([]);
                setCurrentProgress(0);
            }, 200);
        }
    };

    const getStatusIcon = (status: DeleteResult["status"]) => {
        switch (status) {
            case "success":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "error":
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return (
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                );
        }
    };

    const successCount = deleteResults.filter(
        (r) => r.status === "success"
    ).length;
    const errorCount = deleteResults.filter((r) => r.status === "error").length;
    const pendingCount = deleteResults.filter(
        (r) => r.status === "pending"
    ).length;

    const defaultTrigger = (
        <Button
            variant="destructive"
            disabled={disabled || fileIds.length === 0}
            className="flex items-center gap-2"
        >
            <Trash2 className="h-4 w-4" />
            Delete Selected ({fileIds.length})
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        {isDeleting
                            ? "Deleting Files..."
                            : "Confirm Batch Delete"}
                    </DialogTitle>
                    <DialogDescription>
                        {isDeleting ? (
                            <>
                                Deleting {fileIds.length} files. This may take a
                                moment...
                            </>
                        ) : (
                            <>
                                This action cannot be undone. This will
                                permanently delete{" "}
                                <span className="font-medium text-foreground">
                                    {fileIds.length}
                                </span>{" "}
                                {fileIds.length === 1 ? "file" : "files"} from
                                the server.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Progress Bar */}
                    {isDeleting && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Progress</span>
                                <span>{Math.round(currentProgress)}%</span>
                            </div>
                            <Progress
                                value={currentProgress}
                                className="w-full"
                            />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                    {successCount + errorCount} of{" "}
                                    {fileIds.length} processed
                                </span>
                                <div className="flex gap-4">
                                    <span className="text-green-600">
                                        ✓ {successCount}
                                    </span>
                                    <span className="text-red-600">
                                        ✗ {errorCount}
                                    </span>
                                    <span className="text-blue-600">
                                        ⏳ {pendingCount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Warning */}
                    {!isDeleting && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-destructive mb-1">
                                        Warning: This action is irreversible
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Once deleted, these files cannot be
                                        recovered. Make sure you have backups if
                                        needed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* File List */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                                Files to delete ({fileIds.length})
                            </h4>
                            {deleteResults.length > 0 && (
                                <div className="flex gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="text-green-600"
                                    >
                                        Success: {successCount}
                                    </Badge>
                                    {errorCount > 0 && (
                                        <Badge variant="destructive">
                                            Failed: {errorCount}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="max-h-60 overflow-y-auto border rounded-lg">
                            <div className="divide-y">
                                {fileIds.map((fileId) => {
                                    const file = fileMap.get(fileId);
                                    const result = deleteResults.find(
                                        (r) => r.fileId === fileId
                                    );

                                    return (
                                        <div
                                            key={fileId}
                                            className="flex items-center gap-3 p-3"
                                        >
                                            <div className="flex-shrink-0">
                                                {result ? (
                                                    getStatusIcon(result.status)
                                                ) : (
                                                    <Files className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">
                                                    {file?.name ||
                                                        `File ${fileId}`}
                                                </p>
                                                {file && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {file.type} •{" "}
                                                        {file.size
                                                            ? `${(
                                                                  file.size /
                                                                  1024
                                                              ).toFixed(1)} KB`
                                                            : "Unknown size"}
                                                    </p>
                                                )}
                                                {result?.error && (
                                                    <p className="text-sm text-red-600">
                                                        {result.error}
                                                    </p>
                                                )}
                                            </div>
                                            {result && (
                                                <Badge
                                                    variant={
                                                        result.status ===
                                                        "success"
                                                            ? "default"
                                                            : result.status ===
                                                              "error"
                                                            ? "destructive"
                                                            : "secondary"
                                                    }
                                                >
                                                    {result.status}
                                                </Badge>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Processing..." : "Cancel"}
                    </Button>
                    {!isDeleting && deleteResults.length === 0 && (
                        <Button
                            variant="destructive"
                            onClick={handleBatchDelete}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete {fileIds.length} Files
                        </Button>
                    )}
                    {deleteResults.length > 0 && !isDeleting && (
                        <Button
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Hook for programmatic batch deletion
export const useBatchDelete = () => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [progress, setProgress] = useState(0);

    const deleteBatch = async (
        fileIds: string[],
        options?: {
            onSuccess?: (deletedIds: string[]) => void;
            onError?: (error: string, failedIds: string[]) => void;
            onProgress?: (progress: {
                completed: number;
                total: number;
            }) => void;
            batchSize?: number;
        }
    ) => {
        setIsDeleting(true);
        setProgress(0);

        try {
            const batchSize = options?.batchSize || 10;

            if (fileIds.length <= batchSize) {
                // Single batch delete
                const response = await api.post("/api/v1/file/batch/delete", {
                    file_ids: fileIds,
                });

                const data = response.data || {};
                let successIds: string[] = [];
                let failedIds: string[] = [];

                const nestedData = data.data || data;

                if (
                    Array.isArray(nestedData.successful) ||
                    Array.isArray(nestedData.failed)
                ) {
                    successIds = (nestedData.successful || []) as string[];
                    failedIds = (nestedData.failed || []) as string[];
                } else if (Array.isArray(data.results)) {
                    const results = data.results || [];
                    const getResultId = (r: any) =>
                        r?.fileId ?? r?.file_id ?? r?.id;
                    successIds = results
                        .filter((r: any) => r.success)
                        .map((r: any) => getResultId(r))
                        .filter(Boolean);
                    failedIds = results
                        .filter((r: any) => !r.success)
                        .map((r: any) => getResultId(r))
                        .filter(Boolean);
                }

                setProgress(100);
                options?.onSuccess?.(successIds);
                if (failedIds.length > 0) {
                    options?.onError?.(
                        "Some files could not be deleted",
                        failedIds
                    );
                }
            } else {
                // Chunked delete
                const successIds: string[] = [];
                const failedIds: string[] = [];
                let completed = 0;

                for (let i = 0; i < fileIds.length; i += batchSize) {
                    const chunk = fileIds.slice(i, i + batchSize);

                    for (const fileId of chunk) {
                        try {
                            await api.delete(`/api/v1/file/${fileId}`);
                            successIds.push(fileId);
                        } catch (error) {
                            failedIds.push(fileId);
                        }

                        completed++;
                        const progressPercent =
                            (completed / fileIds.length) * 100;
                        setProgress(progressPercent);
                        options?.onProgress?.({
                            completed,
                            total: fileIds.length,
                        });
                    }
                }

                options?.onSuccess?.(successIds);
                if (failedIds.length > 0) {
                    options?.onError?.(
                        "Some files could not be deleted",
                        failedIds
                    );
                }
            }

            return true;
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || "Batch delete failed";
            options?.onError?.(errorMessage, fileIds);
            return false;
        } finally {
            setIsDeleting(false);
        }
    };

    return { deleteBatch, isDeleting, progress };
};
