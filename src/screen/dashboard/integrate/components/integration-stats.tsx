import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { IntegrationItem } from "../types";

interface IntegrationStatsProps {
  integrations: IntegrationItem[];
  stats: {
    total: number;
    connected: number;
    available: number;
  } | null;
}

export function IntegrationStats({
  integrations,
  stats,
}: IntegrationStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.total ?? integrations.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Available integrations
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Connected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.connected ??
              integrations.filter((i) => i.is_login).length}
          </div>
          <p className="text-xs text-muted-foreground">Active connections</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.available ?? integrations.length}
          </div>
          <p className="text-xs text-muted-foreground">Ready to connect</p>
        </CardContent>
      </Card>
    </div>
  );
}

