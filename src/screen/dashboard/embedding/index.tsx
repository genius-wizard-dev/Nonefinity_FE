import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EmbeddingCreateDialog,
  EmbeddingTaskList,
  EmbeddingToolbar,
} from "./components";
import { useEmbeddingActions } from "./store";
import type { EmbeddingTaskFilters } from "./types";

export function EmbeddingPage() {
  const [filters, setFilters] = useState<EmbeddingTaskFilters>({});
  const { fetchTasks } = useEmbeddingActions();

  // Memoize the API params to avoid unnecessary re-fetches
  const apiParams = useMemo(() => {
    const params: any = {};
    if (filters.status) params.status = filters.status;
    if (filters.type) {
      params.task_type =
        filters.type === "file" ? "embedding" : "text_embedding";
    }
    return params;
  }, [filters.status, filters.type]);

  // Single effect to handle both initial load and filter changes
  useEffect(() => {
    fetchTasks(apiParams);
  }, [fetchTasks, apiParams]);

  // Memoize handlers to prevent re-renders
  const handleFiltersChange = useCallback(
    (newFilters: EmbeddingTaskFilters) => {
      setFilters(newFilters);
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <EmbeddingToolbar onFiltersChange={handleFiltersChange} />
      <EmbeddingTaskList
        filters={filters}
        onClearFilters={handleClearFilters}
      />
      <EmbeddingCreateDialog />
    </div>
  );
}

export default EmbeddingPage;
