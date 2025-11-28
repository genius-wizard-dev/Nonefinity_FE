import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plug } from "lucide-react";
import React, { useCallback } from "react";
import type { IntegrationConfig } from "../types";

interface IntegrateSelectorProps {
  integrations: IntegrationConfig[];
  selectedIds: string[] | null;
  onSelectionChange: (selectedIds: string[]) => void;
  loading?: boolean;
  idPrefix?: string;
}

export const IntegrateSelector: React.FC<IntegrateSelectorProps> = ({
  integrations,
  selectedIds,
  onSelectionChange,
  loading = false,
  idPrefix = "integrate",
}) => {
  const handleToggle = useCallback(
    (integrationId: string) => {
      const currentIds = selectedIds || [];
      if (currentIds.includes(integrationId)) {
        onSelectionChange(currentIds.filter((id) => id !== integrationId));
      } else {
        onSelectionChange([...currentIds, integrationId]);
      }
    },
    [selectedIds, onSelectionChange]
  );

  if (loading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <div className="space-y-2">
      <Label>Integrations (Optional)</Label>
      <div className="border rounded-lg p-4 max-h-64 overflow-auto bg-muted/30">
        {integrations.length === 0 ? (
          <div className="text-center py-8">
            <Plug className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No integrations available. Please configure tools for integrations
              first.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {integrations.map((integration) => {
              const isSelected = selectedIds?.includes(integration.id) || false;
              return (
                <div
                  key={integration.id}
                  className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-accent"
                >
                  <Checkbox
                    id={`${idPrefix}-${integration.id}`}
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(integration.id)}
                  />
                  {integration.logo ? (
                    <img
                      src={integration.logo}
                      alt={integration.name}
                      className="w-5 h-5 rounded flex-shrink-0 object-contain"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        e.currentTarget.style.display = "none";
                        const icon = e.currentTarget
                          .nextElementSibling as HTMLElement;
                        if (icon) icon.style.display = "block";
                      }}
                    />
                  ) : null}
                  <Plug
                    className="w-5 h-5 text-primary flex-shrink-0"
                    style={{ display: integration.logo ? "none" : "block" }}
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={`${idPrefix}-${integration.id}`}
                      className="cursor-pointer text-sm font-medium block"
                    >
                      {integration.name}
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedIds && selectedIds.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {selectedIds.length} integration
          {selectedIds.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
};
