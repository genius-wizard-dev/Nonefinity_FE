import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import { Brain, RefreshCw } from "lucide-react";

interface EmbeddingHeaderProps {
  loading: boolean;
  onRefreshModels: () => void;
  onRefreshFiles: () => Promise<void>;
}

export function EmbeddingHeader({
  loading,
  onRefreshModels,
  onRefreshFiles,
}: EmbeddingHeaderProps) {
  const { getToken } = useAuth();

  const handleRefreshFiles = async () => {
    const token = await getToken();
    if (token) {
      await onRefreshFiles();
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="w-8 h-8" />
          Embedding Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Create embeddings and perform similarity searches
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onRefreshModels} disabled={loading}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh Models
        </Button>
        <Button
          variant="outline"
          onClick={handleRefreshFiles}
          disabled={loading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh Files
        </Button>
      </div>
    </div>
  );
}
