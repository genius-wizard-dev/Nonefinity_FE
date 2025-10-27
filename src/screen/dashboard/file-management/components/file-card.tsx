"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Check,
    Download,
    Edit2,
    Info,
    MoreVertical,
    Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FileItem } from "../types";
import { FileIcon } from "./file-icon";

interface FileCardProps {
    file: FileItem;
    isSelected: boolean;
    isRenaming: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onRename: (newName: string) => void;
    onStartRename: () => void;
    onCancelRename: () => void;
    onDownload?: () => void;
}

export function FileCard({
    file,
    isSelected,
    isRenaming,
    onSelect,
    onDelete,
    onRename,
    onStartRename,
    onCancelRename,
    onDownload,
}: FileCardProps) {
    const [showInfo, setShowInfo] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);

    // Listen for close all info dialogs event
    useEffect(() => {
        const handleCloseAllInfoDialogs = () => {
            setShowInfo(false);
        };

        window.addEventListener(
            "closeAllInfoDialogs",
            handleCloseAllInfoDialogs
        );
        return () => {
            window.removeEventListener(
                "closeAllInfoDialogs",
                handleCloseAllInfoDialogs
            );
        };
    }, []);
    const getFileNameWithoutExtension = (name: string) => {
        const lastDotIndex = name.lastIndexOf(".");
        return lastDotIndex > 0 ? name.substring(0, lastDotIndex) : name;
    };

    const getFileExtension = (name: string) => {
        const lastDotIndex = name.lastIndexOf(".");
        return lastDotIndex > 0 ? name.substring(lastDotIndex) : "";
    };

    const [newName, setNewName] = useState(
        getFileNameWithoutExtension(file.name)
    );

    const handleRename = () => {
        if (
            newName.trim() &&
            newName !== getFileNameWithoutExtension(file.name)
        ) {
            onRename(newName + getFileExtension(file.name));
        }
        onCancelRename();
    };

    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return "Unknown";

        try {
            const dateObj = date instanceof Date ? date : new Date(date);
            if (isNaN(dateObj.getTime())) return "Invalid date";

            return new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }).format(dateObj);
        } catch (error) {
            console.warn("Date formatting error:", error, date);
            return "Invalid date";
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
        );
    };

    return (
        <div
            className={`group relative flex flex-col items-center gap-2 rounded-lg border bg-card p-4 transition-all hover:bg-accent/50 ${
                isSelected ? "border-primary bg-accent" : "border-border"
            }`}
        >
            {/* Select Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                }}
                className="absolute top-2 left-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            >
                {isSelected ? (
                    <div className="flex h-4 w-4 items-center justify-center rounded bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                ) : (
                    <div className="h-4 w-4 rounded border border-border" />
                )}
            </Button>

            <FileIcon
                fileName={file.name}
                fileExt={file.ext}
                className="h-12 w-12"
            />

            <div className="w-full text-center">
                {isRenaming ? (
                    <div className="flex flex-col items-center gap-1">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => {
                                e.stopPropagation(); // Prevent event bubbling to parent handlers
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleRename();
                                }
                                if (e.key === "Escape") {
                                    e.preventDefault();
                                    onCancelRename();
                                }
                            }}
                            className="h-7 w-28 text-sm text-center transition-all duration-200 shadow-none outline-none focus:outline-none focus:ring-0 bg-background text-foreground border border-input"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-xs text-muted-foreground">
                            {getFileExtension(file.name)}
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1">
                        <p className="h-7 flex items-center text-sm font-medium text-foreground truncate max-w-24">
                            {getFileNameWithoutExtension(file.name)}
                        </p>
                        <span className="text-xs text-muted-foreground">
                            {getFileExtension(file.name)}
                        </span>
                    </div>
                )}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onStartRename}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowInfo(true);
                        }}
                    >
                        <Info className="mr-2 h-4 w-4" />
                        Info
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={onDelete}
                        className="text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showInfo} onOpenChange={setShowInfo}>
                <DialogContent
                    ref={dialogRef}
                    className="sm:max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <DialogHeader>
                        <DialogTitle>File Information</DialogTitle>
                        <DialogDescription>
                            Detailed information about this file
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Name
                                </label>
                                <p className="text-sm">{file.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Type
                                </label>
                                <p className="text-sm">
                                    {file.ext
                                        ? file.ext
                                              .replace(/^\./, "")
                                              .toUpperCase()
                                        : "Unknown"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Size
                                </label>
                                <p className="text-sm">
                                    {formatBytes(file.size)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Extension
                                </label>
                                <p className="text-sm">{file.ext || "None"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Modified
                                </label>
                                <p className="text-sm">
                                    {formatDate(file.modified)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Created
                                </label>
                                <p className="text-sm">
                                    {formatDate(new Date(file.createdAt))}
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
