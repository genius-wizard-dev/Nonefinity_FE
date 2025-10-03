import { useCallback, useEffect, useState } from "react";
import type { FileItem, ViewMode } from "../types";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import { FileGrid } from "./file-grid";
import { FileStats } from "./file-stats";
import { FileToolbar } from "./file-toolbar";
import { KeyboardShortcuts } from "./keyboard-shortcuts";
import { UploadZone } from "./upload-zone";

export default function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([]);

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = useCallback((uploadedFiles: File[]) => {
    const newFiles: FileItem[] = uploadedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      type: file.type.split("/")[0],
      size: file.size,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modified: new Date(),
      thumbnail: "/uploaded-file.jpg",
    }));
    setFiles((prev) => [...newFiles, ...prev]);
    setShowUploadZone(false);
  }, []);

  const handleDeleteRequest = useCallback((fileIds: string[]) => {
    setFilesToDelete(fileIds);
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    setFiles((prev) => prev.filter((file) => !filesToDelete.includes(file.id)));
    setSelectedFiles([]);
    setShowDeleteConfirm(false);
    setFilesToDelete([]);
  }, [filesToDelete]);

  const handleRename = useCallback((fileId: string, newName: string) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId ? { ...file, name: newName } : file
      )
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "u") {
        e.preventDefault();
        setShowUploadZone(true);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        // If all files are selected, deselect all; otherwise select all
        if (selectedFiles.length === files.length) {
          setSelectedFiles([]);
        } else {
          setSelectedFiles(files.map((f) => f.id));
        }
      }

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedFiles.length > 0
      ) {
        e.preventDefault();
        handleDeleteRequest(selectedFiles);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShowShortcuts(true);
      }

      if (e.key === "Escape") {
        if (showUploadZone) {
          setShowUploadZone(false);
        } else if (showShortcuts) {
          setShowShortcuts(false);
        } else if (showDeleteConfirm) {
          // Delete modal handles its own ESC, but we track state here
          setShowDeleteConfirm(false);
          setFilesToDelete([]);
        } else if (selectedFiles.length > 0) {
          // Only deselect files if no modals are open
          setSelectedFiles([]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    files,
    selectedFiles,
    showUploadZone,
    showShortcuts,
    showDeleteConfirm,
    handleDeleteRequest,
  ]);

  return (
    <div className="flex h-screen flex-col bg-background">
      <FileStats files={files} selectedCount={selectedFiles.length} />

      <FileToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onUploadClick={() => setShowUploadZone(true)}
        onShowShortcuts={() => setShowShortcuts(true)}
        selectedCount={selectedFiles.length}
        onDeleteSelected={() => handleDeleteRequest(selectedFiles)}
      />

      <div className="flex-1 overflow-auto">
        <FileGrid
          files={filteredFiles}
          viewMode={viewMode}
          selectedFiles={selectedFiles}
          onSelectionChange={setSelectedFiles}
          onDelete={handleDeleteRequest}
          onRename={handleRename}
        />
      </div>

      {showUploadZone && (
        <UploadZone
          onUpload={handleFileUpload}
          onClose={() => setShowUploadZone(false)}
        />
      )}

      {showShortcuts && (
        <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmationModal
          fileCount={filesToDelete.length}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setFilesToDelete([]);
          }}
        />
      )}
    </div>
  );
}
