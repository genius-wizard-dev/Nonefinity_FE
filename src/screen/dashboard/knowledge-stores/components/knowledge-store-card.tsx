"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { KnowledgeStore } from "../types";

interface KnowledgeStoreCardProps {
  knowledgeStore: KnowledgeStore;
  onEdit: (knowledgeStore: KnowledgeStore) => void;
  onDelete: (knowledgeStore: KnowledgeStore) => void;
}

export function KnowledgeStoreCard({
  knowledgeStore,
  onEdit,
  onDelete,
}: KnowledgeStoreCardProps) {
  const navigate = useNavigate();

  const statusColors = {
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const statusLabels = {
    green: "Active",
    yellow: "Warning",
    red: "Error",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCardClick = () => {
    navigate(`/dashboard/knowledge-stores/${knowledgeStore.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(knowledgeStore);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(knowledgeStore);
  };

  return (
    <Card
      className="bg-card border-border hover:border-primary/30 transition-colors group cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg font-mono text-foreground">
                {knowledgeStore.name}
              </CardTitle>
              <Badge
                variant="outline"
                className={`text-xs ${statusColors[knowledgeStore.status]}`}
              >
                {statusLabels[knowledgeStore.status]}
              </Badge>
            </div>
            <CardDescription className="text-sm text-muted-foreground">
              {knowledgeStore.description || "No description provided"}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-popover border-border"
            >
              <DropdownMenuItem
                className="text-popover-foreground"
                onClick={handleEditClick}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Info
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-popover-foreground"
                onClick={handleCardClick}
              >
                <Search className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDeleteClick}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Store
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Vectors</p>
            <p className="text-lg font-mono text-foreground">
              {knowledgeStore.points_count}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Dimensions</p>
            <p className="text-lg font-mono text-foreground">
              {knowledgeStore.dimension}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Distance</p>
            <p className="text-sm font-mono text-foreground truncate">
              {knowledgeStore.distance}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-sm text-foreground">
              {formatDate(knowledgeStore.created_at)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
