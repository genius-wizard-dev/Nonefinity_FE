"use client";

import { useAuth } from "@clerk/clerk-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "./components/delete-confirmation-modal";
import { FileGrid } from "./components/file-grid";
import { FileStats } from "./components/file-stats";
import { FileToolbar } from "./components/file-toolbar";
import { KeyboardShortcuts } from "./components/keyboard-shortcuts";
import { UploadZone } from "./components/upload-zone";
import { useBatchDelete } from "./hooks";
import { useFileStore } from "./store";
import type { ViewMode } from "./types";

export default function FileManagement() {
  const { getToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    files,
    isLoading,
    error,
    stats,
    searchResults,
    isSearching,
    fetchFiles,
    searchFiles,
    uploadFile,
    deleteFile,
    renameFile,
    downloadFile,
    fetchStats,
    clearError,
    clearSearch,
    startUpload,
    completeUpload,
    failUpload,
    clearUploads,
  } = useFileStore();

  const { deleteBatch, isDeleting, progress } = useBatchDelete();

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [isInSearchMode, setIsInSearchMode] = useState(false);
  

  // Handle search
  const handleSearch = useCallback(
    async (query: string) => {
      const token = await getToken();
      if (!token) return;

      if (query.trim()) {
        setIsInSearchMode(true);
        await searchFiles(query, token);
      } else {
        setIsInSearchMode(false);
        clearSearch();
        // Refresh the file list to show all files
        await fetchFiles(token, true);
        console.log("🔍 Search cleared - refreshed file list");
      }
    },
    [getToken, searchFiles, clearSearch, fetchFiles]
  );

  // Initialize search query from URL parameters and trigger search
  useEffect(() => {
    const urlSearchQuery = searchParams.get("search") || "";
    setSearchQuery(urlSearchQuery);
    if (urlSearchQuery.trim()) {
      setIsInSearchMode(true);
      // Trigger search when URL parameter changes
      handleSearch(urlSearchQuery);
    } else {
      setIsInSearchMode(false);
      clearSearch();
    }
  }, [searchParams, handleSearch, clearSearch]);

  // Load files and stats on component mount
  useEffect(() => {
    const loadData = async () => {
      const token = await getToken();
      if (token) {
        await Promise.all([fetchFiles(token), fetchStats(token)]);
      }
    };
    loadData();
  }, [getToken, fetchFiles, fetchStats]);

  // Use search results if we're in search mode, otherwise use all files
  const displayFiles = isInSearchMode ? searchResults : files;

  // Debug logging (only in development and when there are actual changes)
  if (
    process.env.NODE_ENV === "development" &&
    (isSearching || isInSearchMode)
  ) {
    console.log("🔍 Search Debug:", {
      isSearching,
      isInSearchMode,
      searchResultsCount: searchResults.length,
      filesCount: files.length,
      displayFilesCount: displayFiles.length,
    });
  }

  const handleFileUpload = useCallback(
    async (filesToUpload: File[]) => {
      console.log(
        "🚀 Starting file upload process:",
        filesToUpload.length,
        "files"
      );

      const token = await getToken();
      if (!token) {
        console.error("❌ No token available for upload");
        toast.error("Authentication required for upload");
        return;
      }

      // Close upload zone immediately
      setShowUploadZone(false);

      // Sort files by size (smallest first) for priority upload
      const sortedFiles = [...filesToUpload].sort((a, b) => a.size - b.size);

      // Start upload progress tracking
      startUpload(sortedFiles);

      let completedCount = 0;
      let errorCount = 0;

      // Upload files with progress tracking (smallest files first)
      for (const file of sortedFiles) {
        console.log("📁 Processing file:", file.name);

        // Get the upload file item from the store after it's been created
        const currentUploadFiles = useFileStore.getState().uploadFiles;
        const uploadFileItem = currentUploadFiles.find(
          (uf) => uf.file === file
        );

        if (!uploadFileItem) {
          console.error("❌ Upload file item not found for:", file.name);
          errorCount++;
          continue;
        }

        console.log("✅ Found upload file item:", uploadFileItem.id);

        // Create individual toast for this file with progress bar
        const fileToastId = toast.loading(
          <div className="w-full">
            <div className="mb-2 text-sm font-medium">
              Uploading {file.name}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: "0%" }}
                />
              </div>
              <span className="text-xs text-gray-600 font-medium">0%</span>
            </div>
          </div>,
          {
            duration: Infinity,
          }
        );

        try {
          console.log("🔄 Starting upload for:", file.name);
          const result = await uploadFile(file, token, (progress) => {
            // Update progress in the store
            const { updateUploadProgress } = useFileStore.getState();
            updateUploadProgress(uploadFileItem.id, progress);

            // Update individual file toast with progress bar
            toast.loading(
              <div className="w-full">
                <div className="mb-2 text-sm font-medium">
                  Uploading {file.name}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {progress}%
                  </span>
                </div>
              </div>,
              {
                id: fileToastId,
                duration: Infinity,
              }
            );
          });
          console.log("📤 Upload result:", result);

          if (result) {
            console.log("✅ Upload completed successfully for:", file.name);
            completeUpload(uploadFileItem.id);
            completedCount++;

            // Show success toast for this specific file
            toast.success(
              <div className="w-full">
                <div className="mb-2 text-sm font-medium">
                  {file.name} uploaded successfully
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    100%
                  </span>
                </div>
              </div>,
              {
                id: fileToastId,
                duration: 3000,
              }
            );

            // Refresh file list to show the new file
            await fetchFiles(token, true);
          } else {
            failUpload(uploadFileItem.id, "Upload failed");
            errorCount++;

            // Show error toast for this specific file
            toast.error(
              <div className="w-full">
                <div className="mb-2 text-sm font-medium">
                  Failed to upload {file.name}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    100%
                  </span>
                </div>
              </div>,
              {
                id: fileToastId,
                duration: 4000,
              }
            );
          }
        } catch (error) {
          console.error("Upload error for:", file.name, error);
          failUpload(
            uploadFileItem.id,
            error instanceof Error ? error.message : "Upload failed"
          );
          errorCount++;

          // Show error toast for this specific file
          toast.error(
            <div className="w-full">
              <div className="mb-2 text-sm font-medium">
                Failed to upload {file.name}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: "100%" }}
                  />
                </div>
                <span className="text-xs text-gray-600 font-medium">100%</span>
              </div>
            </div>,
            {
              id: fileToastId,
              duration: 4000,
            }
          );
        }
      }

      // Show summary toast after all uploads are complete
      setTimeout(() => {
        if (errorCount === 0) {
          toast.success(
            <div className="w-full">
              <div className="mb-2 text-sm font-medium">
                All {completedCount} file{completedCount > 1 ? "s" : ""}{" "}
                uploaded successfully!
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: "100%" }}
                  />
                </div>
                <span className="text-xs text-gray-600 font-medium">100%</span>
              </div>
            </div>,
            {
              duration: 4000,
            }
          );
        } else if (completedCount === 0) {
          toast.error(
            <div className="w-full">
              <div className="mb-2 text-sm font-medium">
                Failed to upload all {filesToUpload.length} file
                {filesToUpload.length > 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: "100%" }}
                  />
                </div>
                <span className="text-xs text-gray-600 font-medium">100%</span>
              </div>
            </div>,
            {
              duration: 4000,
            }
          );
        } else {
          toast.warning(
            <div className="w-full">
              <div className="mb-2 text-sm font-medium">
                Uploaded {completedCount} file{completedCount > 1 ? "s" : ""},{" "}
                {errorCount} failed
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: "100%" }}
                  />
                </div>
                <span className="text-xs text-gray-600 font-medium">100%</span>
              </div>
            </div>,
            {
              duration: 4000,
            }
          );
        }
      }, 500);

      // Clear uploads from store after a delay
      setTimeout(() => {
        clearUploads();
      }, 2000);
    },
    [
      getToken,
      uploadFile,
      startUpload,
      completeUpload,
      failUpload,
      fetchFiles,
      clearUploads,
    ]
  );

  const handleDeleteRequest = useCallback((fileIds: string[]) => {
    setFilesToDelete(fileIds);
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    const token = await getToken();
    if (!token) return;

    if (filesToDelete.length === 1) {
      // Single file delete
      const success = await deleteFile(filesToDelete[0], token);
      if (success) {
        setSelectedFiles([]);
        // Refresh file list after successful deletion
        await fetchFiles(token, true);
      }
    } else {
      // Batch delete
      await deleteBatch(filesToDelete, {
        onSuccess: () => {
          setSelectedFiles([]);
          // Refresh file list after successful batch deletion
          fetchFiles(token, true);
        },
        onError: (error, failedIds) => {
          console.error("Batch delete error:", error, failedIds);
        },
      });
    }

    setShowDeleteConfirm(false);
    setFilesToDelete([]);
  }, [filesToDelete, getToken, deleteFile, deleteBatch, fetchFiles]);

  const handleRename = useCallback(
    async (fileId: string, newName: string) => {
      const token = await getToken();
      if (!token) return;

      const success = await renameFile(fileId, newName, token);
      if (success) {
        // Refresh file list after successful rename
        await fetchFiles(token, true);
      } else {
        console.error("Rename failed");
      }
      setRenamingFileId(null); // Clear renaming state after rename
    },
    [getToken, renameFile, fetchFiles]
  );

  const handleStartRename = useCallback((fileId: string) => {
    setRenamingFileId(fileId);
  }, []);

  const handleCancelRename = useCallback(() => {
    setRenamingFileId(null);
  }, []);

  const handleDownload = useCallback(
    async (fileId: string) => {
      const token = await getToken();
      if (!token) return;

      const success = await downloadFile(fileId, token);
      if (!success) {
        console.error("Download failed");
      }
    },
    [getToken, downloadFile]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "u") {
        e.preventDefault();
        // Close all dialogs first
        setShowShortcuts(false);
        setShowDeleteConfirm(false);
        setFilesToDelete([]);
        // Then show upload zone
        setShowUploadZone(true);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        if (selectedFiles.length === displayFiles.length) {
          setSelectedFiles([]);
        } else {
          setSelectedFiles(displayFiles.map((f) => f.id));
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
        // Close all dialogs first
        setShowUploadZone(false);
        setShowDeleteConfirm(false);
        setFilesToDelete([]);
        // Close any open Info dialogs by dispatching a custom event
        window.dispatchEvent(new CustomEvent("closeAllInfoDialogs"));
        // Then show shortcuts
        setShowShortcuts(true);
      }

      if (e.key === "Escape") {
        if (showUploadZone) {
          setShowUploadZone(false);
        } else if (showShortcuts) {
          setShowShortcuts(false);
        } else if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
          setFilesToDelete([]);
        } else if (selectedFiles.length > 0) {
          setSelectedFiles([]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    displayFiles,
    selectedFiles,
    showUploadZone,
    showShortcuts,
    showDeleteConfirm,
    handleDeleteRequest,
  ]);

  // Handle search input changes
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      // Update URL parameters immediately for better UX
      if (query.trim()) {
        setSearchParams({ search: query.trim() });
      } else {
        setSearchParams({});
      }

      // Trigger search with debounce
      if (query.trim()) {
        handleSearch(query);
      }
    },
    [handleSearch, setSearchParams]
  );

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500">Error: {error}</p>
          <button
            onClick={clearError}
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <FileStats
        files={displayFiles}
        selectedCount={selectedFiles.length}
        stats={stats}
        isLoading={isLoading}
        isSearchMode={isInSearchMode}
      />

      <FileToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onUploadClick={() => setShowUploadZone(true)}
        onShowShortcuts={() => setShowShortcuts(true)}
        selectedCount={selectedFiles.length}
        onDeleteSelected={() => handleDeleteRequest(selectedFiles)}
        isLoading={isDeleting}
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        <FileGrid
          files={displayFiles}
          viewMode={viewMode}
          selectedFiles={selectedFiles}
          onSelectionChange={(newSelection) => {
            // Cancel rename if selecting a different file
            if (renamingFileId && !newSelection.includes(renamingFileId)) {
              setRenamingFileId(null);
            }
            setSelectedFiles(newSelection);
          }}
          onDelete={handleDeleteRequest}
          onRename={handleRename}
          onStartRename={handleStartRename}
          onCancelRename={handleCancelRename}
          onDownload={handleDownload}
          renamingFileId={renamingFileId}
          isLoading={isLoading || isSearching}
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
          isDeleting={isDeleting}
          progress={progress}
        />
      )}
    </div>
  );
}
