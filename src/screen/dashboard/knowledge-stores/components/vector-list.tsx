"use client";

import { LogoSpinner } from "@/components/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronRight, FileText, Hash, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { VectorPoint } from "./vector-graph";

type VectorListProps = {
  vectors: VectorPoint[];
  selectedVector: VectorPoint | null;
  onSelectVector: (vector: VectorPoint) => void;
  onDeleteVector: (id: string) => void;
  onDeleteVectors: (ids: string[]) => Promise<void>;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
};

export default function VectorList({
  vectors,
  selectedVector,
  onSelectVector,
  onDeleteVector,
  onDeleteVectors,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
}: VectorListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSingleDeleteDialog, setShowSingleDeleteDialog] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(vectors.map((v) => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    setIsDeleting(true);
    try {
      await onDeleteVectors(selectedIds);
      toast.success(`Successfully deleted ${selectedIds.length} vector(s)`);
      setSelectedIds([]);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete vectors:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete vectors"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSingleDeleteClick = (id: string) => {
    setSingleDeleteId(id);
    setShowSingleDeleteDialog(true);
  };

  const handleConfirmSingleDelete = () => {
    if (!singleDeleteId) return;
    onDeleteVector(singleDeleteId);
    setShowSingleDeleteDialog(false);
    setSingleDeleteId(null);
  };

  const allSelected =
    vectors.length > 0 && selectedIds.length === vectors.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      {vectors.length > 0 && (
        <div className="p-4 border-b border-border bg-card/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    const input = el.querySelector(
                      'input[type="checkbox"]'
                    ) as HTMLInputElement;
                    if (input) {
                      input.indeterminate = someSelected;
                    }
                  }
                }}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedIds.length > 0
                  ? `${selectedIds.length} selected`
                  : `${vectors.length} vector(s)`}
              </span>
            </div>

            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Vector List */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-24 space-y-3">
          {vectors.map((vector, index) => (
            <Card
              key={vector.id}
              className={`group cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                selectedVector?.id === vector.id
                  ? "bg-gradient-to-r from-primary/10 to-primary/5 border-primary shadow-lg"
                  : selectedIds.includes(vector.id)
                  ? "bg-accent/50 border-accent"
                  : "hover:bg-accent/5 border-border"
              }`}
              onClick={() => onSelectVector(vector)}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(vector.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(vector.id, checked as boolean)
                      }
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header with ID and Vector Badge */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-primary/70" />
                        <code className="text-sm font-mono text-primary font-medium">
                          Vector {index + 1}
                        </code>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20"
                      >
                        {vector.vector.length}D
                      </Badge>
                    </div>

                    {/* Text Content */}
                    {vector.text && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-3 text-sm">
                          <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground break-words leading-relaxed line-clamp-3">
                              {vector.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Vector ID */}
                    <div className="mt-2 text-xs text-muted-foreground font-mono truncate">
                      ID: {vector.id}
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSingleDeleteClick(vector.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete vector</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                    <LogoSpinner size="sm" className="mr-2" />
                    Loading more...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vectors</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} vector(s)?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting && (
                <LogoSpinner size="sm" className="mr-2" variant="light" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog
        open={showSingleDeleteDialog}
        onOpenChange={setShowSingleDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vector</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vector? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSingleDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSingleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
