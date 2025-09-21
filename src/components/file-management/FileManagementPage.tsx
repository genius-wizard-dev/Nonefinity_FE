import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen, Upload, RefreshCw, HardDrive, Layers } from "lucide-react";

// Import all file management components
import { FileUpload } from "./FileUpload";
import { FileList, type FileItem } from "./FileList";
import api from "@/lib/axios";

interface FileManagementPageProps {
    defaultTab?: string;
    allowUpload?: boolean;
}

export const FileManagementPage: React.FC<FileManagementPageProps> = ({
    defaultTab = "files",
    allowUpload = true,
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    // Minimal stats for header
    const [headerStats, setHeaderStats] = useState<{
        total_files: number;
        total_size_mb: number;
        file_types: Record<string, number>;
    } | null>(null);
    const [isStatsLoading, setIsStatsLoading] = useState(false);

    // Trigger refresh across components
    const handleRefresh = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1);
    }, []);

    // Handle file upload completion
    const handleUploadComplete = useCallback(
        (file: any) => {
            console.log("File uploaded:", file);
            handleRefresh();
        },
        [handleRefresh]
    );

    // Batch deletion handled within FileList component

    // Handle file selection from search or list (optional hook for future use)
    const handleFileSelect = useCallback((_file: FileItem) => {
        // no-op
    }, []);

    // Fetch minimal stats for header from /api/v1/file/stats
    const fetchHeaderStats = useCallback(async () => {
        try {
            setIsStatsLoading(true);
            const res = await api.get("/api/v1/file/stats");
            const payload = res.data?.data ?? res.data;
            setHeaderStats({
                total_files: Number(payload?.total_files ?? 0),
                total_size_mb: Number(payload?.total_size_mb ?? 0),
                file_types: payload?.file_types ?? {},
            });
        } catch {
            setHeaderStats(null);
        } finally {
            setIsStatsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHeaderStats();
    }, [fetchHeaderStats, refreshTrigger]);

    type TabDef = {
        id: string;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        component: React.ReactNode;
    };

    const tabs: TabDef[] = [
        {
            id: "files",
            label: "Files",
            icon: FolderOpen,
            component: (
                <div className="space-y-6">
                    {/* Top-level selected actions removed; controls live inside FileList */}

                    {/* File List */}
                    <FileList
                        key={refreshTrigger}
                        onFileSelect={handleFileSelect}
                        // onFilesSelect removed: selection summary moved inside list header
                        onAfterDelete={handleRefresh}
                        selectable={true}
                        multiSelect={true}
                        showActions={true}
                        pageSize={20}
                    />
                </div>
            ),
        },
    ];

    // Conditionally add Upload tab
    if (allowUpload) {
        tabs.push({
            id: "upload",
            label: "Upload",
            icon: Upload,
            component: (
                <Card id="upload-tab">
                    <CardContent className="p-4">
                        <FileUpload
                            onUploadComplete={handleUploadComplete}
                            onUploadError={(error) =>
                                console.error("Upload error:", error)
                            }
                            multiple={true}
                            maxFileSize={100}
                        />
                    </CardContent>
                </Card>
            ),
        });
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        File Management
                    </h1>
                    <p className="text-muted-foreground">
                        Upload, organize, and manage your files
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleRefresh} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Quick Stats Cards (from /api/v1/file/stats) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <FolderOpen className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Files
                                </p>
                                <p className="text-lg font-semibold">
                                    {isStatsLoading
                                        ? "—"
                                        : headerStats?.total_files ?? "—"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Size
                                </p>
                                <p className="text-lg font-semibold">
                                    {isStatsLoading
                                        ? "—"
                                        : headerStats
                                        ? `${headerStats.total_size_mb.toFixed(
                                              2
                                          )} MB`
                                        : "—"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-orange-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    File Types
                                </p>
                                <p className="text-lg font-semibold">
                                    {isStatsLoading
                                        ? "—"
                                        : headerStats
                                        ? Object.keys(
                                              headerStats.file_types || {}
                                          ).length
                                        : "—"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
            >
                <TabsList className="grid w-full grid-cols-2">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="flex items-center justify-center gap-2 w-full"
                            >
                                <IconComponent className="h-4 w-4" />
                                {tab.label}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {tabs.map((tab) => (
                    <TabsContent
                        key={tab.id}
                        value={tab.id}
                        className="space-y-6"
                    >
                        {tab.component}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};
