import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useChatStreaming } from "../hooks/useChatStreaming";
import { useChatStore } from "../store";
import type { ChatMessage as ChatMessageType } from "../type";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";

export default function ChatMain() {
  const { currentChat, messages, isLoadingMessages, getMessages } =
    useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get token from Clerk
  const getToken = async () => {
    if (typeof window !== "undefined") {
      const clerk = (window as any).Clerk;
      return await clerk?.session?.getToken?.();
    }
    return "";
  };

  // Initialize streaming hook
  const [token, setToken] = React.useState("");

  React.useEffect(() => {
    getToken().then(setToken);
  }, []);

  const {
    streamingMessages,
    isStreaming,
    pendingApproval,
    startStreaming,
    handleApproval,
    clearStreamingMessages,
    cleanup,
  } = useChatStreaming({
    chatId: currentChat?.id || "",
    token,
    onError: (error) => {
      console.error("Streaming error:", error);
    },
  });

  // Load messages when chat changes
  useEffect(() => {
    if (currentChat) {
      getMessages(currentChat.id);
      clearStreamingMessages();
    }
  }, [currentChat?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Detect user scrolling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom =
        Math.abs(scrollHeight - scrollTop - clientHeight) < 100;

      // User is scrolling if not at bottom
      isUserScrollingRef.current = !isAtBottom;

      // Clear any pending auto-scroll
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Reset user scrolling flag after 2 seconds
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 2000);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive (only if user not scrolling)
  useEffect(() => {
    if (isUserScrollingRef.current) return;

    if (scrollRef.current) {
      // Use smooth scroll for better UX
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages?.length, streamingMessages.length]);

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
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Chat Header */}
      <ChatHeader chat={currentChat} />

      {/* Messages Area - Fixed height with scroll */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="p-4 space-y-4 max-w-4xl mx-auto min-h-full flex flex-col">
          {isLoadingMessages ? (
            // Loading skeleton
            <div className="space-y-4 flex-1">
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
          ) : (
            <>
              {/* Empty state - only show if no messages AND no streaming */}
              {(!messages || messages.length === 0) &&
                streamingMessages.length === 0 && (
                  <div className="text-center py-12 flex-1 flex items-center justify-center">
                    <div>
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <MessageSquare className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Start a conversation
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Send a message to begin chatting with {currentChat.name}
                        . Your AI assistant is ready to help!
                      </p>
                    </div>
                  </div>
                )}

              {/* Messages container with flex-1 to push to bottom */}
              <div className="flex-1" />

              {/* History messages */}
              {messages?.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onApprove={handleApproval}
                />
              ))}

              {/* Streaming messages */}
              {streamingMessages.map((msg, idx) => {
                const displayMessage: ChatMessageType = {
                  id: msg.tempId || `streaming-${idx}`,
                  chat_id: currentChat.id,
                  role: msg.role,
                  content: msg.content,
                  message_order: (messages?.length || 0) + idx,
                  message_type: msg.message_type,
                  metadata: msg.metadata,
                  parent_message_id: msg.parent_message_id || null,
                  created_at: new Date().toISOString(),
                };

                return (
                  <ChatMessage
                    key={displayMessage.id}
                    message={displayMessage}
                    onApprove={handleApproval}
                  />
                );
              })}

              {/* Typing indicator */}
              {isStreaming &&
                !pendingApproval &&
                streamingMessages.length === 0 && (
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
            </>
          )}

          {/* Scroll anchor */}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Chat Input - Fixed at bottom */}
      <div className="border-t bg-background p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={async (message) => {
              await startStreaming(message);
              // Reload messages after streaming completes
              setTimeout(() => {
                getMessages(currentChat.id);
                clearStreamingMessages();
              }, 500);
            }}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
