import { File, FileText, HardDrive, ImageIcon } from "lucide-react";
import type { FileItem, FileStats as FileStatsType } from "../types";

interface FileStatsProps {
  files: FileItem[];
  selectedCount: number;
  stats?: FileStatsType | null;
  isLoading?: boolean;
  isSearchMode?: boolean;
}

export function FileStats({
  files,
  selectedCount,
  stats,
  isLoading,
  isSearchMode = false,
}: FileStatsProps) {
  // Always use files array for accurate counts (especially for search results)
  const totalFiles = files.length;
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const imageCount = files.filter((f) => f.type.includes("image")).length;
  const documentCount = files.filter((f) =>
    ["pdf", "document", "spreadsheet", "presentation", "text"].some((docType) =>
      f.type.includes(docType)
    )
  ).length;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">
            File Manager
          </h1>
          {selectedCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedCount} selected
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-4">
            <div className="rounded-md bg-primary/10 p-2">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isSearchMode ? "Search Results" : "Total Files"}
              </p>
              <p className="text-xl font-semibold text-foreground">
                {isLoading ? 0 : totalFiles}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-4">
            <div className="rounded-md bg-primary/10 p-2">
              <HardDrive className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Storage Used</p>
              <p className="text-xl font-semibold text-foreground">
                {formatBytes(totalSize)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-4">
            <div className="rounded-md bg-primary/10 p-2">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Images</p>
              <p className="text-xl font-semibold text-foreground">
                {imageCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-4">
            <div className="rounded-md bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Documents</p>
              <p className="text-xl font-semibold text-foreground">
                {documentCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
