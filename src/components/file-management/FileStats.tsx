import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    Files,
    HardDrive,
    Users,
    Calendar,
    TrendingUp,
    RefreshCw,
    Download,
    AlertCircle,
} from "lucide-react";
import api from "@/lib/axios";

interface FileStats {
    totalFiles: number;
    totalSize: number;
    totalUsers: number;
    filesByType: Record<string, number>;
    filesByMonth: Record<string, number>;
    storageUsage: {
        used: number;
        available: number;
        percentage: number;
    };
    recentActivity: {
        uploadsToday: number;
        deletesToday: number;
        uploadsThisWeek: number;
        deletesThisWeek: number;
    };
    topFileTypes: Array<{
        type: string;
        count: number;
        size: number;
    }>;
    averageFileSize: number;
    oldestFile: {
        name: string;
        createdAt: string;
    };
    newestFile: {
        name: string;
        createdAt: string;
    };
}

interface FileStatsProps {
    refreshInterval?: number; // in seconds
    showExportButton?: boolean;
}

export const FileStatsComponent: React.FC<FileStatsProps> = ({
    refreshInterval = 300, // 5 minutes default
    showExportButton = true,
}) => {
    const [stats, setStats] = useState<FileStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchStats = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get("/api/v1/file/stats");
            setStats(response.data);
            setLastUpdated(new Date());
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                "Failed to fetch file statistics";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        // Set up auto-refresh
        if (refreshInterval > 0) {
            const interval = setInterval(fetchStats, refreshInterval * 1000);
            return () => clearInterval(interval);
        }
    }, [refreshInterval]);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat().format(num);
    };

    const exportStats = async () => {
        try {
            const response = await api.get("/api/v1/file/stats", {
                headers: {
                    Accept: "text/csv",
                },
                responseType: "blob",
            });

            const blob = new Blob([response.data], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `file-stats-${
                new Date().toISOString().split("T")[0]
            }.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export stats:", error);
        }
    };

    if (isLoading && !stats) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center p-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2">Loading statistics...</span>
                </CardContent>
            </Card>
        );
    }

    if (error && !stats) {
        return (
            <Card>
                <CardContent className="p-8">
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                        <p className="text-destructive mb-4">{error}</p>
                        <Button onClick={fetchStats} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            File Statistics
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {showExportButton && (
                                <Button
                                    onClick={exportStats}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            )}
                            <Button
                                onClick={fetchStats}
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${
                                        isLoading ? "animate-spin" : ""
                                    }`}
                                />
                            </Button>
                        </div>
                    </div>
                    {lastUpdated && (
                        <p className="text-sm text-muted-foreground">
                            Last updated: {lastUpdated.toLocaleString()}
                        </p>
                    )}
                </CardHeader>
            </Card>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Files
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatNumber(stats.totalFiles)}
                                </p>
                            </div>
                            <Files className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Size
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatFileSize(stats.totalSize)}
                                </p>
                            </div>
                            <HardDrive className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Users
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatNumber(stats.totalUsers)}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Avg File Size
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatFileSize(stats.averageFileSize)}
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Storage Usage */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5" />
                        Storage Usage
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span>
                                Used: {formatFileSize(stats.storageUsage.used)}
                            </span>
                            <span>
                                Available:{" "}
                                {formatFileSize(stats.storageUsage.available)}
                            </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all duration-300 ${
                                    stats.storageUsage.percentage > 90
                                        ? "bg-red-500"
                                        : stats.storageUsage.percentage > 75
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                }`}
                                style={{
                                    width: `${Math.min(
                                        stats.storageUsage.percentage,
                                        100
                                    )}%`,
                                }}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            {stats.storageUsage.percentage.toFixed(1)}% used
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity & Top File Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Today</h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Uploads:
                                        </span>
                                        <span className="font-medium text-green-600">
                                            +{stats.recentActivity.uploadsToday}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Deletes:
                                        </span>
                                        <span className="font-medium text-red-600">
                                            -{stats.recentActivity.deletesToday}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">
                                    This Week
                                </h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Uploads:
                                        </span>
                                        <span className="font-medium text-green-600">
                                            +
                                            {
                                                stats.recentActivity
                                                    .uploadsThisWeek
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Deletes:
                                        </span>
                                        <span className="font-medium text-red-600">
                                            -
                                            {
                                                stats.recentActivity
                                                    .deletesThisWeek
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Top File Types */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top File Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.topFileTypes
                                .slice(0, 5)
                                .map((fileType, index) => (
                                    <div
                                        key={fileType.type}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {fileType.type || "Unknown"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatFileSize(
                                                        fileType.size
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-sm">
                                                {formatNumber(fileType.count)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                files
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* File Age Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Oldest File</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="font-medium truncate">
                                {stats.oldestFile.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Created:{" "}
                                {new Date(
                                    stats.oldestFile.createdAt
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Newest File</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="font-medium truncate">
                                {stats.newestFile.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Created:{" "}
                                {new Date(
                                    stats.newestFile.createdAt
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
