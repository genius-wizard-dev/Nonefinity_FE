import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  Edit3,
  Filter,
  Loader2,
  Search,
  Trash2,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { FileItem } from "../types";
import { FileIcon } from "./FileIcon";

interface FileListWithSearchProps {
  files: FileItem[];
  isLoading: boolean;
  onFileSelect?: (file: FileItem) => void;
  onFileDelete?: (fileId: string) => void;
  onFileRename?: (fileId: string, newName: string) => void;
  onFileDownload?: (file: FileItem) => void;
  selectable?: boolean;
  multiSelect?: boolean;
  selectedFiles?: Set<string>;
  onSelectionChange?: (selectedFiles: Set<string>) => void;
  placeholder?: string;
}

export const FileListWithSearch: React.FC<FileListWithSearchProps> = ({
  files,
  isLoading,
  onFileSelect,
  onFileDelete,
  onFileRename,
  onFileDownload,
  selectable = false,
  multiSelect = false,
  selectedFiles: externalSelectedFiles,
  onSelectionChange,
  placeholder = "Search files...",
}) => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fileType: "",
    minSize: "",
    maxSize: "",
    dateFrom: "",
    dateTo: "",
  });
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [displayFiles, setDisplayFiles] = useState<FileItem[]>(files);

  const [internalSelectedFiles, setInternalSelectedFiles] = useState<
    Set<string>
  >(new Set());
  const selectedFiles = externalSelectedFiles || internalSelectedFiles;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Search function
  const searchFiles = useCallback(
    (searchQuery: string, searchFilters = filters) => {
      if (
        !searchQuery.trim() &&
        !Object.values(searchFilters).some((v) => v.trim())
      ) {
        setDisplayFiles(files);
        return;
      }

      const results = files.filter((file) => {
        // Text search
        const matchesQuery =
          !searchQuery.trim() ||
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (file.ext &&
            file.ext.toLowerCase().includes(searchQuery.toLowerCase()));

        // File type filter
        const matchesType =
          !searchFilters.fileType ||
          file.type
            .toLowerCase()
            .includes(searchFilters.fileType.toLowerCase()) ||
          (file.ext &&
            file.ext
              .toLowerCase()
              .includes(searchFilters.fileType.toLowerCase()));

        // Size filters
        const fileSizeMB = file.size / (1024 * 1024);
        const matchesMinSize =
          !searchFilters.minSize ||
          fileSizeMB >= parseFloat(searchFilters.minSize);
        const matchesMaxSize =
          !searchFilters.maxSize ||
          fileSizeMB <= parseFloat(searchFilters.maxSize);

        // Date filters
        const fileDate = new Date(file.createdAt);
        const matchesDateFrom =
          !searchFilters.dateFrom ||
          fileDate >= new Date(searchFilters.dateFrom);
        const matchesDateTo =
          !searchFilters.dateTo || fileDate <= new Date(searchFilters.dateTo);

        return (
          matchesQuery &&
          matchesType &&
          matchesMinSize &&
          matchesMaxSize &&
          matchesDateFrom &&
          matchesDateTo
        );
      });

      setDisplayFiles(results);
    },
    [files, filters]
  );

  // Update display files when files change
  useEffect(() => {
    setDisplayFiles(files);
  }, [files]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchFiles(query, filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters, searchFiles]);

  const handleFileClick = (file: FileItem) => {
    if (selectable) {
      if (multiSelect) {
        const newSelected = new Set(selectedFiles);
        if (newSelected.has(file.id)) {
          newSelected.delete(file.id);
        } else {
          newSelected.add(file.id);
        }
        if (onSelectionChange) {
          onSelectionChange(newSelected);
        } else {
          setInternalSelectedFiles(newSelected);
        }
      } else {
        const newSelected = new Set([file.id]);
        if (onSelectionChange) {
          onSelectionChange(newSelected);
        } else {
          setInternalSelectedFiles(newSelected);
        }
      }
    }
    onFileSelect?.(file);
  };

  const handleRename = (file: FileItem) => {
    setEditingFile(file.id);
    setEditName(file.name);
  };

  const handleRenameSubmit = (fileId: string) => {
    if (
      editName.trim() &&
      editName !== files.find((f) => f.id === fileId)?.name
    ) {
      onFileRename?.(fileId, editName.trim());
    }
    setEditingFile(null);
    setEditName("");
  };

  const handleRenameCancel = () => {
    setEditingFile(null);
    setEditName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent, fileId: string) => {
    if (e.key === "Enter") {
      handleRenameSubmit(fileId);
    } else if (e.key === "Escape") {
      handleRenameCancel();
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    setFilters({
      fileType: "",
      minSize: "",
      maxSize: "",
      dateFrom: "",
      dateTo: "",
    });
    setDisplayFiles(files);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Loading component
  const LoadingIcon = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        <p className="text-sm text-gray-500">Loading files...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-black p-6">
      {/* Search and Filter Header */}
      <div className="flex items-center space-x-4 mb-6">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={handleClearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={`border-black ${showFilters ? "bg-gray-100" : ""}`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-6 pt-4 border-t border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* File Type Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                File Type
              </label>
              <Input
                type="text"
                placeholder="e.g., pdf, csv, txt"
                value={filters.fileType}
                onChange={(e) => handleFilterChange("fileType", e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Min Size Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Min Size (MB)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minSize}
                onChange={(e) => handleFilterChange("minSize", e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Max Size Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Max Size (MB)
              </label>
              <Input
                type="number"
                placeholder="100"
                value={filters.maxSize}
                onChange={(e) => handleFilterChange("maxSize", e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Date From Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                From Date
              </label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Date To Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                To Date
              </label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSearch}
              className="border-black"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {/* File Grid */}
      {isLoading ? (
        <LoadingIcon />
      ) : displayFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium">No files found</p>
          <p className="text-sm">Upload some files to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {displayFiles.map((file) => (
            <div
              key={file.id}
              className={`
                group relative flex flex-col items-center p-3 rounded-lg border border-black
                hover:bg-gray-100 cursor-pointer transition-all duration-200
                ${selectedFiles.has(file.id) ? "bg-gray-100" : "bg-white"}
              `}
              onClick={() => handleFileClick(file)}
            >
              {/* File Icon */}
              <div className="mb-2">
                <FileIcon file={file} size="lg" />
              </div>

              {/* File Name */}
              <div className="w-full text-center">
                {editingFile === file.id ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleRenameSubmit(file.id)}
                      onKeyDown={(e) => handleKeyPress(e, file.id)}
                      className="w-full text-xs text-center bg-white border-2 border-black rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 shadow-sm"
                      autoFocus
                    />
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                  </div>
                ) : (
                  <p
                    className="text-xs font-medium text-black truncate"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                )}
              </div>

              {/* File Size */}
              <p className="text-xs text-gray-600 mt-1">
                {formatFileSize(file.size)}
              </p>

              {/* File Date */}
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(file.createdAt)}
              </p>

              {/* Action Menu */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileDownload?.(file);
                    }}
                    title="Download"
                  >
                    <Download className="h-3 w-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename(file);
                    }}
                    title="Rename"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-gray-300 text-black"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(
                        "🗑️ List: Delete clicked for file:",
                        file.id,
                        file.name
                      );
                      onFileDelete?.(file.id);
                    }}
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedFiles.has(file.id) && (
                <div className="absolute top-1 left-1 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
