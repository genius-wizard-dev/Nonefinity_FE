import { File, FileText, HardDrive, Table } from "lucide-react";
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
  // Prefer backend stats when available; fall back to client-side counts
  const backendTotalFiles = stats?.totalFiles ?? (stats as any)?.total_files;
  const backendTotalSize = stats?.totalSize ?? (stats as any)?.total_size;

  const totalFiles = files.length;
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  const displayTotalFiles =
    !isSearchMode && backendTotalFiles !== undefined
      ? backendTotalFiles
      : totalFiles;

  const displayTotalSize =
    !isSearchMode && backendTotalSize !== undefined
      ? backendTotalSize
      : totalSize;
  // Helper to get extension from file (prefer ext field, fallback to name)
  const getExt = (file: FileItem) => {
    if (file.ext) {
      return file.ext.replace(/^\./, "").toLowerCase();
    }
    return file.name.split(".").pop()?.toLowerCase() || "";
  };

  // Structured files: spreadsheets (csv, xlsx, xls)
  // Use both type property and extension for compatibility
  const structuredTypes = ["spreadsheet"];
  const structuredExts = ["csv", "xlsx", "xls"];

  // Unstructured files: pdf, txt, md
  const unstructuredExts = ["pdf", "txt", "md"];

  const structuredCount =
    (stats?.file_types as any)?.structured !== undefined
      ? (stats?.file_types as any)?.structured
      : files.filter((f) => {
          const ext = getExt(f);
          const fileType = f.type?.toLowerCase() || "";
          return (
            structuredTypes.includes(fileType) || structuredExts.includes(ext)
          );
        }).length;

  const unstructuredCount =
    (stats?.file_types as any)?.unstructured !== undefined
      ? (stats?.file_types as any)?.unstructured
      : files.filter((f) => {
          const ext = getExt(f);
          const fileType = f.type?.toLowerCase() || "";
          // For unstructured, we only want pdf, txt, md
          if (fileType === "pdf") return true;
          if (unstructuredExts.includes(ext)) return true;
          return false;
        }).length;

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
                {displayTotalFiles}
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
                {formatBytes(displayTotalSize)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-4">
            <div className="rounded-md bg-primary/10 p-2">
              <Table className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Structured (csv, xlsx)
              </p>
              <p className="text-xl font-semibold text-foreground">
                {structuredCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-4">
            <div className="rounded-md bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Unstructured (pdf, txt, md)
              </p>
              <p className="text-xl font-semibold text-foreground">
                {unstructuredCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
