import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, X } from "lucide-react";
import type { ResourceTypeConfig } from "./registry";

interface ResourceSelectorProps<T extends { id: string; name: string }> {
  resourceType: ResourceTypeConfig;
  resources: T[];
  loading: boolean;
  selectedId: string | null | undefined;
  selectedName: string | null | undefined;
  onSelect: (resource: T) => void;
  onRemove?: () => void;
  onRefresh: () => void;
  disabled?: boolean;
  id: string;
}

export function ResourceSelector<T extends { id: string; name: string }>({
  resourceType,
  resources,
  loading,
  selectedId,
  selectedName,
  onSelect,
  onRemove,
  onRefresh,
  disabled = false,
  id,
}: ResourceSelectorProps<T>) {
  const Icon = resourceType.icon;
  const selectedResource = selectedId
    ? resources.find((r) => r.id === selectedId) ||
      (selectedId && selectedName
        ? ({ id: selectedId, name: selectedName } as T)
        : null)
    : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{resourceType.label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading || disabled}
          className="gap-2 h-7"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      {loading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Select
          value={selectedId || ""}
          onValueChange={(value) => {
            const resource = resources.find((r) => r.id === value);
            if (resource) {
              onSelect(resource);
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger id={id}>
            <SelectValue placeholder={resourceType.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {resources.length === 0 ? (
              <SelectItem value="__no_resources__" disabled>
                {selectedId
                  ? "Click Refresh to load resources"
                  : resourceType.emptyMessage}
              </SelectItem>
            ) : (
              resources.map((resource) => (
                <SelectItem key={resource.id} value={resource.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{resource.name}</span>
                  </div>
                </SelectItem>
              ))
            )}
            {/* Show selected resource from config even if not in fetched list */}
            {selectedResource &&
              !resources.find((r) => r.id === selectedResource.id) && (
                <SelectItem key={selectedResource.id} value={selectedResource.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{selectedResource.name}</span>
                  </div>
                </SelectItem>
              )}
          </SelectContent>
        </Select>
      )}
      {selectedId && selectedResource && (
        <div className="space-y-1 p-2 bg-muted/50 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Selected:</p>
              <p className="text-sm font-medium truncate">{selectedResource.name}</p>
            </div>
            {onRemove && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="h-6 w-6 flex-shrink-0 ml-2"
                title="Remove selection"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

