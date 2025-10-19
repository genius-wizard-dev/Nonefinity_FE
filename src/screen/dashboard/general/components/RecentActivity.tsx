import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Activity, Clock, Database, FileUp, TrendingUp } from "lucide-react";

export function RecentActivity() {
  // Mock data - replace with real data from your API
  const activities = [
    {
      id: 1,
      type: "file_upload",
      title: "Uploaded 3 new files",
      description: "documents.pdf, data.csv, report.docx",
      timestamp: "2 hours ago",
      icon: <FileUp className="w-4 h-4" />,
      badge: "Upload",
    },
    {
      id: 2,
      type: "dataset",
      title: "Created new dataset",
      description: "Q&A Training Dataset v2",
      timestamp: "5 hours ago",
      icon: <Database className="w-4 h-4" />,
      badge: "Dataset",
    },
    {
      id: 3,
      type: "processing",
      title: "Completed embedding process",
      description: "Processed 150 documents successfully",
      timestamp: "1 day ago",
      icon: <TrendingUp className="w-4 h-4" />,
      badge: "Processing",
    },
  ];

  const hasActivities = activities.length > 0;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Track your latest actions and updates
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent>
        {!hasActivities ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="p-4 bg-muted/50 rounded-full">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-foreground">
                No recent activity yet
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                Start by uploading files, creating datasets, or configuring your
                embeddings!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id}>
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="p-2 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                    {activity.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {activity.title}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {activity.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {activity.timestamp}
                    </div>
                  </div>
                </div>
                {index < activities.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
