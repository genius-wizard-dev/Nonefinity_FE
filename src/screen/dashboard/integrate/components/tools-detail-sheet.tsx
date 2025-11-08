import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { IntegrationDetail, Tool } from "../types";
import { IntegrationDetails } from "./integration-details";
import { ToolsList } from "./tools-list";

interface ToolsDetailSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIntegration: IntegrationDetail | null;
  tools: Tool[];
  isLoadingTools: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTools: Set<string>;
  onToggleTool: (toolSlug: string) => void;
  onAddTools?: () => void;
  onCopy: (text: string, label: string) => void;
}

export function ToolsDetailSheet({
  isOpen,
  onOpenChange,
  selectedIntegration,
  tools,
  isLoadingTools,
  searchQuery,
  onSearchChange,
  selectedTools,
  onToggleTool,
  onAddTools,
  onCopy,
}: ToolsDetailSheetProps) {
  const isConnected = selectedIntegration?.is_login ?? false;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-5xl overflow-hidden flex flex-col p-0"
      >
        {selectedIntegration ? (
          <>
            <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                {selectedIntegration.toolkit?.logo && (
                  <img
                    src={selectedIntegration.toolkit.logo}
                    alt={selectedIntegration.name}
                    className="h-12 w-12 rounded-lg border-2 border-background shadow-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <div className="flex items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <SheetTitle className="text-2xl font-semibold">
                        {selectedIntegration.name}
                      </SheetTitle>
                      {!isConnected && (
                        <Badge variant="outline" className="text-xs">
                          View
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 flex overflow-hidden">
              <ToolsList
                tools={tools}
                isLoading={isLoadingTools}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                selectedTools={selectedTools}
                onToggleTool={onToggleTool}
                isConnected={isConnected}
                onAddTools={onAddTools}
              />
              <IntegrationDetails
                integration={selectedIntegration}
                onCopy={onCopy}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
