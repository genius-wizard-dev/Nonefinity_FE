import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@clerk/clerk-react";
import { Brain, MessageSquare } from "lucide-react";
import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
  useChatStreamingStore,
  useIsStreaming,
  useIsThinking,
  useStreamingError,
  useStreamingMessage,
  useToolContent,
} from "../chat-streaming-store";
import { ChatService } from "../services";
import { useChatStore } from "../store";
import type { ChatMessage } from "../types";
import { ChatInput } from "./chat-input";
import { OptimizedToolDisplay } from "./optimized-tool-display";

interface ChatInterfaceProps {
  sessionId: string;
}

// ============================================================================
// Memoized Message Components
// ============================================================================

interface UserMessageProps {
  content: string;
  userImageUrl?: string;
  userName?: string;
}

const UserMessage = memo<UserMessageProps>(
  ({ content, userImageUrl, userName }) => (
    <Message from="user">
      <MessageAvatar
        src={userImageUrl || ""}
        name={userName?.charAt(0) || "Y"}
      />
      <MessageContent variant="contained">
        <Response>{content}</Response>
      </MessageContent>
    </Message>
  )
);
UserMessage.displayName = "UserMessage";

// ============================================================================
// Tool Display with Lazy Content Loading
// ============================================================================

interface ToolDisplayProps {
  tool: {
    id: string;
    name: string;
    args: Record<string, unknown>;
    state:
      | "input-streaming"
      | "input-available"
      | "output-available"
      | "output-error";
    content?: unknown;
    contentRef?: string;
  };
  messageId?: string;
  isFromHistory?: boolean;
}

const ToolDisplay = memo<ToolDisplayProps>(({ tool, isFromHistory }) => {
  // For history messages, content is inline
  // For streaming messages, content is in the separate store
  const storedContent = useToolContent(tool.contentRef);
  const content = isFromHistory ? tool.content : storedContent;

  return (
    <OptimizedToolDisplay
      toolId={tool.id}
      toolName={tool.name}
      toolArgs={tool.args}
      state={tool.state}
      staticContent={content}
      contentRef={tool.contentRef}
      defaultCollapsed={true} // Always collapsed by default
    />
  );
});
ToolDisplay.displayName = "ToolDisplay";

// ============================================================================
// Assistant Message Component
// ============================================================================

interface AssistantMessageProps {
  content: string;
  tools?: Array<{
    id: string;
    name: string;
    args: Record<string, unknown>;
    state:
      | "input-streaming"
      | "input-available"
      | "output-available"
      | "output-error";
    content?: unknown;
    contentRef?: string;
  }>;
  messageId?: string;
  isStreaming?: boolean;
  isThinking?: boolean;
  isFromHistory?: boolean;
}

const AssistantMessage = memo<AssistantMessageProps>(
  ({
    content,
    tools,
    messageId,
    isStreaming = false,
    isThinking = false,
    isFromHistory = false,
  }) => {
    const hasTools = tools && tools.length > 0;
    const hasContent = content && content.length > 0;

    // Check if all tools are completed
    const allToolsCompleted =
      hasTools &&
      tools.every(
        (t) => t.state === "output-available" || t.state === "output-error"
      );

    // Show generating when tools are done but no content yet
    const isGenerating =
      isStreaming &&
      hasTools &&
      allToolsCompleted &&
      !hasContent &&
      !isThinking;

    return (
      <Message from="assistant">
        <Avatar className="size-8 ring-1 ring-border bg-primary/10 flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary" />
        </Avatar>
        <MessageContent variant="contained">
          {/* Tools Section */}
          {hasTools && (
            <div className="space-y-2 mb-3">
              {tools.map((tool) => (
                <ToolDisplay
                  key={tool.id}
                  tool={tool}
                  messageId={messageId}
                  isFromHistory={isFromHistory}
                />
              ))}
            </div>
          )}

          {/* Content Section - with smooth transition */}
          {hasContent && (
            <div className="inline-flex items-baseline gap-0.5 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
              <Response>{content}</Response>
              {isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-primary animate-pulse" />
              )}
            </div>
          )}

          {/* Generating State - after tools complete but before AI responds */}
          {isGenerating && (
            <div className="flex items-center gap-2 py-2 animate-in fade-in-0 duration-200">
              <div className="flex gap-1">
                <div
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <Shimmer
                as="span"
                className="text-sm text-muted-foreground"
                duration={2}
                spread={2}
              >
                Generating response...
              </Shimmer>
            </div>
          )}

          {/* Thinking State - initial state before any tools or content */}
          {isStreaming && !hasContent && !hasTools && isThinking && (
            <div className="flex items-center gap-2 py-1.5">
              <Shimmer
                as="span"
                className="text-sm font-medium"
                duration={2}
                spread={2}
              >
                Thinking
              </Shimmer>
            </div>
          )}

          {/* Loading dots when no content, no tools, and not thinking */}
          {isStreaming && !hasContent && !hasTools && !isThinking && (
            <div className="flex items-center gap-2 py-1">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}
        </MessageContent>
      </Message>
    );
  }
);
AssistantMessage.displayName = "AssistantMessage";

// ============================================================================
// Streaming Message Component (separate to isolate re-renders)
// ============================================================================

const StreamingMessageDisplay: React.FC = memo(() => {
  const streamingMessage = useStreamingMessage();
  const isStreaming = useIsStreaming();
  const isThinking = useIsThinking();

  if (!isStreaming || !streamingMessage) return null;

  return (
    <AssistantMessage
      content={streamingMessage.content}
      tools={streamingMessage.tools}
      messageId={streamingMessage.id}
      isStreaming={true}
      isThinking={isThinking}
      isFromHistory={false}
    />
  );
});
StreamingMessageDisplay.displayName = "StreamingMessageDisplay";

// ============================================================================
// Main Chat Content Component
// ============================================================================

const ChatInterfaceContent: React.FC<{ sessionId: string }> = ({
  sessionId,
}) => {
  const { user } = useUser();
  const { messages, messagesLoading, fetchSessionMessages, addMessage } =
    useChatStore();

  // Use streaming store
  const isStreaming = useIsStreaming();
  const errorMessage = useStreamingError();
  const {
    startStreaming,
    ensureStreaming,
    stopStreaming,
    setThinking,
    setError,
    appendContent,
    setContent,
    addTool,
    setToolContent,
    reset: resetStreaming,
  } = useChatStreamingStore();

  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages on session change
  useEffect(() => {
    if (sessionId) {
      fetchSessionMessages(sessionId);
    }
  }, [sessionId, fetchSessionMessages]);

  // Convert store messages to display format
  const conversationMessages = useMemo(() => {
    return messages.map((msg) => ({
      role: msg.role as "user" | "assistant" | "system" | "tool",
      content: msg.content,
      id: msg.id,
      tools:
        msg.tools?.map((t, idx) => ({
          id: `${t.name}-${idx}-${msg.id}`,
          name: t.name,
          args: (t.arguments as Record<string, unknown>) || {},
          state: "output-available" as const,
          content: t.result,
        })) || [],
    }));
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages, isStreaming]);

  // Handle sending message
  const handleSend = useCallback(
    async (inputText: string) => {
      if (!inputText.trim() || isStreaming) return;

      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        session_id: sessionId,
        owner_id: "",
        role: "user",
        content: inputText,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      addMessage(userMessage);
      startStreaming();

      let accumulatedContent = "";
      const accumulatedTools: Array<{
        id: string;
        name: string;
        arguments?: Record<string, unknown>;
        result?: unknown;
      }> = [];

      const messagesToSave: Array<{
        role: string;
        content: string;
        tools?: Array<{
          name: string;
          arguments?: Record<string, unknown>;
          result?: unknown;
        }>;
      }> = [
        {
          role: "user",
          content: userMessage.content,
        },
      ];

      try {
        await ChatService.streamMessage(sessionId, inputText, (event) => {
          const parseMaybeJSON = (v: unknown) => {
            if (typeof v !== "string") return v;
            try {
              return JSON.parse(v);
            } catch {
              return v;
            }
          };

          if (event.event === "error") {
            const errorMsg =
              (event.data as { message?: string })?.message ||
              "An error occurred";
            setError(errorMsg);
            return;
          }

          if (event.event === "start") {
            // Use ensureStreaming to avoid resetting tools if already streaming
            ensureStreaming();
            return;
          }

          if (event.event === "tool_calls") {
            const payload = parseMaybeJSON(event.data) as {
              id?: string;
              name?: string;
              arguments?: Record<string, unknown>;
            };
            const toolName = payload?.name || "unknown";
            const args = payload?.arguments || {};
            const incomingId = payload?.id || `${toolName}-${Date.now()}`;

            setThinking(false);
            addTool({
              id: incomingId,
              name: toolName,
              args,
              state: "input-available",
            });

            // Track for saving
            const existingIdx = accumulatedTools.findIndex(
              (t) => t.id === incomingId
            );
            if (existingIdx >= 0) {
              accumulatedTools[existingIdx] = {
                ...accumulatedTools[existingIdx],
                arguments: args,
              };
            } else {
              accumulatedTools.push({
                id: incomingId,
                name: toolName,
                arguments: args,
              });
            }
          } else if (
            event.event === "tool_result" ||
            event.event === "tool_results"
          ) {
            const payload = parseMaybeJSON(event.data) as {
              id?: string;
              name?: string;
              result?: unknown;
              content?: unknown;
            };
            const toolName = payload?.name || "unknown";
            const toolContent = payload?.result ?? payload?.content ?? "";
            const incomingId = payload?.id;

            setToolContent(
              incomingId || `${toolName}-${Date.now()}`,
              toolContent
            );

            // Update accumulated tools
            const revIdx = accumulatedTools
              .slice()
              .reverse()
              .findIndex((t) =>
                incomingId ? t.id === incomingId : t.name === toolName
              );
            const idx = revIdx >= 0 ? accumulatedTools.length - 1 - revIdx : -1;
            if (idx >= 0) {
              accumulatedTools[idx] = {
                ...accumulatedTools[idx],
                result: toolContent,
              };
            } else {
              accumulatedTools.push({
                id: incomingId || `${toolName}-${Date.now()}`,
                name: toolName,
                result: toolContent,
              });
            }
          } else if (event.event === "ai_result") {
            const payload = parseMaybeJSON(event.data) as {
              content?: string;
              is_delta?: boolean;
            };
            const content = payload?.content || "";
            const isDelta = payload?.is_delta === true;

            if (content) {
              setThinking(false);
              if (isDelta) {
                accumulatedContent += content;
                appendContent(content);
              } else {
                accumulatedContent = content;
                setContent(content);
              }
            }
          }

          if (
            (event.data as { done?: boolean })?.done === true ||
            event.data === "[DONE]"
          ) {
            stopStreaming();
          }
        });

        // Save conversation
        if (accumulatedContent) {
          const finalContent =
            typeof accumulatedContent === "string"
              ? accumulatedContent
              : JSON.stringify(accumulatedContent);

          messagesToSave.push({
            role: "assistant",
            content: finalContent,
            tools: accumulatedTools.map((t) => ({
              name: t.name,
              arguments: t.arguments,
              result: t.result,
            })),
          });

          const assistantMessage: ChatMessage = {
            id: `temp-assistant-${Date.now()}`,
            session_id: sessionId,
            owner_id: "",
            role: "assistant",
            content: finalContent,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          addMessage(assistantMessage);
          await ChatService.saveConversation(sessionId, messagesToSave);
        }
      } catch (error) {
        console.error("Failed to stream message:", error);
        setError(
          error instanceof Error ? error.message : "Failed to send message"
        );
      } finally {
        resetStreaming();
        await fetchSessionMessages(sessionId);
      }
    },
    [
      sessionId,
      isStreaming,
      addMessage,
      startStreaming,
      ensureStreaming,
      stopStreaming,
      setThinking,
      setError,
      appendContent,
      setContent,
      addTool,
      setToolContent,
      resetStreaming,
      fetchSessionMessages,
    ]
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Conversation className="h-full">
          <ConversationContent>
            {messagesLoading && conversationMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader size={24} />
                <span className="ml-2 text-muted-foreground">
                  Loading messages...
                </span>
              </div>
            ) : conversationMessages.length === 0 && !isStreaming ? (
              <ConversationEmptyState
                title="No messages yet"
                description="Start a conversation by typing a message below"
                icon={<MessageSquare className="w-12 h-12" />}
              />
            ) : (
              <>
                {/* History Messages */}
                {conversationMessages.map((msg, idx) =>
                  msg.role === "user" ? (
                    <UserMessage
                      key={msg.id || idx}
                      content={msg.content}
                      userImageUrl={user?.imageUrl}
                      userName={user?.fullName || undefined}
                    />
                  ) : (
                    <AssistantMessage
                      key={msg.id || idx}
                      content={msg.content}
                      tools={msg.tools}
                      messageId={msg.id}
                      isStreaming={false}
                      isThinking={false}
                      isFromHistory={true}
                    />
                  )
                )}

                {/* Streaming Message */}
                <StreamingMessageDisplay />

                <div ref={conversationEndRef} />
              </>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm border-t flex-shrink-0">
          {errorMessage}
        </div>
      )}

      {/* Input Area - Modern Design */}
      <div className="flex-shrink-0 border-t bg-gradient-to-t from-background via-background to-transparent">
        <div className="p-4 pb-6">
          <ChatInput
            onSend={handleSend}
            isStreaming={isStreaming}
            placeholder="Type your message..."
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Export
// ============================================================================

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId }) => {
  return <ChatInterfaceContent sessionId={sessionId} />;
};
