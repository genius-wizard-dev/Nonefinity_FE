import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Cloud,
  Grid3x3,
  Keyboard,
  List,
  RefreshCcw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { LogoSpinner } from "@/components/shared";
import type { ViewMode } from "../types";

interface FileToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUploadClick: () => void;
  onDriveImportClick: () => void;
  onShowShortcuts: () => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  isLoading?: boolean;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function FileToolbar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onUploadClick,
  onDriveImportClick,
  onShowShortcuts,
  selectedCount,
  onDeleteSelected,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
}: FileToolbarProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteSelected}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedCount})
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onShowShortcuts}
              className="gap-2 bg-transparent"
            >
              <Keyboard className="h-4 w-4" />
              <span className="hidden md:inline">Shortcuts</span>
            </Button>

            <div className="flex rounded-md border border-border">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("grid")}
                className="rounded-r-none"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="gap-2"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <LogoSpinner size="sm" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              <span className="hidden md:inline">Refresh</span>
            </Button>

            <Button
              onClick={onDriveImportClick}
              variant="outline"
              className="gap-2"
              disabled={isLoading}
            >
              <Cloud className="h-4 w-4" />
              <span className="hidden md:inline">Import from Drive</span>
            </Button>

            <Button
              onClick={onUploadClick}
              className="gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <LogoSpinner size="sm" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
