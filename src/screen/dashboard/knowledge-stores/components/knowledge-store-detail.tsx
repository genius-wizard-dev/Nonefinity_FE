import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import VectorFlowGraph from "@/screen/dashboard/knowledge-stores/components/vector-graph";
import VectorList from "@/screen/dashboard/knowledge-stores/components/vector-list";
import {
  AlertCircle,
  ArrowLeft,
  Database,
  RefreshCw,
  Search,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { deleteVectors } from "../services";
import { useKnowledgeStoreStore } from "../store";
import type { KnowledgeStore, ScrollDataPoint } from "../types";

// Vector Point type for the components
type VectorPoint = {
  id: string;
  vector: number[];
  text: string;
  score?: number;
  timestamp: string;
};

// Vector Store Manager with Real Data
interface VectorStoreManagerWithDataProps {
  vectors: VectorPoint[];
  hasMore: boolean;
  onLoadMore: () => void;
  loading: boolean;
  knowledgeStoreId: string;
  onVectorsDeleted: () => void;
}

const VectorStoreManagerWithData: React.FC<VectorStoreManagerWithDataProps> = ({
  vectors,
  hasMore,
  onLoadMore,
  loading,
  knowledgeStoreId,
  onVectorsDeleted,
}) => {
  const [selectedVector, setSelectedVector] = useState<VectorPoint | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVectors = vectors.filter(
    (v) =>
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteVector = async (id: string) => {
    try {
      await deleteVectors(knowledgeStoreId, [id]);
      toast.success("Vector deleted successfully");
      onVectorsDeleted();
    } catch (error) {
      console.error("Failed to delete vector:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete vector"
      );
    }
  };

  const handleDeleteVectors = async (ids: string[]) => {
    await deleteVectors(knowledgeStoreId, ids);
    onVectorsDeleted();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Vector List */}
        <div className="w-96 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search vectors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>
          <VectorList
            vectors={filteredVectors}
            selectedVector={selectedVector}
            onSelectVector={setSelectedVector}
            onDeleteVector={handleDeleteVector}
            onDeleteVectors={handleDeleteVectors}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
            isLoadingMore={loading}
          />
        </div>

        {/* Right Panel - Vector Flow Graph */}
        <div className="flex-1 bg-background">
          <VectorFlowGraph
            vectors={vectors}
            selectedVector={selectedVector}
            onSelectVector={setSelectedVector}
          />
        </div>
      </div>
    </div>
  );
};

interface KnowledgeStoreDetailProps {
  knowledgeStore: KnowledgeStore | null;
  loading: boolean;
  error: string | null;
}

export const KnowledgeStoreDetail: React.FC<KnowledgeStoreDetailProps> = ({
  knowledgeStore,
  loading,
  error,
}) => {
  const navigate = useNavigate();

  // Use store for scroll data
  const {
    scrollData,
    hasMore,
    fetchScrollData,
    loadMoreScrollData,
    resetScrollData,
  } = useKnowledgeStoreStore();

  // Local loading state for vector data only
  const [vectorDataLoading, setVectorDataLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    if (knowledgeStore?.id) {
      setVectorDataLoading(true);
      fetchScrollData(knowledgeStore.id, {
        limit: 50,
        scroll_id: null,
      }).finally(() => {
        setVectorDataLoading(false);
      });
    }
  }, [knowledgeStore?.id, fetchScrollData]);

  // Load more data
  const loadMore = async () => {
    if (!knowledgeStore?.id) return;
    setVectorDataLoading(true);
    await loadMoreScrollData(knowledgeStore.id);
    setVectorDataLoading(false);
  };

  // Refresh data
  const refreshData = async () => {
    resetScrollData();
    if (knowledgeStore?.id) {
      setVectorDataLoading(true);
      await fetchScrollData(knowledgeStore.id, { limit: 100, scroll_id: null });
      setVectorDataLoading(false);
    }
  };

  // Convert scroll data to vector points
  const convertScrollDataToVectorPoints = (scrollData: ScrollDataPoint[]) => {
    return scrollData.map((point) => ({
      id: point.id,
      vector: point.vector,
      text: point.text,
      score: point.score,
      timestamp: new Date().toISOString(), // Use current timestamp as we don't have it from API
    }));
  };

  // Only show full page skeleton on initial load (when no knowledge store data)
  if (loading && !knowledgeStore) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !knowledgeStore) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Knowledge store not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-border bg-card">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard/knowledge-stores")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Back to Knowledge Stores</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {knowledgeStore.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {knowledgeStore.collection_name} •{" "}
              {knowledgeStore.description || "No description"}
            </p>
          </div>
          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            {knowledgeStore.status === "green" ? (
              <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full border border-green-200">
                <Zap className="h-3 w-3 animate-pulse" />
                <span className="text-xs font-medium">Healthy</span>
              </div>
            ) : knowledgeStore.status === "yellow" ? (
              <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
                <AlertCircle className="h-3 w-3" />
                <span className="text-xs font-medium">Warning</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-full border border-red-200">
                <AlertCircle className="h-3 w-3" />
                <span className="text-xs font-medium">Error</span>
              </div>
            )}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={vectorDataLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${vectorDataLoading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Vector Store Manager with Real Data */}
      <div className="flex-1 overflow-hidden">
        {vectorDataLoading && (!scrollData || scrollData.length === 0) ? (
          // Show skeleton only when loading and no data yet
          <div className="flex h-full">
            {/* Left Panel Skeleton */}
            <div className="w-96 border-r border-border bg-card p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full" />
                ))}
              </div>
            </div>
            {/* Right Panel Skeleton */}
            <div className="flex-1 bg-background p-6 space-y-4">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        ) : scrollData && scrollData.length > 0 ? (
          <VectorStoreManagerWithData
            vectors={convertScrollDataToVectorPoints(scrollData)}
            hasMore={hasMore}
            onLoadMore={loadMore}
            loading={vectorDataLoading}
            knowledgeStoreId={knowledgeStore.id}
            onVectorsDeleted={refreshData}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Vector Data Found
              </h3>
              <p className="text-muted-foreground mb-4">
                This knowledge store doesn't contain any vector data yet.
              </p>
              <Button
                onClick={refreshData}
                variant="outline"
                disabled={vectorDataLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    vectorDataLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
