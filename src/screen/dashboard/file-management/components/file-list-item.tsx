import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Check, Download, Edit2, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import type { FileItem } from "../types";
import { FileIcon } from "./file-icon";

interface FileListItemProps {
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

export function FileListItem({
    file,
    isSelected,
    isRenaming,
    onSelect,
    onDelete,
    onRename,
    onStartRename,
    onCancelRename,
    onDownload,
}: FileListItemProps) {
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
            if (isNaN(dateObj.getTime())) return "Unknown";

            return new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }).format(dateObj);
        } catch (error) {
            console.warn("Date formatting error:", error, date);
            return "Unknown";
        }
    };

    const formatModified = (updatedAt?: string | null) => {
        if (!updatedAt) return "Unmodified";
        const d = new Date(updatedAt);
        if (isNaN(d.getTime())) return "Unmodified";
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(d);
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
        <tr
            className={`transition-colors hover:bg-muted/50 ${
                isSelected ? "bg-primary/5" : ""
            }`}
        >
            <td className="px-4 py-3 min-w-[300px]">
                <div className="flex items-center gap-3">
                    {/* Select Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect();
                        }}
                        className="h-5 w-5 p-0"
                    >
                        {isSelected ? (
                            <div className="flex h-4 w-4 items-center justify-center rounded bg-primary">
                                <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                        ) : (
                            <div className="h-4 w-4 rounded border border-border" />
                        )}
                    </Button>

                    <FileIcon fileName={file.name} fileExt={file.ext} />
                    {isRenaming ? (
                        <div className="flex items-center gap-1 min-w-0 flex-1">
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
                                className="h-7 w-28 text-sm transition-all duration-200 shadow-none outline-none focus:outline-none focus:ring-0 bg-background text-foreground border border-input"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-sm text-muted-foreground">
                                {getFileExtension(file.name)}
                            </span>
                        </div>
                    ) : (
                        <span className="h-7 flex items-center min-w-0 flex-1 text-sm font-medium text-foreground truncate">
                            {file.name || "No name"}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3 w-24">
                <span className="text-sm font-medium text-muted-foreground">
                    {file.ext ? file.ext.replace(/^\./, "").toUpperCase() : ""}
                </span>
            </td>
            <td className="px-4 py-3 w-24">
                <span className="text-sm text-muted-foreground">
                    {formatBytes(file.size)}
                </span>
            </td>
            <td className="px-4 py-3 w-32">
                <span className="text-sm text-muted-foreground">
                    {formatDate(file.createdAt)}
                </span>
            </td>
            <td className="px-4 py-3 w-32">
                <span className="text-sm text-muted-foreground">
                    {formatModified(file.updatedAt)}
                </span>
            </td>
            <td className="px-4 py-3 text-right w-12">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
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
            </td>
        </tr>
    );
}
