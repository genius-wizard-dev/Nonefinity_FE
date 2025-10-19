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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BookOpen,
  Database,
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { ChatService } from "../services";
import { useChatStore } from "../store";
import type { Chat } from "../type";
import ChatSettingsDialog from "./chat-settings-dialog";

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}

export function ChatItem({ chat, isSelected, onClick }: ChatItemProps) {
  const chatType = ChatService.getChatType(chat);
  const { deleteChat } = useChatStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleDelete = async () => {
    await deleteChat(chat.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="group relative mb-1">
      <Button
        variant={isSelected ? "secondary" : "ghost"}
        className={`w-full justify-start h-auto p-3 ${
          isSelected ? "bg-accent" : "hover:bg-accent/50"
        }`}
        onClick={onClick}
      >
        <div className="flex flex-col items-start w-full">
          <div className="flex items-center gap-2 min-w-0 flex-1 mb-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-shrink-0">{getChatTypeIcon()}</div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getChatTypeLabel()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-sm font-medium truncate">{chat.name}</span>
          </div>

          <div className="text-xs text-muted-foreground">
            <span>
              {chat.message_count
                ? `${chat.message_count} messages`
                : "No messages"}
            </span>
          </div>
        </div>
      </Button>

      {/* 3-dot menu - always visible */}
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:scale-110 transition-transform"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Dialog */}
      <ChatSettingsDialog
        chat={chat}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{chat.name}"? This action cannot
              be undone. All messages in this chat will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
