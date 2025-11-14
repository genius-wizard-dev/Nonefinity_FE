import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, RefreshCw } from "lucide-react";
import type { IntegrationItem } from "../types";

interface IntegrationListProps {
  integrations: IntegrationItem[];
  isLoading: boolean;
  connectingId: string | null;
  onRefresh: () => void;
  onViewTools: (integration: IntegrationItem) => void;
  onConnect: (integration: IntegrationItem) => void;
}

export function IntegrationList({
  integrations,
  isLoading,
  connectingId,
  onRefresh,
  onViewTools,
  onConnect,
}: IntegrationListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration List</CardTitle>
        <CardDescription>
          Connect to third-party services and manage your integrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : integrations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No integrations found</p>
            <Button className="mt-4" variant="outline" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Connection</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrations.map((integration) => (
                <TableRow key={integration.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {integration.toolkit?.logo && (
                        <img
                          src={integration.toolkit.logo}
                          alt={integration.name}
                          className="h-8 w-8 rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <div>
                        <div className="font-medium">{integration.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        integration.status === "ENABLED"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {integration.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={integration.is_login ? "default" : "outline"}
                    >
                      {integration.is_login ? "Connected" : "Not Connected"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewTools(integration)}
                        disabled={integration.status !== "ENABLED"}
                        className="w-28"
                      >
                        View Tools
                      </Button>
                      <Button
                        variant={integration.is_login ? "outline" : "default"}
                        size="sm"
                        onClick={() => onConnect(integration)}
                        disabled={
                          connectingId === integration.id ||
                          integration.status !== "ENABLED"
                        }
                        className="w-28"
                      >
                        {connectingId === integration.id ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : integration.is_login ? (
                          "Connected"
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
