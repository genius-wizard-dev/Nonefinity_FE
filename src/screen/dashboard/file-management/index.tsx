import React, { useCallback, useEffect, useState } from "react";

// Import all file management components
import {
  FileManagementHeader,
  FileManagementTabs,
  FileStatsCards,
  type FileItem,
} from "./components";
import { FileService } from "./services";

interface FileManagementPageProps {
  defaultTab?: string;
  allowUpload?: boolean;
}

const FileManagement: React.FC<FileManagementPageProps> = ({
  defaultTab = "files",
  allowUpload = true,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [headerStats, setHeaderStats] = useState<{
    total_files: number;
    total_size_mb: number;
    file_types: Record<string, number>;
  } | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleUploadComplete = useCallback(
    (file: unknown) => {
      console.log("File uploaded:", file);
      handleRefresh();
    },
    [handleRefresh]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFileSelect = useCallback((_file: FileItem) => {
    // no-op
  }, []);

  const fetchHeaderStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      const stats = await FileService.getFileStats();
      setHeaderStats(stats);
    } catch {
      setHeaderStats(null);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeaderStats();
  }, [fetchHeaderStats, refreshTrigger]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <FileManagementHeader onRefresh={handleRefresh} />

      <FileStatsCards stats={headerStats} isLoading={isStatsLoading} />

      <FileManagementTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        allowUpload={allowUpload}
        onFileSelect={handleFileSelect}
        onUploadComplete={handleUploadComplete}
        onUploadError={(error) => console.error("Upload error:", error)}
        onAfterDelete={handleRefresh}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default FileManagement;
