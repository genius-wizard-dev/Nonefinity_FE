import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatStreaming } from "../hooks/useChatStreaming";
import { ChatService } from "../services";
import type { ChatMessage } from "../type";
import { ChatMessageItem } from "./ChatMessageItem";

interface ChatInterfaceProps {
  chatId: string;
  token: string;
}

export function ChatInterface({ chatId, token }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    streamingMessages,
    isStreaming,
    pendingApproval,
    startStreaming,
    handleApproval,
    clearStreamingMessages,
    cleanup,
  } = useChatStreaming({
    chatId,
    token,
    onError: (error) => {
      console.error("Chat streaming error:", error);
      // You can show a toast notification here
    },
  });

  // Load message history
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoadingHistory(true);
        const response = await ChatService.getMessages(chatId, 0, 100);
        if (response && Array.isArray(response.data)) {
          setMessages(response.data);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadMessages();
  }, [chatId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, streamingMessages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return;

    const message = inputValue.trim();
    setInputValue("");

    // Start streaming
    await startStreaming(message);

    // Reload messages after stream completes
    setTimeout(async () => {
      try {
        const response = await ChatService.getMessages(chatId, 0, 100);
        if (response && Array.isArray(response.data)) {
          setMessages(response.data);
          clearStreamingMessages();
        }
      } catch (error) {
        console.error("Error reloading messages:", error);
      }
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Combine history messages with streaming messages
  const allMessages = [
    ...messages,
    ...streamingMessages.map((msg, idx) => ({
      id: msg.tempId || `streaming-${idx}`,
      chat_id: chatId,
      role: msg.role,
      content: msg.content,
      message_order: messages.length + idx,
      message_type: msg.message_type,
      metadata: msg.metadata,
      parent_message_id: msg.parent_message_id || null,
      created_at: new Date().toISOString(),
    })),
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {allMessages.map((message) => (
              <ChatMessageItem
                key={message.id}
                message={message}
                onApprove={(messageId, decision, editedArgs) => {
                  handleApproval(decision, editedArgs);
                }}
              />
            ))}

            {isStreaming && !pendingApproval && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <Card className="p-4 border-t rounded-none">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isStreaming}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isStreaming}
            size="icon"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
