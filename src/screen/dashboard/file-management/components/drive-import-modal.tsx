"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@clerk/clerk-react";
import {
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useDriveImportStore } from "../drive-store";
import { FileService } from "../services";
import { useFileStore } from "../store";

interface DriveImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

export function DriveImportModal({
  open,
  onOpenChange,
  onImportSuccess,
}: DriveImportModalProps) {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"sheets" | "pdfs">("sheets");
  const [importMode, setImportMode] = useState<"url" | "file">("url");
  const [sheetUrl, setSheetUrl] = useState("");
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [selectedPDFs, setSelectedPDFs] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Use Zustand store
  const {
    filteredSheets,
    filteredPDFs,
    isLoadingSheets,
    isLoadingPDFs,
    isLoadingMoreSheets,
    isLoadingMorePDFs,
    hasMoreSheets,
    hasMorePDFs,
    searchQuery,
    fetchSheets,
    fetchPDFs,
    loadMoreSheets,
    loadMorePDFs,
    searchSheets,
    searchPDFs,
    setSearchQuery,
    clearSearch,
  } = useDriveImportStore();

  // Refs for scroll containers
  const sheetsScrollRef = useRef<HTMLDivElement>(null);
  const pdfsScrollRef = useRef<HTMLDivElement>(null);

  // Load files when modal opens or tab changes
  useEffect(() => {
    if (open) {
      const loadData = async () => {
        const token = await getToken();
        if (!token) return;

        if (activeTab === "sheets") {
          await fetchSheets(token);
        } else {
          await fetchPDFs(token);
        }
      };
      loadData();
    }
  }, [open, activeTab, fetchSheets, fetchPDFs, getToken]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSheetUrl("");
      setSelectedSheets([]);
      setSelectedPDFs([]);
      setImportMode("url");
      clearSearch();
    }
  }, [open, clearSearch]);

  // Handle search with debounce
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // If empty, reload from cache
      if (!value.trim()) {
        const reloadData = async () => {
          const token = await getToken();
          if (!token) return;
          if (activeTab === "sheets") {
            await fetchSheets(token);
          } else {
            await fetchPDFs(token);
          }
        };
        reloadData();
        return;
      }

      // Debounce API search
      const timeout = setTimeout(async () => {
        const token = await getToken();
        if (!token) return;

        if (activeTab === "sheets") {
          await searchSheets(value, token);
        } else {
          await searchPDFs(value, token);
        }
      }, 500);

      setSearchTimeout(timeout);
    },
    [
      activeTab,
      getToken,
      searchSheets,
      searchPDFs,
      fetchSheets,
      fetchPDFs,
      searchTimeout,
      setSearchQuery,
    ]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Handle sheet selection
  const handleSheetToggle = (sheetId: string) => {
    setSelectedSheets((prev) =>
      prev.includes(sheetId)
        ? prev.filter((id) => id !== sheetId)
        : [...prev, sheetId]
    );
  };

  // Handle PDF selection
  const handlePDFToggle = (pdfId: string) => {
    setSelectedPDFs((prev) =>
      prev.includes(pdfId)
        ? prev.filter((id) => id !== pdfId)
        : [...prev, pdfId]
    );
  };

  // Handle import from URL
  const handleImportFromUrl = useCallback(async () => {
    if (!sheetUrl.trim()) {
      toast.error("Please enter a Google Sheet URL");
      return;
    }

    const token = await getToken();
    if (!token) return;

    setIsImporting(true);
    try {
      const file = await FileService.importFromSheetUrl(sheetUrl.trim(), token);
      if (file) {
        // Add imported file to store immediately
        useFileStore.getState().addFile(file);

        toast.success("Sheet imported successfully");
        setSheetUrl("");
        onImportSuccess?.();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Failed to import sheet from URL:", error);
      toast.error(error?.message || "Failed to import sheet from URL");
    } finally {
      setIsImporting(false);
    }
  }, [sheetUrl, getToken, onImportSuccess, onOpenChange]);

  // Handle import from Drive
  const handleImportFromDrive = useCallback(async () => {
    const token = await getToken();
    if (!token) return;

    const fileIds: string[] = [];
    const fileTypes: string[] = [];

    if (activeTab === "sheets") {
      if (selectedSheets.length === 0) {
        toast.error("Please select at least one sheet");
        return;
      }
      fileIds.push(...selectedSheets);
      fileTypes.push(...selectedSheets.map(() => "sheet"));
    } else {
      if (selectedPDFs.length === 0) {
        toast.error("Please select at least one PDF");
        return;
      }
      fileIds.push(...selectedPDFs);
      fileTypes.push(...selectedPDFs.map(() => "pdf"));
    }

    setIsImporting(true);
    try {
      const files = await FileService.importFromDrive(
        fileIds,
        fileTypes,
        token
      );
      if (files && files.length > 0) {
        // Add imported files to store immediately
        files.forEach((file) => {
          useFileStore.getState().addFile(file);
        });

        toast.success(`Imported ${files.length} file(s) successfully`);
        setSelectedSheets([]);
        setSelectedPDFs([]);
        onImportSuccess?.();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Failed to import files from Drive:", error);
      toast.error(error?.message || "Failed to import files from Drive");
    } finally {
      setIsImporting(false);
    }
  }, [
    activeTab,
    selectedSheets,
    selectedPDFs,
    getToken,
    onImportSuccess,
    onOpenChange,
  ]);

  // Get selected count
  const selectedCount = useMemo(() => {
    return activeTab === "sheets" ? selectedSheets.length : selectedPDFs.length;
  }, [activeTab, selectedSheets, selectedPDFs]);

  // Loading state
  const isLoading = activeTab === "sheets" ? isLoadingSheets : isLoadingPDFs;
  const isLoadingMore =
    activeTab === "sheets" ? isLoadingMoreSheets : isLoadingMorePDFs;
  const hasMore = activeTab === "sheets" ? hasMoreSheets : hasMorePDFs;

  // Handle infinite scroll
  const handleScroll = useCallback(
    async (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrollBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight;

      // Load more when within 100px of bottom
      if (scrollBottom < 100 && hasMore && !isLoadingMore && !isLoading) {
        const token = await getToken();
        if (!token) return;

        if (activeTab === "sheets") {
          await loadMoreSheets(token);
        } else {
          await loadMorePDFs(token);
        }
      }
    },
    [
      activeTab,
      hasMore,
      isLoadingMore,
      isLoading,
      getToken,
      loadMoreSheets,
      loadMorePDFs,
    ]
  );

  // Handle open file
  const handleOpenFile = useCallback(
    (fileId: string, fileType: "sheet" | "pdf") => {
      if (fileType === "sheet") {
        window.open(
          `https://docs.google.com/spreadsheets/d/${fileId}`,
          "_blank"
        );
      } else {
        window.open(`https://drive.google.com/file/d/${fileId}/view`, "_blank");
      }
    },
    []
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import from Google Drive</DialogTitle>
          <DialogDescription>
            Select files from Google Drive or enter a Sheet URL to import
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "sheets" | "pdfs")}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sheets">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Sheets
            </TabsTrigger>
            <TabsTrigger value="pdfs">
              <FileText className="h-4 w-4 mr-2" />
              PDFs
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="sheets"
            className="flex-1 flex flex-col min-h-0 mt-4"
          >
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              {/* Mode Selection */}
              <div className="flex gap-2 border-b pb-2">
                <Button
                  variant={importMode === "url" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setImportMode("url")}
                  disabled={isImporting}
                >
                  Import from URL
                </Button>
                <Button
                  variant={importMode === "file" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setImportMode("file")}
                  disabled={isImporting}
                >
                  Select from Drive
                </Button>
              </div>

              {/* URL Input - Only show when importMode is "url" */}
              {importMode === "url" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Import from Sheet URL
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      disabled={isImporting}
                    />
                  </div>
                </div>
              )}

              {/* File List - Only show when importMode is "file" */}
              {importMode === "file" && (
                <>
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search sheets..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {searchQuery && (
                      <button
                        onClick={async () => {
                          setSearchQuery("");
                          const token = await getToken();
                          if (token) {
                            await fetchSheets(token);
                          }
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        const token = await getToken();
                        if (token) {
                          await fetchSheets(token, true);
                        }
                      }}
                      variant="outline"
                      disabled={isLoadingSheets || isImporting}
                      className="flex-1"
                      size="sm"
                    >
                      {isLoadingSheets ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </>
                      )}
                    </Button>
                    {filteredSheets.length > 0 && (
                      <div className="text-sm text-muted-foreground flex items-center px-3">
                        {filteredSheets.length} sheet
                        {filteredSheets.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>

                  {/* Sheets List */}
                  <div
                    ref={sheetsScrollRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-auto border rounded-md p-4 min-h-0"
                  >
                    {isLoadingSheets ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-3">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 flex-1" />
                          </div>
                        ))}
                      </div>
                    ) : filteredSheets.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchQuery
                          ? `No sheets found matching "${searchQuery}"`
                          : "No sheets found. Click 'Refresh Sheets' to load your sheets."}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredSheets.map((sheet) => (
                          <div
                            key={sheet.id}
                            className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted transition-colors group"
                          >
                            <Checkbox
                              id={sheet.id}
                              checked={selectedSheets.includes(sheet.id)}
                              onCheckedChange={() =>
                                handleSheetToggle(sheet.id)
                              }
                              disabled={isImporting}
                            />
                            <label
                              htmlFor={sheet.id}
                              className="flex-1 text-sm cursor-pointer truncate"
                              title={sheet.name}
                            >
                              {sheet.name}
                            </label>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenFile(sheet.id, "sheet");
                              }}
                              disabled={isImporting}
                              title="Open in Google Sheets"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {hasMoreSheets && (
                          <div className="flex items-center justify-center py-4">
                            {isLoadingMoreSheets ? (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading more...
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                Scroll down to load more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="pdfs"
            className="flex-1 flex flex-col min-h-0 mt-4"
          >
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search PDFs..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={async () => {
                      setSearchQuery("");
                      const token = await getToken();
                      if (token) {
                        await fetchPDFs(token);
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    const token = await getToken();
                    if (token) {
                      await fetchPDFs(token, true);
                    }
                  }}
                  variant="outline"
                  disabled={isLoadingPDFs || isImporting}
                  className="flex-1"
                  size="sm"
                >
                  {isLoadingPDFs ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
                {filteredPDFs.length > 0 && (
                  <div className="text-sm text-muted-foreground flex items-center px-3">
                    {filteredPDFs.length} PDF
                    {filteredPDFs.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* PDFs List */}
              <div
                ref={pdfsScrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-auto border rounded-md p-4 min-h-0"
              >
                {isLoadingPDFs ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                ) : filteredPDFs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery
                      ? `No PDFs found matching "${searchQuery}"`
                      : "No PDFs found. Click 'Refresh PDFs' to load your PDFs."}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPDFs.map((pdf) => (
                      <div
                        key={pdf.id}
                        className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted transition-colors group"
                      >
                        <Checkbox
                          id={pdf.id}
                          checked={selectedPDFs.includes(pdf.id)}
                          onCheckedChange={() => handlePDFToggle(pdf.id)}
                          disabled={isImporting}
                        />
                        <label
                          htmlFor={pdf.id}
                          className="flex-1 text-sm cursor-pointer truncate"
                          title={pdf.name}
                        >
                          {pdf.name}
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenFile(pdf.id, "pdf");
                          }}
                          disabled={isImporting}
                          title="Open in Google Drive"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {hasMorePDFs && (
                      <div className="flex items-center justify-center py-4">
                        {isLoadingMorePDFs ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading more...
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            Scroll down to load more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={
              importMode === "url" && activeTab === "sheets"
                ? handleImportFromUrl
                : handleImportFromDrive
            }
            disabled={
              isImporting ||
              (importMode === "url" &&
                activeTab === "sheets" &&
                !sheetUrl.trim()) ||
              (importMode === "file" &&
                activeTab === "sheets" &&
                selectedSheets.length === 0) ||
              (activeTab === "pdfs" && selectedPDFs.length === 0)
            }
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : importMode === "url" && activeTab === "sheets" ? (
              "Import from URL"
            ) : (
              `Import ${selectedCount} file${selectedCount !== 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
