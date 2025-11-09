import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { MessageSquare, Plus, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useChatStore } from "../store";
import type { ChatSession, ChatSessionCreate } from "../types";

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
  const { createSession, fetchSessions } = useChatStore();
  const [formData, setFormData] = useState<ChatSessionCreate>({
    chat_config_id: configId,
    name: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        chat_config_id: configId,
        name: "",
      });
    }
  }, [open, configId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const session = await createSession({
        chat_config_id: configId,
        name: formData.name || undefined,
      });

      if (session) {
        await fetchSessions(configId);
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
        <DialogHeader>
          <DialogTitle>Create New Chat Session</DialogTitle>
          <DialogDescription>
            Start a new chat session with this configuration
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Session Name (Optional)</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="My Chat Session"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface SessionCardProps {
  session: ChatSession;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  isBulkSelected: boolean;
  onBulkSelectChange: (checked: boolean) => void;
  isDeleting?: boolean;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  isSelected,
  onSelect,
  onDelete,
  isBulkSelected,
  onBulkSelectChange,
  isDeleting,
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      } ${isBulkSelected ? "bg-muted/50" : ""} ${isDeleting ? "opacity-50" : ""}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isBulkSelected}
              onCheckedChange={onBulkSelectChange}
              onClick={(e) => e.stopPropagation()}
              disabled={isDeleting}
              className="w-5 h-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <MessageSquare className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">
              {session.name || "Untitled Session"}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
        <CardDescription>
          Created {new Date(session.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent
        onClick={onSelect}
        className="cursor-pointer"
      >
        <div className="space-y-1 text-sm text-muted-foreground">
          {session.messages && session.messages.total > 0 && (
            <p>{session.messages.total} messages</p>
          )}
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
  const { sessions, sessionsLoading, fetchSessions, deleteSession } =
    useChatStore();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (configId) {
      fetchSessions(configId);
    }
  }, [configId, fetchSessions]);

  const handleDelete = async (id: string) => {
    setSingleDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleSingleDelete = async () => {
    if (!singleDeleteId) return;
    
    setIsDeleting(true);
    setDeletingSessionId(singleDeleteId);
    
    try {
      await deleteSession(singleDeleteId);
      // Remove from selected sessions if it was selected
      setSelectedSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(singleDeleteId);
        return newSet;
      });
      handleDeleteDialogClose();
    } catch (error) {
      console.error("Failed to delete session:", error);
    } finally {
      setIsDeleting(false);
      setDeletingSessionId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSessions.size === 0) return;
    
    setIsDeleting(true);
    
    try {
      // Delete all selected sessions
      const deletePromises = Array.from(selectedSessions).map(id => 
        deleteSession(id)
      );
      await Promise.all(deletePromises);
      
      toast.success(`Deleted ${selectedSessions.size} session(s)`);
      setSelectedSessions(new Set());
      handleDeleteDialogClose();
    } catch (error) {
      toast.error("Failed to delete some sessions");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteDialogClose = () => {
    setDeleteConfirmOpen(false);
    setSingleDeleteId(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allSessionIds = new Set(filteredSessions.map(s => s.id));
      setSelectedSessions(allSessionIds);
    } else {
      setSelectedSessions(new Set());
    }
  };

  const handleSessionSelectChange = (sessionId: string, checked: boolean) => {
    setSelectedSessions(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(sessionId);
      } else {
        newSet.delete(sessionId);
      }
      return newSet;
    });
  };

  const filteredSessions = sessions.filter(
    (s) => s.chat_config_id === configId
  );

  if (sessionsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Chat Sessions</h3>
          {filteredSessions.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedSessions.size === filteredSessions.length && filteredSessions.length > 0}
                onCheckedChange={handleSelectAll}
                id="select-all-sessions"
                className="w-5 h-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="select-all-sessions" className="text-sm text-muted-foreground">
                Select All ({selectedSessions.size}/{filteredSessions.length})
              </Label>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedSessions.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedSessions.size})
            </Button>
          )}
          <Button onClick={() => setCreateDialogOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No sessions</h3>
          <p className="text-muted-foreground mb-4">
            Create your first chat session to start chatting
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
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
              onSelect={() => onSessionSelect(session)}
              onDelete={() => handleDelete(session.id)}
              isBulkSelected={selectedSessions.has(session.id)}
              onBulkSelectChange={(checked) => handleSessionSelectChange(session.id, checked)}
              isDeleting={deletingSessionId === session.id || (selectedSessions.has(session.id) && isDeleting)}
            />
          ))}
        </div>
      )}

      <CreateSessionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        configId={configId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={handleDeleteDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {singleDeleteId ? "Delete Session?" : "Delete Selected Sessions?"}
            </DialogTitle>
            <DialogDescription>
              {singleDeleteId 
                ? "Are you sure you want to delete this session? This action cannot be undone."
                : `Are you sure you want to delete ${selectedSessions.size} selected session(s)? This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteDialogClose}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={singleDeleteId ? handleSingleDelete : handleBulkDelete}
            >
              {singleDeleteId ? "Delete Session" : `Delete ${selectedSessions.size} Session(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
