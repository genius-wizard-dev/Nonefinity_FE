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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChatService } from "../services";
import { useChatStore } from "../store";
import type { ChatSession } from "../types";

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configId: string;
}

export const CreateSessionDialog: React.FC<CreateSessionDialogProps> = ({
  open,
  onOpenChange,
  configId,
}) => {
  const { createSession } = useChatStore();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const session = await createSession({
        name,
        chat_config_id: configId,
      });
      if (session) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">New Session</h2>
            <p className="text-sm text-muted-foreground">
              Create a new chat session for this configuration.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Session Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter session name..."
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface SessionCardProps {
  session: ChatSession;
  isSelected: boolean;
  isSelectMode: boolean;
  isChecked: boolean;
  onSelect: () => void;
  onCheck: (checked: boolean) => void;
  onDelete: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  isSelected,
  isSelectMode,
  isChecked,
  onSelect,
  onCheck,
  onDelete,
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md group ${
        isSelected ? "ring-2 ring-primary border-primary" : "border-border/50"
      }`}
      onClick={() => {
        if (isSelectMode) {
          onCheck(!isChecked);
        } else {
          onSelect();
        }
      }}
    >
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          {isSelectMode ? (
            <Checkbox
              checked={isChecked}
              onCheckedChange={(checked) => onCheck(checked as boolean)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-muted-foreground transition-colors duration-200 group-hover:bg-muted/80">
              <MessageSquare className="w-5 h-5" />
            </div>
          )}
          <div>
            <CardTitle className="text-base font-semibold leading-none mb-1.5">
              {session.name || "Untitled Session"}
            </CardTitle>
            <CardDescription className="text-xs">
              Created {new Date(session.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
        </div>
        {!isSelectMode && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete session</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="font-normal">
            Active
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

interface SessionListProps {
  configId: string;
  onSessionSelect: (session: ChatSession) => void;
  selectedSessionId?: string;
}

export const SessionList: React.FC<SessionListProps> = ({
  configId,
  onSessionSelect,
  selectedSessionId,
}) => {
  const {
    sessions,
    sessionsLoading,
    fetchSessions,
    refreshSessions,
    deleteSession,
  } = useChatStore();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(
    new Set()
  );
  const [lastConfigId, setLastConfigId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Clear selection when config changes
  useEffect(() => {
    if (configId !== lastConfigId) {
      setSelectedSessions(new Set());
      setSearchQuery("");
      setLastConfigId(configId);
    }
  }, [configId, lastConfigId]);

  useEffect(() => {
    if (configId) {
      fetchSessions(configId);
    }
  }, [configId, fetchSessions]);

  const handleDelete = async (id: string) => {
    setSessionToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (sessionToDelete) {
        await deleteSession(sessionToDelete);
        setSessionToDelete(null);
      } else if (selectedSessions.size > 0) {
        await Promise.all(
          Array.from(selectedSessions).map((id) => deleteSession(id))
        );
        toast.success(`Deleted ${selectedSessions.size} session(s)`);
        setSelectedSessions(new Set());
      }
      setDeleteConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSessionSelection = (id: string) => {
    const newSelected = new Set(selectedSessions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSessions(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filtered = filteredSessions; // Use the filtered list for select all
      setSelectedSessions(new Set(filtered.map((s) => s.id)));
    } else {
      setSelectedSessions(new Set());
    }
  };

  const filteredSessions = React.useMemo(() => {
    let result = sessions.filter((s) => s.chat_config_id === configId);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((s) =>
        (s.name || "Untitled Session").toLowerCase().includes(query)
      );
    }
    return result;
  }, [sessions, configId, searchQuery]);

  const handleExportAll = async () => {
    try {
      toast.loading("Starting export as CSV...", {
        id: "export-config-history",
      });

      // Trigger background task
      const result = await ChatService.exportChatConfigHistory(configId);

      if (result && result.status === "PENDING") {
        toast.success(
          "Export started in background. Check Tasks for progress.",
          {
            id: "export-config-history",
            duration: 4000,
          }
        );
      } else {
        // Fallback or error
        toast.error("Failed to start export task", {
          id: "export-config-history",
        });
      }
    } catch (error) {
      console.error("Export config error:", error);
      toast.error("Failed to start export", { id: "export-config-history" });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={
                  filteredSessions.length > 0 &&
                  selectedSessions.size === filteredSessions.length
                }
                onCheckedChange={(checked) =>
                  handleSelectAll(checked as boolean)
                }
                disabled={filteredSessions.length === 0}
              />
              <Label
                htmlFor="select-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Select All
              </Label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64 mr-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                className="pl-8 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {selectedSessions.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedSessions.size})
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={handleExportAll}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => refreshSessions(configId)}
              title="Refresh sessions"
            >
              <RefreshCw
                className={`w-4 h-4 ${sessionsLoading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              size="sm"
              className="h-9"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </div>
        </div>
      </div>

      {sessionsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg border-dashed">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? "No matching sessions" : "No active sessions"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? `No sessions match "${searchQuery}"`
              : "Start a new conversation to get started"}
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            Create Session
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isSelected={session.id === selectedSessionId}
              isSelectMode={selectedSessions.size > 0}
              isChecked={selectedSessions.has(session.id)}
              onSelect={() => onSessionSelect(session)}
              onCheck={() => toggleSessionSelection(session.id)}
              onDelete={() => handleDelete(session.id)}
            />
          ))}
        </div>
      )}

      <CreateSessionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        configId={configId}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected session(s) and all associated messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setSessionToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
