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
import { Trash2, AlertTriangle } from "lucide-react";
import api from "@/lib/axios";

interface FileDeleteProps {
    fileId: string;
    fileName?: string;
    onDeleteSuccess?: (fileId: string) => void;
    onDeleteError?: (error: string) => void;
    trigger?: React.ReactNode;
    disabled?: boolean;
}

export const FileDelete: React.FC<FileDeleteProps> = ({
    fileId,
    fileName,
    onDeleteSuccess,
    onDeleteError,
    trigger,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!fileId) return;

        setIsDeleting(true);
        try {
            await api.delete(`/api/v1/file/${fileId}`);

            setIsOpen(false);
            onDeleteSuccess?.(fileId);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || "Failed to delete file";
            onDeleteError?.(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const defaultTrigger = (
        <Button
            variant="destructive"
            size="sm"
            disabled={disabled}
            className="flex items-center gap-2"
        >
            <Trash2 className="h-4 w-4" />
            Delete
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Confirm File Deletion
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete the file
                        {fileName && (
                            <>
                                {" "}
                                <span className="font-medium text-foreground">
                                    "{fileName}"
                                </span>
                            </>
                        )}{" "}
                        from the server.
                        {!fileId && (
                            <>
                                <br />
                                <span className="text-destructive">
                                    No file selected to delete.
                                </span>
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-destructive mb-1">
                                Warning: This action is irreversible
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Once deleted, this file cannot be recovered.
                                Make sure you have a backup if needed.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting || !fileId}
                        className="flex items-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Delete File
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Alternative hook-based approach for programmatic deletion
export const useFileDelete = () => {
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteFile = async (
        fileId: string,
        options?: {
            onSuccess?: (fileId: string) => void;
            onError?: (error: string) => void;
        }
    ) => {
        setIsDeleting(true);
        try {
            await api.delete(`/api/v1/file/${fileId}`);
            options?.onSuccess?.(fileId);
            return true;
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || "Failed to delete file";
            options?.onError?.(errorMessage);
            return false;
        } finally {
            setIsDeleting(false);
        }
    };

    return { deleteFile, isDeleting };
};
