import { Loading } from "@/components/shared/loading";
import type { FileItem, ViewMode } from "../types";
import { FileCard } from "./file-card";
import { FileListItem } from "./file-list-item";

interface FileGridProps {
  files: FileItem[];
  viewMode: ViewMode;
  selectedFiles: string[];
  onSelectionChange: (selected: string[]) => void;
  onDelete: (fileIds: string[]) => void;
  onRename: (fileId: string, newName: string) => void;
  onStartRename: (fileId: string) => void;
  onCancelRename: () => void;
  onDownload?: (fileId: string) => void;
  renamingFileId: string | null;
  isLoading?: boolean;
}

export function FileGrid({
  files,
  viewMode,
  selectedFiles,
  onSelectionChange,
  onDelete,
  onRename,
  onStartRename,
  onCancelRename,
  onDownload,
  renamingFileId,
  isLoading,
}: FileGridProps) {
  const handleSelect = (fileId: string) => {
    // Always use toggle behavior - clicking adds/removes from selection
    if (selectedFiles.includes(fileId)) {
      onSelectionChange(selectedFiles.filter((id) => id !== fileId));
    } else {
      onSelectionChange([...selectedFiles, fileId]);
    }
  };

  if (isLoading) {
    return <Loading text="Loading files..." />;
  }

  if (files.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">No files found</p>
          <p className="text-sm text-muted-foreground">
            Upload files to get started
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Size
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Modified
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {files.map((file) => (
                    <FileListItem
                      key={file.id}
                      file={file}
                      isSelected={selectedFiles.includes(file.id)}
                      isRenaming={renamingFileId === file.id}
                      onSelect={() => handleSelect(file.id)}
                      onDelete={() => onDelete([file.id])}
                      onRename={(newName) => onRename(file.id, newName)}
                      onStartRename={() => onStartRename(file.id)}
                      onCancelRename={onCancelRename}
                      onDownload={
                        onDownload ? () => onDownload(file.id) : undefined
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                isSelected={selectedFiles.includes(file.id)}
                isRenaming={renamingFileId === file.id}
                onSelect={() => handleSelect(file.id)}
                onDelete={() => onDelete([file.id])}
                onRename={(newName) => onRename(file.id, newName)}
                onStartRename={() => onStartRename(file.id)}
                onCancelRename={onCancelRename}
                onDownload={onDownload ? () => onDownload(file.id) : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
