import { Skeleton } from "@/components/ui/skeleton";
import type { GoogleSheet, ViewMode } from "../types";
import { SheetCard } from "./sheet-card";
import { SheetListItem } from "./sheet-list-item";

interface SheetGridProps {
  sheets: GoogleSheet[];
  viewMode: ViewMode;
  selectedSheets: string[];
  onSelectionChange: (selected: string[]) => void;
  onOpen?: (sheet: GoogleSheet) => void;
  isLoading?: boolean;
}

export function SheetGrid({
  sheets,
  viewMode,
  selectedSheets,
  onSelectionChange,
  onOpen,
  isLoading,
}: SheetGridProps) {
  const handleSelect = (sheetId: string) => {
    if (selectedSheets.includes(sheetId)) {
      onSelectionChange(selectedSheets.filter((id) => id !== sheetId));
    } else {
      onSelectionChange([...selectedSheets, sheetId]);
    }
  };

  if (isLoading) {
    if (viewMode === "list") {
      return (
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl px-6 py-6">
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-6 w-6 rounded" />
                            <div className="space-y-1 w-1/2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-8 w-16 ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (sheets.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">No sheets found</p>
          <p className="text-sm text-muted-foreground mt-2">
            {selectedSheets.length > 0
              ? "Try a different search"
              : "Connect your Google account to see your sheets"}
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full table-fixed">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[60%]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[15%]">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground w-[25%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sheets.map((sheet) => (
                  <SheetListItem
                    key={sheet.id}
                    sheet={sheet}
                    isSelected={selectedSheets.includes(sheet.id)}
                    onSelect={() => handleSelect(sheet.id)}
                    onOpen={onOpen}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sheets.map((sheet) => (
            <SheetCard
              key={sheet.id}
              sheet={sheet}
              isSelected={selectedSheets.includes(sheet.id)}
              onSelect={() => handleSelect(sheet.id)}
              onOpen={onOpen}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

