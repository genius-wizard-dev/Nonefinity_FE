import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { useEffect, useRef } from "react";
import { useChatStore } from "../store";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";

export default function ChatMain() {
  const {
    currentChat,
    messages,
    isLoadingMessages,
    isSendingMessage,
    getMessages,
  } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages when chat changes
  useEffect(() => {
    if (currentChat) {
      getMessages(currentChat.id);
    }
  }, [currentChat?.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages?.length, isSendingMessage]);

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4 px-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">No chat selected</h3>
            <p className="text-muted-foreground max-w-sm">
              Select a chat from the sidebar or create a new one to get started
              with your AI assistant.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <ChatHeader chat={currentChat} />

      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 max-w-4xl mx-auto">
          {isLoadingMessages ? (
            // Loading skeleton
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    i % 2 === 0 ? "justify-start" : "justify-end"
                  }`}
                >
                  <div className="flex flex-col space-y-2 max-w-[80%]">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton
                      className={`h-16 ${i % 2 === 0 ? "w-80" : "w-60"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : !messages || messages.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Start a conversation
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Send a message to begin chatting with {currentChat.name}. Your
                AI assistant is ready to help!
              </p>
            </div>
          ) : (
            // Messages
            <>
              {messages?.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </>
          )}

          {/* Typing indicator */}
          {isSendingMessage && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="border-t bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <ChatInput chatId={currentChat.id} />
        </div>
      </div>
    </div>
  );
}
