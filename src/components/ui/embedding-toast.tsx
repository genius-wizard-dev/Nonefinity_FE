import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Loader2 } from "lucide-react";

interface EmbeddingToastProps {
  status: string;
  progress?: number;
  totalChunks?: number;
  successfulChunks?: number;
}

export function EmbeddingToast({
  status,
  progress = 0,
  totalChunks = 0,
  successfulChunks = 0,
}: EmbeddingToastProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "PENDING":
        return {
          title: "Embedding in Progress",
          subtitle:
            "Your file is being processed. This may take a few minutes...",
          icon: <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />,
          badgeColor: "bg-yellow-100 text-yellow-800",
        };
      case "STARTED":
        return {
          title: "Embedding Started",
          subtitle: "Processing your file for embedding generation...",
          icon: <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />,
          badgeColor: "bg-blue-100 text-blue-800",
        };
      case "PROGRESS":
        return {
          title: "Embedding in Progress",
          subtitle: "Generating embeddings from your file content...",
          icon: <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />,
          badgeColor: "bg-blue-100 text-blue-800",
        };
      case "SUCCESS":
        return {
          title: "Embedding Completed",
          subtitle: `Successfully processed ${totalChunks} chunks`,
          icon: <Brain className="w-5 h-5 text-green-600" />,
          badgeColor: "bg-green-100 text-green-800",
        };
      case "FAILURE":
        return {
          title: "Embedding Failed",
          subtitle: "An error occurred during embedding",
          icon: <Brain className="w-5 h-5 text-red-600" />,
          badgeColor: "bg-red-100 text-red-800",
        };
      default:
        return {
          title: "Embedding in Progress",
          subtitle:
            "Your file is being processed. This may take a few minutes...",
          icon: <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />,
          badgeColor: "bg-blue-100 text-blue-800",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const isInProgress =
    status === "PENDING" || status === "STARTED" || status === "PROGRESS";

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[320px] max-w-[400px]">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{statusInfo.icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 text-sm">
              {statusInfo.title}
            </h4>
            <Badge
              variant="secondary"
              className={`text-xs ${statusInfo.badgeColor}`}
            >
              {status}
            </Badge>
          </div>

          <p className="text-xs text-gray-600 mb-3">{statusInfo.subtitle}</p>

          {/* Progress bar for in-progress tasks */}
          {isInProgress && totalChunks > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Processing Progress</span>
                <span className="font-medium text-gray-700">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
              <div className="text-xs text-gray-500">
                {successfulChunks} of {totalChunks} chunks processed
              </div>
            </div>
          )}

          {/* Success stats */}
          {status === "SUCCESS" && totalChunks > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-2 mt-2">
              <div className="flex items-center gap-2 text-xs text-green-700">
                <Brain className="w-4 h-4" />
                <span className="font-medium">
                  {successfulChunks} chunks successfully processed
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
