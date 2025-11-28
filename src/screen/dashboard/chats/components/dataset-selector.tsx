import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, RefreshCw } from "lucide-react";
import React, { useCallback, useState } from "react";
import type { Dataset } from "../../dataset-management/types";
import { useChatStore } from "../store";

interface DatasetSelectorProps {
  datasets: Dataset[];
  selectedIds: string[] | null;
  onSelectionChange: (selectedIds: string[]) => void;
  loading?: boolean;
  idPrefix?: string;
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  datasets,
  selectedIds,
  onSelectionChange,
  loading = false,
  idPrefix = "dataset",
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchDatasets = useChatStore((state) => state.fetchDatasets);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDatasets(true);
    setIsRefreshing(false);
  };

  const handleToggle = useCallback(
    (datasetId: string) => {
      const currentIds = selectedIds || [];
      if (currentIds.includes(datasetId)) {
        onSelectionChange(currentIds.filter((id) => id !== datasetId));
      } else {
        onSelectionChange([...currentIds, datasetId]);
      }
    },
    [selectedIds, onSelectionChange]
  );

  if (loading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Datasets (Optional)</Label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Refresh datasets"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>
      <div className="border rounded-lg p-4 max-h-64 overflow-auto bg-muted/30">
        {datasets.length === 0 ? (
          <div className="text-center py-8">
            <Database className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No datasets available
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {datasets.map((dataset) => {
              const isSelected = selectedIds?.includes(dataset.id) || false;
              return (
                <div
                  key={dataset.id}
                  className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-accent"
                >
                  <Checkbox
                    id={`${idPrefix}-${dataset.id}`}
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(dataset.id)}
                  />
                  <Database className="w-4 h-4 text-primary flex-shrink-0" />
                  <label
                    htmlFor={`${idPrefix}-${dataset.id}`}
                    className="flex-1 cursor-pointer text-sm font-medium"
                  >
                    {dataset.name}
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedIds && selectedIds.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {selectedIds.length} dataset
          {selectedIds.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
};
