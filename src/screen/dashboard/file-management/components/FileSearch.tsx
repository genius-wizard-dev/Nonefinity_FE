import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ENDPOINTS } from "@/consts/endpoint";
import api from "@/lib/axios";
import dayjs from "dayjs";
import {
  Calendar,
  Files,
  FileType,
  Filter,
  HardDrive,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { FileItem } from "./FileList";

interface SearchFilters {
  query: string;
  fileType?: string;
  dateFrom?: string;
  dateTo?: string;
  sizeMin?: number;
  sizeMax?: number;
  owner?: string;
  tags?: string[];
}

interface FileSearchProps {
  onFileSelect?: (file: FileItem) => void;
  onFilesSelect?: (files: FileItem[]) => void;
  initialQuery?: string;
  showAdvancedFilters?: boolean;
}

export const FileSearch: React.FC<FileSearchProps> = ({
  onFileSelect,
  onFilesSelect: _onFilesSelect,
  initialQuery = "",
  showAdvancedFilters = true,
}) => {
  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
  });

  // Available file types for filtering
  const [availableFileTypes, setAvailableFileTypes] = useState<string[]>([]);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchFileTypes = async () => {
    try {
      const response = await api.get(ENDPOINTS.FILES.TYPES);
      setAvailableFileTypes(response.data.types || []);
    } catch (error) {
      console.error("Failed to fetch file types:", error);
    }
  };

  useEffect(() => {
    fetchFileTypes();
  }, []);

  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    if (
      !searchFilters.query.trim() &&
      !searchFilters.fileType &&
      !searchFilters.dateFrom
    ) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (searchFilters.query.trim()) {
        params.append("q", searchFilters.query.trim());
      }
      if (searchFilters.fileType) {
        params.append("file_type", searchFilters.fileType);
      }
      if (searchFilters.dateFrom) {
        params.append("dateFrom", searchFilters.dateFrom);
      }
      if (searchFilters.dateTo) {
        params.append("dateTo", searchFilters.dateTo);
      }
      if (searchFilters.sizeMin) {
        params.append("sizeMin", searchFilters.sizeMin.toString());
      }
      if (searchFilters.sizeMax) {
        params.append("sizeMax", searchFilters.sizeMax.toString());
      }
      if (searchFilters.owner) {
        params.append("owner", searchFilters.owner);
      }
      if (searchFilters.tags && searchFilters.tags.length > 0) {
        params.append("tags", searchFilters.tags.join(","));
      }

      // default limit 50; allow override if user sets sizeMax in KB? We'll honor API cap of 100.
      if (!params.has("limit")) params.append("limit", "50");

      const response = await api.get(
        `${ENDPOINTS.FILES.SEARCH}?${params.toString()}`
      );
      const payload = response.data;
      const raw = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.files)
        ? payload.files
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.results)
        ? payload.results
        : [];

      const mapped: FileItem[] = raw.map((it: any) => {
        const nameFromParts = it?.file_name
          ? `${it.file_name}${it.file_ext || ""}`
          : undefined;
        const derivedName =
          it?.name ||
          nameFromParts ||
          it?.filename ||
          it?.originalName ||
          (typeof it?.file_path === "string"
            ? it.file_path.split("/").pop()
            : undefined) ||
          "Untitled";

        const createdAt =
          it?.createdAt || it?.created_at || it?.created || it?.uploadedAt;
        const updatedAt =
          it?.updatedAt || it?.updated_at || it?.modifiedAt || createdAt;

        return {
          id: it?.id || it?._id || it?.file_id || String(Math.random()),
          name: String(derivedName),
          type: it?.type || it?.file_type || "",
          size: Number(it?.size ?? it?.file_size ?? 0),
          createdAt: createdAt || new Date().toISOString(),
          updatedAt: updatedAt || new Date().toISOString(),
          url: it?.url || it?.link,
          owner: it?.owner || it?.owner_id || it?.userId,
          tags: it?.tags || it?.labels,
        } as FileItem;
      });

      setSearchResults(mapped);

      // Add to search history
      if (searchFilters.query.trim()) {
        setSearchHistory((prev) => {
          const newHistory = [
            searchFilters.query,
            ...prev.filter((q) => q !== searchFilters.query),
          ];
          return newHistory.slice(0, 10); // Keep last 10 searches
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Search failed";
      setError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({ ...prev, query }));

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      performSearch({ ...filters, query });
    }, 500);

    setSearchTimeout(timeout);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    performSearch(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = { query: "" };
    setFilters(clearedFilters);
    setSearchResults([]);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "query") return false; // Don't count query as a filter
    return (
      value !== undefined &&
      value !== "" &&
      (Array.isArray(value) ? value.length > 0 : true)
    );
  }).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          File Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files by name, content, or type..."
              value={filters.query}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
            {filters.query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => handleSearchChange("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {showAdvancedFilters && (
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          )}
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && !filters.query && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Recent searches:</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearchChange(query)}
                  className="text-xs"
                >
                  {query}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {showFilters && showAdvancedFilters && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Advanced Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileType className="h-4 w-4" />
                    File Type
                  </label>
                  <select
                    value={filters.fileType || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "fileType",
                        e.target.value || undefined
                      )
                    }
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="">All types</option>
                    {availableFileTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Owner Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Owner</label>
                  <Input
                    placeholder="Filter by owner"
                    value={filters.owner || ""}
                    onChange={(e) =>
                      handleFilterChange("owner", e.target.value || undefined)
                    }
                  />
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Created From
                  </label>
                  <Input
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "dateFrom",
                        e.target.value || undefined
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Created To
                  </label>
                  <Input
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) =>
                      handleFilterChange("dateTo", e.target.value || undefined)
                    }
                  />
                </div>

                {/* Size Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Min Size (KB)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.sizeMin || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "sizeMin",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Max Size (KB)
                  </label>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    value={filters.sizeMax || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "sizeMax",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Searching files...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => performSearch(filters)} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Search
            </Button>
          </div>
        )}

        {/* Search Results */}
        {!isSearching && !error && searchResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                Search Results ({searchResults.length})
              </h3>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((file) => (
                    <TableRow
                      key={file.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onFileSelect?.(file)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Files className="h-4 w-4" />
                          <span>
                            {highlightSearchTerm(file.name, filters.query)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{file.type}</TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>
                        {dayjs(file.createdAt).format("MMM D, YYYY")}
                      </TableCell>
                      <TableCell>{file.owner || "Unknown"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* No Results */}
        {!isSearching &&
          !error &&
          searchResults.length === 0 &&
          (filters.query || activeFiltersCount > 0) && (
            <div className="text-center py-8">
              <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No files found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}

        {/* Empty State */}
        {!isSearching &&
          !error &&
          searchResults.length === 0 &&
          !filters.query &&
          activeFiltersCount === 0 && (
            <div className="text-center py-8">
              <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">
                Enter a search term to find files
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
};
