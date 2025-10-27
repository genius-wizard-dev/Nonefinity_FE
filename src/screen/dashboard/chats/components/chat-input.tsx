import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { type KeyboardEvent, useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isStreaming?: boolean;
}

export function ChatInput({
  onSendMessage,
  isStreaming = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!message.trim() || isStreaming) return;

    const messageContent = message.trim();
    setMessage("");

    try {
      await onSendMessage(messageContent);
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
      <div className="flex items-end gap-3 p-3 bg-background border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent p-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            disabled={isStreaming}
          />
          <div className="absolute bottom-1 right-1 text-xs text-muted-foreground/40">
            Enter to send
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim() || isStreaming}
          size="icon"
          className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
