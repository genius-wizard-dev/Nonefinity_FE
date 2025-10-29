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
import { MessageSquare, Plus, Trash2 } from "lucide-react";
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
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  isSelected,
  onSelect,
  onDelete,
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
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
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Created {new Date(session.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
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

  useEffect(() => {
    if (configId) {
      fetchSessions(configId);
    }
  }, [configId, fetchSessions]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this session?")) {
      await deleteSession(id);
    }
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
        <h3 className="text-lg font-semibold">Chat Sessions</h3>
        <Button onClick={() => setCreateDialogOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Session
        </Button>
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
            />
          ))}
        </div>
      )}

      <CreateSessionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        configId={configId}
      />
    </>
  );
};
