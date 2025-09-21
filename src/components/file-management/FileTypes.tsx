import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    FileType,
    RefreshCw,
    Filter,
    Grid,
    List,
    Files,
    Image,
    FileText,
    FileVideo,
    FileAudio,
    Archive,
    Code,
} from "lucide-react";
import api from "@/lib/axios";

interface FileTypeInfo {
    type: string;
    extension: string;
    count: number;
    totalSize: number;
    category:
        | "document"
        | "image"
        | "video"
        | "audio"
        | "code"
        | "archive"
        | "other";
    description?: string;
    icon?: string;
}

interface FileTypesProps {
    onTypeSelect?: (type: string) => void;
    selectedTypes?: string[];
    showFilter?: boolean;
    viewMode?: "grid" | "list";
}

export const FileTypes: React.FC<FileTypesProps> = ({
    onTypeSelect,
    selectedTypes = [],
    showFilter = true,
    viewMode: initialViewMode = "grid",
}) => {
    const [fileTypes, setFileTypes] = useState<FileTypeInfo[]>([]);
    const [filteredTypes, setFilteredTypes] = useState<FileTypeInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">(initialViewMode);

    const categories = [
        { id: "all", label: "All Types", icon: Files },
        { id: "document", label: "Documents", icon: FileText },
        { id: "image", label: "Images", icon: Image },
        { id: "video", label: "Videos", icon: FileVideo },
        { id: "audio", label: "Audio", icon: FileAudio },
        { id: "code", label: "Code", icon: Code },
        { id: "archive", label: "Archives", icon: Archive },
        { id: "other", label: "Other", icon: Files },
    ];

    const fetchFileTypes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get("/api/v1/file/types");
            const payload = response.data;
            const types: FileTypeInfo[] = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.types)
                ? payload.types
                : Array.isArray(payload?.data)
                ? payload.data
                : Array.isArray(payload?.items)
                ? payload.items
                : Array.isArray(payload?.results)
                ? payload.results
                : [];
            setFileTypes(types);
            setFilteredTypes(types);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || "Failed to fetch file types";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFileTypes();
    }, []);

    useEffect(() => {
        let filtered = fileTypes;

        if (selectedCategory !== "all") {
            filtered = fileTypes.filter(
                (type) => type.category === selectedCategory
            );
        }

        // Sort by count (descending)
        filtered.sort((a, b) => b.count - a.count);

        setFilteredTypes(filtered);
    }, [fileTypes, selectedCategory]);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat().format(num);
    };

    const getTypeIcon = (category: string) => {
        switch (category) {
            case "document":
                return <FileText className="h-6 w-6" />;
            case "image":
                return <Image className="h-6 w-6" />;
            case "video":
                return <FileVideo className="h-6 w-6" />;
            case "audio":
                return <FileAudio className="h-6 w-6" />;
            case "code":
                return <Code className="h-6 w-6" />;
            case "archive":
                return <Archive className="h-6 w-6" />;
            default:
                return <Files className="h-6 w-6" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "document":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case "image":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "video":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
            case "audio":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
            case "code":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case "archive":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    };

    const handleTypeClick = (type: string) => {
        onTypeSelect?.(type);
    };

    const totalFiles = fileTypes.reduce((sum, type) => sum + type.count, 0);
    const totalSize = fileTypes.reduce((sum, type) => sum + type.totalSize, 0);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center p-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2">Loading file types...</span>
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
                        <Button onClick={fetchFileTypes} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FileType className="h-5 w-5" />
                            File Types ({filteredTypes.length})
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setViewMode(
                                        viewMode === "grid" ? "list" : "grid"
                                    )
                                }
                            >
                                {viewMode === "grid" ? (
                                    <List className="h-4 w-4" />
                                ) : (
                                    <Grid className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                onClick={fetchFileTypes}
                                variant="outline"
                                size="sm"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold">
                                {filteredTypes.length}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Types
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">
                                {formatNumber(totalFiles)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Total Files
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">
                                {formatFileSize(totalSize)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Total Size
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">
                                {categories.length - 1}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Categories
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Category Filter */}
            {showFilter && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Filter className="h-4 w-4" />
                            Filter by Category
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => {
                                const IconComponent = category.icon;
                                const isSelected =
                                    selectedCategory === category.id;
                                return (
                                    <Button
                                        key={category.id}
                                        variant={
                                            isSelected ? "default" : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                            setSelectedCategory(category.id)
                                        }
                                        className="flex items-center gap-2"
                                    >
                                        <IconComponent className="h-4 w-4" />
                                        {category.label}
                                        {category.id !== "all" && (
                                            <Badge
                                                variant="secondary"
                                                className="ml-1"
                                            >
                                                {
                                                    fileTypes.filter(
                                                        (t) =>
                                                            t.category ===
                                                            category.id
                                                    ).length
                                                }
                                            </Badge>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* File Types Display */}
            {filteredTypes.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-8">
                        <FileType className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            {selectedCategory === "all"
                                ? "No file types found"
                                : `No ${selectedCategory} files found`}
                        </p>
                    </CardContent>
                </Card>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTypes.map((type) => (
                        <Card
                            key={type.type}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                                selectedTypes.includes(type.type)
                                    ? "ring-2 ring-primary"
                                    : ""
                            }`}
                            onClick={() => handleTypeClick(type.type)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            {getTypeIcon(type.category)}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {type.type || "Unknown"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                .{type.extension}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        className={getCategoryColor(
                                            type.category
                                        )}
                                    >
                                        {type.category}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Files:
                                        </span>
                                        <span className="font-medium">
                                            {formatNumber(type.count)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Size:
                                        </span>
                                        <span className="font-medium">
                                            {formatFileSize(type.totalSize)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Avg Size:
                                        </span>
                                        <span className="font-medium">
                                            {formatFileSize(
                                                type.totalSize / type.count
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {type.description && (
                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                        {type.description}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {filteredTypes.map((type) => (
                                <div
                                    key={type.type}
                                    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 ${
                                        selectedTypes.includes(type.type)
                                            ? "bg-primary/5"
                                            : ""
                                    }`}
                                    onClick={() => handleTypeClick(type.type)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-muted">
                                            {getTypeIcon(type.category)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">
                                                    {type.type || "Unknown"}
                                                </p>
                                                <Badge
                                                    className={getCategoryColor(
                                                        type.category
                                                    )}
                                                    variant="secondary"
                                                >
                                                    {type.category}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                .{type.extension}
                                                {type.description &&
                                                    ` • ${type.description}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            {formatNumber(type.count)} files
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatFileSize(type.totalSize)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
