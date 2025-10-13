"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Hash, Loader2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { VectorPoint } from "./vector-graph";

type VectorListProps = {
  vectors: VectorPoint[];
  selectedVector: VectorPoint | null;
  onSelectVector: (vector: VectorPoint) => void;
  onDeleteVector: (id: string) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
};

export default function VectorList({
  vectors,
  selectedVector,
  onSelectVector,
  onDeleteVector,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
}: VectorListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLoadMore, setShowLoadMore] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (isNearBottom && hasMore && !isLoadingMore) {
        setShowLoadMore(true);
      } else {
        setShowLoadMore(false);
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingMore]);

  const handleLoadMore = () => {
    if (onLoadMore && !isLoadingMore) {
      onLoadMore();
    }
  };
  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-3"
    >
      {vectors.map((vector, index) => (
        <Card
          key={vector.id}
          className={`group cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
            selectedVector?.id === vector.id
              ? "bg-gradient-to-r from-primary/10 to-primary/5 border-primary shadow-lg"
              : "hover:bg-accent/5 border-border"
          }`}
          onClick={() => onSelectVector(vector)}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Header with ID and Category */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary/70" />
                    <code className="text-sm font-mono text-primary font-medium">
                      Vector {index + 1}
                    </code>
                  </div>
                  {vector.payload.category && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20"
                    >
                      {vector.payload.category}
                    </Badge>
                  )}
                </div>

                {/* Payload Data */}
                <div className="space-y-2">
                  {Object.entries(vector.payload).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3 text-sm">
                      <span className="text-muted-foreground font-medium flex-shrink-0 min-w-[80px]">
                        {key}:
                      </span>
                      <span className="text-foreground break-words min-w-0 leading-relaxed">
                        {typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Score Display */}
                {vector.score !== undefined && vector.score !== null && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-medium text-sm">
                        Similarity Score:
                      </span>
                      <span className="text-foreground font-mono text-sm font-semibold bg-accent/50 px-2 py-1 rounded">
                        {vector.score.toFixed(4)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteVector(vector.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Load More Button */}
      {showLoadMore && hasMore && (
        <div className="flex justify-center py-4">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="w-full max-w-xs"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
