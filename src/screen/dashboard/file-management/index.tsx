"use client";

import { useAuth, useUser } from "@clerk/clerk-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "./components/delete-confirmation-modal";
import { DriveImportModal } from "./components/drive-import-modal";
import { FileGrid } from "./components/file-grid";
import { FilePreviewModal } from "./components/file-preview-modal";
import { FileStats } from "./components/file-stats";
import { FileToolbar } from "./components/file-toolbar";
import { GoogleConnectionDialog } from "./components/google-connection-dialog";
import { KeyboardShortcuts } from "./components/keyboard-shortcuts";
import { UploadZone } from "./components/upload-zone";
import { useBatchDelete } from "./hooks";
import { useFileStore } from "./store";
import type { FileItem, ViewMode } from "./types";

export default function FileManagement() {
  const { getToken } = useAuth();
  const { user } = useUser();

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
    refreshData,
    clearError,
    clearSearch,
    startUpload,
    completeUpload,
    failUpload,
    clearUploads,
    getFileUrl,
  } = useFileStore();

  const {
    deleteBatch,
    isDeleting: isBatchDeleting,
    progress,
  } = useBatchDelete();

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [showDriveImport, setShowDriveImport] = useState(false);
  const [showGoogleConnectionDialog, setShowGoogleConnectionDialog] =
    useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isInSearchMode, setIsInSearchMode] = useState(false);
  const [isSingleDeleting, setIsSingleDeleting] = useState(false);

  // Combined delete loading state
  const isDeleting = isBatchDeleting || isSingleDeleting;

  // Check if user has Google OAuth connection
  // Check externalAccounts with provider === "google" (not oauthAccounts with oauth_google)
  const hasGoogleConnection = user?.externalAccounts?.some(
    (account) => account.provider === "google"
  );

  // Handle Drive Import button click
  const handleDriveImportClick = useCallback(() => {
    if (!hasGoogleConnection) {
      // Show Google connection dialog if user doesn't have Google connected
      setShowGoogleConnectionDialog(true);
    } else {
      // Open Drive import modal if user has Google connected
      setShowDriveImport(true);
    }
  }, [hasGoogleConnection]);

  // Check if user just connected Google (after closing UserProfile modal)
  useEffect(() => {
    // If user has Google connection and Google connection dialog was shown,
    // it means user just connected Google, so open Drive import modal
    if (hasGoogleConnection && showGoogleConnectionDialog) {
      setShowGoogleConnectionDialog(false);
      setShowDriveImport(true);
    }
  }, [hasGoogleConnection, showGoogleConnectionDialog]);

  // Handle when Google is connected from UserProfile modal
  const handleGoogleConnected = useCallback(() => {
    setShowGoogleConnectionDialog(false);
    setShowDriveImport(true);
  }, []);

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

  // Load files and stats on component mount with progressive loading
  useEffect(() => {
    const loadData = async () => {
      const token = await getToken();
      if (token) {
        // Load files first (most important), then stats)
        await fetchFiles(token);
        // Load stats in background (less critical)
        fetchStats(token).catch(() => {});
      }
    };
    loadData();
  }, [getToken, fetchFiles, fetchStats]);

  // Use search results if we're in search mode, otherwise use all files
  const displayFiles = isInSearchMode ? searchResults : files;

  const handleRefresh = useCallback(async () => {
    const token = await getToken();
    if (!token) return;

    if (isInSearchMode && searchQuery.trim()) {
      await searchFiles(searchQuery.trim(), token);
    } else {
      await refreshData(token);
    }

    setSelectedFiles([]);
  }, [getToken, isInSearchMode, searchQuery, searchFiles, refreshData]);

  const handleFileUpload = useCallback(
    async (filesToUpload: File[]) => {
      const token = await getToken();
      if (!token) {
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
        // Get the upload file item from the store after it's been created
        const currentUploadFiles = useFileStore.getState().uploadFiles;
        const uploadFileItem = currentUploadFiles.find(
          (uf) => uf.file === file
        );

        if (!uploadFileItem) {
          errorCount++;
          continue;
        }

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

          if (result) {
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

            // Add new file to store using API response data
            useFileStore.getState().addFile(result);
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

      // Refresh stats after all uploads complete
      const token2 = await getToken();
      if (token2) {
        fetchStats(token2).catch(() => {});
      }

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
      clearUploads,
      fetchStats,
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
      setIsSingleDeleting(true);
      try {
        const success = await deleteFile(filesToDelete[0], token);
        if (success) {
          setSelectedFiles([]);
          // Refresh stats after delete to update storage size
          fetchStats(token).catch(() => {});
        }
      } finally {
        setIsSingleDeleting(false);
      }
    } else {
      // Batch delete
      await deleteBatch(filesToDelete, {
        onSuccess: async () => {
          setSelectedFiles([]);
          // Refresh stats after delete to update storage size
          fetchStats(token).catch(() => {});
        },
        onError: () => {
          // Error handled by toast notification
        },
      });
    }

    setShowDeleteConfirm(false);
    setFilesToDelete([]);
  }, [filesToDelete, getToken, deleteFile, deleteBatch, fetchStats]);

  const handleRename = useCallback(
    async (fileId: string, newName: string) => {
      const token = await getToken();
      if (!token) return;

      await renameFile(fileId, newName, token);
      // No need to refresh - store already updated
      setRenamingFileId(null); // Clear renaming state after rename
    },
    [getToken, renameFile]
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

      await downloadFile(fileId, token);
    },
    [getToken, downloadFile]
  );

  const handlePreview = useCallback(
    async (file: FileItem) => {
      // 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        toast.info(
          "File is too large for preview (>10MB). Downloading instead."
        );
        handleDownload(file.id);
        return;
      }

      const validExtensions = [".pdf", ".md", ".txt", ".csv", ".xlsx", ".xls"];
      const ext = (file.ext || "").toLowerCase();
      if (!validExtensions.includes(ext)) {
        toast.info(
          "Preview not supported for this file type. Downloading instead."
        );
        handleDownload(file.id);
        return;
      }

      const token = await getToken();
      if (!token) return;

      const url = await getFileUrl(file.id, token);
      if (url) {
        setPreviewFile(file);
        setPreviewUrl(url);
      } else {
        toast.error("Failed to get file URL for preview");
      }
    },
    [getToken, getFileUrl, handleDownload]
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

      // Trigger search (or fetch list if query is empty)
      handleSearch(query);
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
        onDriveImportClick={handleDriveImportClick}
        onShowShortcuts={() => setShowShortcuts(true)}
        selectedCount={selectedFiles.length}
        onDeleteSelected={() => handleDeleteRequest(selectedFiles)}
        isLoading={isDeleting}
        onRefresh={handleRefresh}
        isRefreshing={isLoading || isSearching}
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
          onPreview={handlePreview}
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

      {showGoogleConnectionDialog && (
        <GoogleConnectionDialog
          open={showGoogleConnectionDialog}
          onOpenChange={setShowGoogleConnectionDialog}
          onGoogleConnected={handleGoogleConnected}
        />
      )}

      {showDriveImport && (
        <DriveImportModal
          open={showDriveImport}
          onOpenChange={setShowDriveImport}
          onImportSuccess={async () => {
            const token = await getToken();
            if (token) {
              await fetchFiles(token, true);
            }
          }}
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

      <FilePreviewModal
        open={!!previewFile}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewFile(null);
            setPreviewUrl(null);
          }
        }}
        file={previewFile}
        url={previewUrl}
        onDownload={handleDownload}
        onDelete={(fileId) => handleDeleteRequest([fileId])}
      />
    </div>
  );
}
