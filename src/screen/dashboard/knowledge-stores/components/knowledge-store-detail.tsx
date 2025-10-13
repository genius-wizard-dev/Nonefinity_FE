import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import VectorFlowGraph from "@/screen/dashboard/knowledge-stores/components/vector-graph";
import VectorList from "@/screen/dashboard/knowledge-stores/components/vector-list";
import {
  AlertCircle,
  ArrowLeft,
  Database,
  Filter,
  RefreshCw,
  Search,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKnowledgeStoreStore } from "../store";
import type { KnowledgeStore, ScrollDataPoint } from "../types";

// Vector Point type for the components
type VectorPoint = {
  id: string;
  vector: number[];
  payload: Record<string, any>;
  score?: number;
  timestamp: string;
};

// Vector Store Manager with Real Data
interface VectorStoreManagerWithDataProps {
  vectors: VectorPoint[];
  hasMore: boolean;
  onLoadMore: () => void;
  loading: boolean;
}

const VectorStoreManagerWithData: React.FC<VectorStoreManagerWithDataProps> = ({
  vectors,
  hasMore,
  onLoadMore,
  loading,
}) => {
  const [selectedVector, setSelectedVector] = useState<VectorPoint | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVectors = vectors.filter(
    (v) =>
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(v.payload)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

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
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-transparent"
              >
                <Filter className="w-3 h-3 mr-1" />
                Filter
              </Button>
              <Badge variant="outline" className="text-xs">
                All Categories
              </Badge>
            </div>
          </div>
          <VectorList
            vectors={filteredVectors}
            selectedVector={selectedVector}
            onSelectVector={setSelectedVector}
            onDeleteVector={(id) => {
              // TODO: Implement delete functionality with API
              console.log("Delete vector:", id);
            }}
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
        limit: 5,
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
      payload: point.payload,
      score: point.score,
      timestamp: new Date().toISOString(), // Use current timestamp as we don't have it from API
    }));
  };

  if (loading) {
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/knowledge-stores")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
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
        {scrollData && scrollData.length > 0 ? (
          <VectorStoreManagerWithData
            vectors={convertScrollDataToVectorPoints(scrollData)}
            hasMore={hasMore}
            onLoadMore={loadMore}
            loading={vectorDataLoading}
          />
        ) : vectorDataLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading vector data...</p>
            </div>
          </div>
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
              <Button onClick={refreshData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
