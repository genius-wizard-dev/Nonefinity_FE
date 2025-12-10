import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2, Copy, XCircle } from "lucide-react";
import type { IntegrationDetail } from "../types";

interface IntegrationDetailsProps {
  integration: IntegrationDetail;
  onCopy: (text: string, label: string) => void;
}

export function IntegrationDetails({
  integration,
  onCopy,
}: IntegrationDetailsProps) {
  return (
    <div className="w-2/5 flex flex-col border-l bg-muted/20">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Integration Details</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Status
            </label>
            <Badge
              variant={
                integration.status === "ENABLED" ? "default" : "secondary"
              }
              className="mt-1"
            >
              {integration.status === "ENABLED" ? (
                <CheckCircle2 className="h-3 w-3 mr-1.5" />
              ) : (
                <XCircle className="h-3 w-3 mr-1.5" />
              )}
              {integration.status}
            </Badge>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Connection Status
            </label>
            <Badge
              variant={integration.is_login ? "default" : "outline"}
              className="mt-1"
            >
              {integration.is_login ? (
                <CheckCircle2 className="h-3 w-3 mr-1.5" />
              ) : (
                <XCircle className="h-3 w-3 mr-1.5" />
              )}
              {integration.is_login ? "Connected" : "Not Connected"}
            </Badge>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Authentication Method
            </label>
            <Badge variant="outline" className="mt-1">
              {integration.auth_scheme || "OAUTH2"}
            </Badge>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Toolkit Slug
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-background border rounded-md text-sm font-mono">
                {integration.toolkit?.slug?.toUpperCase() || ""}
              </code>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        onCopy(integration.toolkit?.slug || "", "Toolkit Slug")
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Auth Config ID
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-background border rounded-md text-sm font-mono break-all">
                {integration.id}
              </code>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCopy(integration.id, "Auth Config ID")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
