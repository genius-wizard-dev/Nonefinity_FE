import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, HardDrive, Layers } from "lucide-react";
import React from "react";

interface FileStats {
  total_files: number;
  total_size_mb: number;
  file_types: Record<string, number>;
}

interface FileStatsCardsProps {
  stats: FileStats | null;
  isLoading: boolean;
}

export const FileStatsCards: React.FC<FileStatsCardsProps> = ({
  stats,
  isLoading,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Files Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Files</p>
              <p className="text-lg font-semibold">
                {isLoading ? "—" : stats?.total_files ?? "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Size Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Size</p>
              <p className="text-lg font-semibold">
                {isLoading
                  ? "—"
                  : stats
                  ? `${stats.total_size_mb.toFixed(2)} MB`
                  : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Types Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">File Types</p>
              <p className="text-lg font-semibold">
                {isLoading
                  ? "—"
                  : stats
                  ? Object.keys(stats.file_types || {}).length
                  : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
