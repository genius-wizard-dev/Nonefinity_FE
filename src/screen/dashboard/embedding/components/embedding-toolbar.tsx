import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Type,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { useEmbeddingActions, useTasksData } from "../store";
import type { EmbeddingTaskFilters } from "../types";
import { ClearTasksModal } from "./clear-tasks-modal";

interface EmbeddingToolbarProps {
  onFiltersChange: (filters: EmbeddingTaskFilters) => void;
}

export const EmbeddingToolbar = memo(function EmbeddingToolbar({
  onFiltersChange,
}: EmbeddingToolbarProps) {
  const { setShowCreateDialog, refreshTaskStatus, refreshTasks, clearTasks } =
    useEmbeddingActions();
  const { tasks } = useTasksData();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearType, setClearType] = useState<
    "all" | "success" | "failed" | "completed"
  >("all");

  // Calculate task statistics
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(
      (task) =>
        task.status === "PENDING" ||
        task.status === "STARTED" ||
        task.status === "PROGRESS"
    ).length;
    const successful = tasks.filter((task) => task.status === "SUCCESS").length;
    const failed = tasks.filter(
      (task) => task.status === "FAILURE" || task.status === "REVOKED"
    ).length;

    return { total, pending, successful, failed };
  }, [tasks]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      onFiltersChange({
        search: value || undefined,
        status: statusFilter !== "all" ? (statusFilter as any) : undefined,
        type: typeFilter !== "all" ? (typeFilter as any) : undefined,
      });
    },
    [onFiltersChange, statusFilter, typeFilter]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatusFilter(value);
      onFiltersChange({
        search: searchQuery || undefined,
        status: value !== "all" ? (value as any) : undefined,
        type: typeFilter !== "all" ? (typeFilter as any) : undefined,
      });
    },
    [onFiltersChange, searchQuery, typeFilter]
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      setTypeFilter(value);
      onFiltersChange({
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? (statusFilter as any) : undefined,
        type: value !== "all" ? (value as any) : undefined,
      });
    },
    [onFiltersChange, searchQuery, statusFilter]
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    onFiltersChange({});
  }, [onFiltersChange]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Refresh tasks from backend
      await refreshTasks();

      // Also refresh all active tasks status
      const activeTaskIds = tasks
        .filter(
          (task) =>
            task.status === "PENDING" ||
            task.status === "STARTED" ||
            task.status === "PROGRESS"
        )
        .map((task) => task.task_id);

      await Promise.all(activeTaskIds.map((id) => refreshTaskStatus(id)));
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshTasks, refreshTaskStatus, tasks]);

  const handleOpenClearModal = useCallback(
    (type: "all" | "success" | "failed" | "completed") => {
      setClearType(type);
      setShowClearModal(true);
    },
    []
  );

  const handleConfirmClear = useCallback(async () => {
    setIsClearing(true);
    try {
      await clearTasks(clearType);
      setShowClearModal(false);
    } catch (error) {
      console.error("Failed to clear tasks:", error);
    } finally {
      setIsClearing(false);
    }
  }, [clearTasks, clearType]);

  const hasActiveFilters =
    searchQuery || statusFilter !== "all" || typeFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Header Section with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Embedding Tasks
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your embedding and processing tasks
              </p>
            </div>
          </div>

          {/* Task Statistics */}
          <div className="flex items-center gap-2 ml-4">
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 px-3 py-1"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-xs font-medium">
                {taskStats.total} Total
              </span>
            </Badge>
            {taskStats.pending > 0 && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1"
              >
                <Activity className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-medium">
                  {taskStats.pending} Active
                </span>
              </Badge>
            )}
            {taskStats.successful > 0 && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1"
              >
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span className="text-xs font-medium">
                  {taskStats.successful} Success
                </span>
              </Badge>
            )}
            {taskStats.failed > 0 && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1"
              >
                <XCircle className="w-3 h-3 text-red-500" />
                <span className="text-xs font-medium">
                  {taskStats.failed} Failed
                </span>
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Clear Tasks Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-fit">
              <Button
                variant="outline"
                disabled={isClearing}
                className="shadow-sm w-fit px-0 justify-center"
              >
                <Trash2 className="w-4 h-4" />
                Clear Tasks
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Clear Tasks
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleOpenClearModal("success")}
                className="text-green-600 dark:text-green-400 focus:text-green-600 dark:focus:text-green-400"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Clear Successful ({taskStats.successful})
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleOpenClearModal("failed")}
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Clear Failed ({taskStats.failed})
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleOpenClearModal("all")}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All ({taskStats.total})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create Task Button */}
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks by ID, file, model, or provider..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:bg-background focus:border-border shadow-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-[200px] bg-background/50 border-border/50 shadow-sm">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    All Status
                  </div>
                </SelectItem>
                <SelectItem value="PENDING">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    Pending
                  </div>
                </SelectItem>
                <SelectItem value="STARTED">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Started
                  </div>
                </SelectItem>
                <SelectItem value="PROGRESS">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    In Progress
                  </div>
                </SelectItem>
                <SelectItem value="SUCCESS">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Success
                  </div>
                </SelectItem>
                <SelectItem value="FAILURE">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Failed
                  </div>
                </SelectItem>
                <SelectItem value="REVOKED">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full" />
                    Cancelled
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50 shadow-sm">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="file">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    File Embedding
                  </div>
                </SelectItem>
                <SelectItem value="text">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Text Embedding
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClearFilters}
                  title="Clear all filters"
                  className="shadow-sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}

              {/* Refresh */}
              <Button
                variant="outline"
                size="icon"
                title="Refresh tasks"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="shadow-sm"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Active filters:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {searchQuery && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1"
              >
                <Search className="w-3 h-3" />
                <span className="text-xs">"{searchQuery}"</span>
                <button
                  onClick={() => handleSearchChange("")}
                  className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    statusFilter === "SUCCESS"
                      ? "bg-green-500"
                      : statusFilter === "FAILURE"
                      ? "bg-red-500"
                      : statusFilter === "PENDING"
                      ? "bg-yellow-500"
                      : statusFilter === "STARTED"
                      ? "bg-blue-500"
                      : statusFilter === "PROGRESS"
                      ? "bg-orange-500"
                      : statusFilter === "REVOKED"
                      ? "bg-gray-500"
                      : "bg-gray-400"
                  }`}
                />
                <span className="text-xs">{statusFilter}</span>
                <button
                  onClick={() => handleStatusChange("all")}
                  className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {typeFilter !== "all" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1"
              >
                {typeFilter === "file" ? (
                  <FileText className="w-3 h-3" />
                ) : (
                  <Type className="w-3 h-3" />
                )}
                <span className="text-xs capitalize">{typeFilter}</span>
                <button
                  onClick={() => handleTypeChange("all")}
                  className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Clear Tasks Modal */}
      {showClearModal && (
        <ClearTasksModal
          clearType={clearType}
          onConfirm={handleConfirmClear}
          onCancel={() => setShowClearModal(false)}
          isClearing={isClearing}
        />
      )}

      {/* Empty State - only show when no tasks exist */}
    </div>
  );
});
