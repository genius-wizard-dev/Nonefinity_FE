import { Button } from "@/components/ui/button";
import { Link, RefreshCw } from "lucide-react";

interface IntegrationHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export function IntegrationHeader({
  isLoading,
  onRefresh,
}: IntegrationHeaderProps) {
  return (
    <div className="bg-card shadow-sm rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Link className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Integrations
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connect and manage your third-party integrations with Composio
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}

