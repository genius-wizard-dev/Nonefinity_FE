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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Database,
  MessageSquare,
  MoreVertical,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { ChatService } from "../services";
import { useChatStore } from "../store";
import type { Chat } from "../type";
import ChatSettingsDialog from "./chat-settings-dialog";

interface ChatHeaderProps {
  chat: Chat;
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  const { deleteChat, clearMessages, isUpdating } = useChatStore();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const chatType = ChatService.getChatType(chat);

  const getChatTypeIcon = () => {
    switch (chatType) {
      case "ai_only":
        return <MessageSquare className="w-4 h-4" />;
      case "knowledge_base":
        return <BookOpen className="w-4 h-4" />;
      case "dataset":
        return <Database className="w-4 h-4" />;
      case "full_featured":
        return <Zap className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getChatTypeLabel = () => {
    switch (chatType) {
      case "ai_only":
        return "AI Only";
      case "knowledge_base":
        return "Knowledge Base";
      case "dataset":
        return "Dataset";
      case "full_featured":
        return "Full Featured";
      default:
        return "Unknown";
    }
  };

  const getChatTypeVariant = () => {
    switch (chatType) {
      case "ai_only":
        return "secondary";
      case "knowledge_base":
        return "default";
      case "dataset":
        return "outline";
      case "full_featured":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleClearHistory = async () => {
    await clearMessages(chat.id);
    setClearDialogOpen(false);
  };

  return (
    <>
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {getChatTypeIcon()}
            </div>
            <div>
              <h1 className="text-lg font-semibold">{chat.name}</h1>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    chatType === "full_featured"
                      ? "outline"
                      : getChatTypeVariant()
                  }
                  className={`text-xs ${
                    chatType === "full_featured"
                      ? "bg-black text-white border-black hover:bg-black/80"
                      : ""
                  }`}
                >
                  {getChatTypeLabel()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {chat.message_count || 0} messages
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ChatSettingsDialog chat={chat} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setClearDialogOpen(true)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Clear History Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this chat. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUpdating ? "Clearing..." : "Clear History"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
