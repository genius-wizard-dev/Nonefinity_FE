import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Grid3x3,
  Keyboard,
  List,
  Loader2,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import type { ViewMode } from "../types";

interface FileToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUploadClick: () => void;
  onShowShortcuts: () => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  isLoading?: boolean;
}

export function FileToolbar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onUploadClick,
  onShowShortcuts,
  selectedCount,
  onDeleteSelected,
  isLoading = false,
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
              className="pl-10"
            />
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
              onClick={onUploadClick}
              className="gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
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
