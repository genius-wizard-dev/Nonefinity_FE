import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Grid3x3, List, Search, RefreshCw } from "lucide-react";
import { LogoSpinner } from "@/components/shared";
import type { ViewMode } from "../types";

interface PDFToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function PDFToolbar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onRefresh,
  isLoading = false,
}: PDFToolbarProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search PDFs..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <LogoSpinner size="sm" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="hidden md:inline">Refresh</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}

