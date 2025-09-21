import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Files,
    Search,
    Eye,
    MoreHorizontal,
    RefreshCw,
    Grid,
    List,
    SortAsc,
    SortDesc,
    Database,
} from "lucide-react";
import { Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { FileDelete } from "./FileDelete";
import { BatchDelete } from "./BatchDelete";
import { FileRename } from "./FileRename";
import dayjs from "dayjs";

export interface FileItem {
    id: string;
    name: string;
    type: string;
    size: number;
    createdAt: string;
    updatedAt: string;
    url?: string;
    owner?: string;
    tags?: string[];
}

interface FileListProps {
    onFileSelect?: (file: FileItem) => void;
    onFilesSelect?: (files: FileItem[]) => void;
    onAfterDelete?: () => void;
    selectable?: boolean;
    multiSelect?: boolean;
    showActions?: boolean;
    pageSize?: number;
}

type SortField = "name" | "type" | "size" | "createdAt" | "updatedAt";
type SortOrder = "asc" | "desc";
type ViewMode = "table" | "grid";

export const FileList: React.FC<FileListProps> = ({
    onFileSelect,
    onFilesSelect,
    onAfterDelete,
    selectable = false,
    multiSelect = false,
    showActions = true,
    pageSize = 10,
}) => {
    const navigate = useNavigate();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [currentPage, setCurrentPage] = useState(1);
    const [fileType, setFileType] = useState<string>("");
    const [limit, setLimit] = useState<number>(50);
    const [availableFileTypes, setAvailableFileTypes] = useState<string[]>([]);

    const fetchFileTypes = async () => {
        try {
            const res = await api.get("/api/v1/file/types");
            const arr = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.types)
                ? res.data.types
                : Array.isArray(res.data?.data)
                ? res.data.data
                : [];
            setAvailableFileTypes(arr.map((t: any) => String(t)));
        } catch (e) {
            // non-fatal
        }
    };

    const fetchFiles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            let rawList: any[] = [];
            // Use search endpoint only when q is provided. API requires q even if file_type is set.
            const hasQuery = searchQuery.trim().length > 0;
            if (hasQuery) {
                const params = new URLSearchParams();
                if (searchQuery.trim()) params.append("q", searchQuery.trim());
                if (fileType) params.append("file_type", fileType);
                if (limit) params.append("limit", String(limit));
                const res = await api.get(
                    `/api/v1/file/search?${params.toString()}`
                );
                const payload = res.data;
                rawList = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.files)
                    ? payload.files
                    : Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload?.items)
                    ? payload.items
                    : Array.isArray(payload?.results)
                    ? payload.results
                    : [];
            } else {
                const res = await api.get("/api/v1/file/list");
                const payload = res.data;
                rawList = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.files)
                    ? payload.files
                    : Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload?.items)
                    ? payload.items
                    : Array.isArray(payload?.results)
                    ? payload.results
                    : [];
            }

            // Map server fields (snake_case) to FileItem shape
            const mapped: FileItem[] = rawList.map((it: any) => {
                const nameFromParts = it?.file_name
                    ? `${it.file_name}${it.file_ext || ""}`
                    : undefined;
                const derivedName =
                    it?.name ||
                    nameFromParts ||
                    it?.filename ||
                    it?.originalName ||
                    (typeof it?.file_path === "string"
                        ? it.file_path.split("/").pop()
                        : undefined) ||
                    "Untitled";

                const createdAt =
                    it?.createdAt ||
                    it?.created_at ||
                    it?.created ||
                    it?.uploadedAt;
                const updatedAt =
                    it?.updatedAt ||
                    it?.updated_at ||
                    it?.modifiedAt ||
                    createdAt;

                return {
                    id:
                        it?.id ||
                        it?._id ||
                        it?.file_id ||
                        String(Math.random()),
                    name: String(derivedName),
                    type: it?.type || it?.file_type || "",
                    size: Number(it?.size ?? it?.file_size ?? 0),
                    createdAt: createdAt || new Date().toISOString(),
                    updatedAt: updatedAt || new Date().toISOString(),
                    url: it?.url || it?.link,
                    owner: it?.owner || it?.owner_id || it?.userId,
                    tags: it?.tags || it?.labels,
                } as FileItem;
            });

            setFiles(mapped);
            setFilteredFiles(mapped);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || "Failed to fetch files";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
        fetchFileTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounced remote fetch when search or fileType changes
    useEffect(() => {
        const t = setTimeout(() => {
            fetchFiles();
        }, 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, fileType, limit]);

    useEffect(() => {
        let filtered = [...files];

        // Apply local file type filter when provided (server also filters when q is present)
        if (fileType) {
            filtered = filtered.filter(
                (f) => (f.type || "").toLowerCase() === fileType.toLowerCase()
            );
        }

        // Sort files
        filtered.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            if (sortField === "size") {
                aValue = Number(aValue);
                bValue = Number(bValue);
            } else if (sortField === "createdAt" || sortField === "updatedAt") {
                aValue = new Date(aValue as string).getTime();
                bValue = new Date(bValue as string).getTime();
            } else {
                aValue = String(aValue).toLowerCase();
                bValue = String(bValue).toLowerCase();
            }

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        setFilteredFiles(filtered);
        setCurrentPage(1);
    }, [files, searchQuery, sortField, sortOrder, fileType]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const handleFileSelect = (file: FileItem) => {
        if (!selectable) return;

        if (multiSelect) {
            const newSelected = new Set(selectedFiles);
            if (newSelected.has(file.id)) {
                newSelected.delete(file.id);
            } else {
                newSelected.add(file.id);
            }
            setSelectedFiles(newSelected);
            onFilesSelect?.(files.filter((f) => newSelected.has(f.id)));
        } else {
            setSelectedFiles(new Set([file.id]));
            onFileSelect?.(file);
        }
    };

    const handleSelectAll = () => {
        if (selectedFiles.size === filteredFiles.length) {
            setSelectedFiles(new Set());
            onFilesSelect?.([]);
        } else {
            const allIds = new Set(filteredFiles.map((f) => f.id));
            setSelectedFiles(allIds);
            onFilesSelect?.(filteredFiles);
        }
    };

    const handleFileDeleted = (fileId: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        setSelectedFiles((prev) => {
            const newSelected = new Set(prev);
            newSelected.delete(fileId);
            return newSelected;
        });
        onAfterDelete?.();
    };

    const handleFileRenamed = (fileId: string, newName: string) => {
        setFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, name: newName } : f))
        );
    };

    const handleBatchDeleteSuccess = (deletedIds: string[]) => {
        setFiles((prev) => prev.filter((f) => !deletedIds.includes(f.id)));
        setSelectedFiles(new Set());
        onAfterDelete?.();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getFileIcon = (_type: string) => {
        // You can expand this with more specific icons based on file type
        return <Files className="h-4 w-4" />;
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return null;
        return sortOrder === "asc" ? (
            <SortAsc className="h-4 w-4" />
        ) : (
            <SortDesc className="h-4 w-4" />
        );
    };

    const paginatedFiles = filteredFiles.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );
    const totalPages = Math.ceil(filteredFiles.length / pageSize);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center p-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2">Loading files...</span>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-8">
                    <div className="text-center">
                        <p className="text-destructive mb-4">{error}</p>
                        <Button onClick={fetchFiles} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Files className="h-5 w-5" />
                        Files ({filteredFiles.length})
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setViewMode(
                                    viewMode === "table" ? "grid" : "table"
                                )
                            }
                        >
                            {viewMode === "table" ? (
                                <Grid className="h-4 w-4" />
                            ) : (
                                <List className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            onClick={fetchFiles}
                            variant="outline"
                            size="sm"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="w-48">
                        <select
                            value={fileType}
                            onChange={(e) => setFileType(e.target.value)}
                            className="w-full p-2 border rounded-md bg-background"
                        >
                            <option value="">All types</option>
                            {availableFileTypes.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-32">
                        <Input
                            type="number"
                            min={1}
                            max={100}
                            value={limit}
                            onChange={(e) =>
                                setLimit(
                                    Math.max(
                                        1,
                                        Math.min(
                                            100,
                                            Number(e.target.value) || 50
                                        )
                                    )
                                )
                            }
                            placeholder="Limit"
                        />
                    </div>
                    {selectedFiles.size > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {selectedFiles.size} selected
                            </span>
                            <BatchDelete
                                fileIds={[...selectedFiles]}
                                files={files.filter((f) =>
                                    selectedFiles.has(f.id)
                                )}
                                onDeleteSuccess={handleBatchDeleteSuccess}
                            />
                        </div>
                    )}
                </div>

                {/* Table View */}
                {viewMode === "table" && (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {selectable && multiSelect && (
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={
                                                    filteredFiles.length > 0 &&
                                                    selectedFiles.size ===
                                                        filteredFiles.length
                                                }
                                                onCheckedChange={
                                                    handleSelectAll
                                                }
                                            />
                                        </TableHead>
                                    )}
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted"
                                        onClick={() => handleSort("name")}
                                    >
                                        <div className="flex items-center gap-2">
                                            Name
                                            {getSortIcon("name")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted"
                                        onClick={() => handleSort("type")}
                                    >
                                        <div className="flex items-center gap-2">
                                            Type
                                            {getSortIcon("type")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted"
                                        onClick={() => handleSort("size")}
                                    >
                                        <div className="flex items-center gap-2">
                                            Size
                                            {getSortIcon("size")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted"
                                        onClick={() => handleSort("createdAt")}
                                    >
                                        <div className="flex items-center gap-2">
                                            Created
                                            {getSortIcon("createdAt")}
                                        </div>
                                    </TableHead>
                                    {showActions && (
                                        <TableHead className="w-32">
                                            Actions
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedFiles.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={
                                                selectable && multiSelect
                                                    ? 6
                                                    : 5
                                            }
                                            className="text-center py-8"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Files className="h-8 w-8 text-muted-foreground" />
                                                <span className="text-muted-foreground">
                                                    {searchQuery
                                                        ? "No files match your search"
                                                        : "No files found"}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedFiles.map((file) => (
                                        <TableRow
                                            key={file.id}
                                            className={`cursor-pointer hover:bg-muted/50 ${
                                                selectedFiles.has(file.id)
                                                    ? "bg-muted"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleFileSelect(file)
                                            }
                                        >
                                            {selectable && multiSelect && (
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedFiles.has(
                                                            file.id
                                                        )}
                                                        onCheckedChange={() =>
                                                            handleFileSelect(
                                                                file
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {getFileIcon(file.type)}
                                                    <span className="truncate">
                                                        {file.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{file.type}</TableCell>
                                            <TableCell>
                                                {formatFileSize(file.size)}
                                            </TableCell>
                                            <TableCell>
                                                {dayjs(file.createdAt).format(
                                                    "MMM D, YYYY"
                                                )}
                                            </TableCell>
                                            {showActions && (
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <FileRename
                                                            fileId={file.id}
                                                            currentName={
                                                                file.name
                                                            }
                                                            onRenameSuccess={
                                                                handleFileRenamed
                                                            }
                                                            trigger={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                >
                                                                    <Edit3 className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                        />
                                                        {file.url && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    window.open(
                                                                        file.url,
                                                                        "_blank"
                                                                    );
                                                                }}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(
                                                                    `/dashboard/datasets?tab=convert&fileId=${file.id}`
                                                                );
                                                            }}
                                                            title="Convert to Dataset"
                                                        >
                                                            <Database className="h-4 w-4" />
                                                        </Button>
                                                        <FileDelete
                                                            fileId={file.id}
                                                            fileName={file.name}
                                                            onDeleteSuccess={
                                                                handleFileDeleted
                                                            }
                                                            trigger={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Grid View */}
                {viewMode === "grid" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {paginatedFiles.length === 0 ? (
                            <div className="col-span-full text-center py-8 border rounded-md">
                                <div className="flex flex-col items-center gap-2">
                                    <Files className="h-8 w-8 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        {searchQuery
                                            ? "No files match your search"
                                            : "No files found"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            paginatedFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className={`relative group border rounded-lg p-3 hover:shadow-sm transition cursor-pointer ${
                                        selectedFiles.has(file.id)
                                            ? "ring-2 ring-primary"
                                            : ""
                                    }`}
                                    onClick={() => handleFileSelect(file)}
                                >
                                    {/* Selection checkbox for multi-select */}
                                    {selectable && multiSelect && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <Checkbox
                                                checked={selectedFiles.has(
                                                    file.id
                                                )}
                                                onCheckedChange={() =>
                                                    handleFileSelect(file)
                                                }
                                            />
                                        </div>
                                    )}

                                    {/* File icon and name */}
                                    <div className="flex items-start gap-2 pr-10">
                                        {getFileIcon(file.type)}
                                        <div className="min-w-0">
                                            <div className="font-medium truncate">
                                                {file.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {file.type || "unknown"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Meta */}
                                    <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between">
                                        <span>{formatFileSize(file.size)}</span>
                                        <span>
                                            {dayjs(file.createdAt).format(
                                                "MMM D, YYYY"
                                            )}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    {showActions && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                                            <FileRename
                                                fileId={file.id}
                                                currentName={file.name}
                                                onRenameSuccess={
                                                    handleFileRenamed
                                                }
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                }
                                            />
                                            {file.url && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(
                                                            file.url!,
                                                            "_blank"
                                                        );
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <FileDelete
                                                fileId={file.id}
                                                fileName={file.name}
                                                onDeleteSuccess={
                                                    handleFileDeleted
                                                }
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * pageSize + 1} to{" "}
                            {Math.min(
                                currentPage * pageSize,
                                filteredFiles.length
                            )}{" "}
                            of {filteredFiles.length} files
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(1, prev - 1)
                                    )
                                }
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(totalPages, prev + 1)
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
