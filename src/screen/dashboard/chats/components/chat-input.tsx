import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { KeyboardEvent, useState } from "react";
import { useChatStore } from "../store";

interface ChatInputProps {
  chatId: string;
}

export function ChatInput({ chatId }: ChatInputProps) {
  const { sendMessage, isSendingMessage } = useChatStore();
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!message.trim() || isSendingMessage) return;

    const messageContent = message.trim();
    setMessage("");

    try {
      await sendMessage(chatId, messageContent);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore message on error
      setMessage(messageContent);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      <div className="flex items-end gap-3 p-4 bg-card border rounded-xl shadow-sm">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="min-h-[52px] max-h-[120px] resize-none border-0 bg-transparent p-3 text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
            disabled={isSendingMessage}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground/50">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim() || isSendingMessage}
          size="icon"
          className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg"
        >
          {isSendingMessage ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
