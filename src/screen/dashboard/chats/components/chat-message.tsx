import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Bot, User } from "lucide-react";
import type { ChatMessage } from "../type";

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isSystem = message.role === "system";

  const getRoleIcon = () => {
    if (isUser) return <User className="w-4 h-4" />;
    if (isAssistant) return <Bot className="w-4 h-4" />;
    return <Bot className="w-4 h-4" />;
  };

  const getRoleLabel = () => {
    if (isUser) return "You";
    if (isAssistant) return "Assistant";
    if (isSystem) return "System";
    return "Unknown";
  };

  const getRoleVariant = () => {
    if (isUser) return "default";
    if (isAssistant) return "secondary";
    if (isSystem) return "outline";
    return "secondary";
  };

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getRoleIcon()}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`flex flex-col max-w-[80%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={getRoleVariant()} className="text-xs">
            {getRoleLabel()}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.created_at), "HH:mm")}
          </span>
        </div>

        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : isSystem
              ? "bg-muted text-muted-foreground"
              : "bg-muted"
          }`}
        >
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        </div>
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getRoleIcon()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
