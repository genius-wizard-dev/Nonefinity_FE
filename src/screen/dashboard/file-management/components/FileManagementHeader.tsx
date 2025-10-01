import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import React from "react";

interface FileManagementHeaderProps {
  onRefresh: () => void;
}

export const FileManagementHeader: React.FC<FileManagementHeaderProps> = ({
  onRefresh,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">File Management</h1>
        <p className="text-muted-foreground">
          Upload, organize, and manage your files
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
};
