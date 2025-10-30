"use client";

import { CodeBlock } from "@/components/ai-elements/code-block";
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
import {
  PromptInput,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import { Tool, ToolContent, ToolHeader } from "@/components/ai-elements/tool";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Database, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatService } from "../services";
import { useChatStore } from "../store";
import type { ChatMessage } from "../types";

interface ChatInterfaceProps {
  sessionId: string;
}

interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  content?: string; // Tool result content when available
}

interface StreamingState {
  content: string;
  tools: Map<string, ToolCall>;
}

// Component to render tool results in a beautiful, professional format
const ToolResultDisplay: React.FC<{ content: any }> = ({ content }) => {
  // If content is an array
  if (Array.isArray(content)) {
    // If array contains objects with a single key (like [{"name": "table1"}])
    if (
      content.length > 0 &&
      typeof content[0] === "object" &&
      !Array.isArray(content[0])
    ) {
      const keys = Object.keys(content[0]);
      if (keys.length === 1) {
        const key = keys[0];
        return (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Results ({content.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {content.map((item, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="gap-1.5 px-3 py-1.5 text-sm font-medium border border-border/50 bg-secondary/80 hover:bg-secondary transition-colors"
                >
                  <Database className="size-3.5 text-primary" />
                  <span className="font-mono text-xs">{String(item[key])}</span>
                </Badge>
              ))}
            </div>
          </div>
        );
      }
    }
    // If array contains strings
    if (content.every((item) => typeof item === "string")) {
      return (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Results ({content.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {content.map((item, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="gap-1.5 px-3 py-1.5 text-sm font-medium border border-border/50 bg-secondary/80 hover:bg-secondary transition-colors"
              >
                <CheckCircle2 className="size-3.5 text-green-600" />
                {item}
              </Badge>
            ))}
          </div>
        </div>
      );
    }
    // For complex arrays, use code block
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Results ({content.length} items)
        </div>
        <CodeBlock code={JSON.stringify(content, null, 2)} language="json" />
      </div>
    );
  }

  // If content is an object
  if (
    typeof content === "object" &&
    content !== null &&
    !Array.isArray(content)
  ) {
    const entries = Object.entries(content);
    // If object has few simple key-value pairs, display as list
    if (
      entries.length <= 5 &&
      entries.every(([, v]) => typeof v !== "object" || v === null)
    ) {
      return (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Details
          </div>
          <div className="space-y-2.5">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="flex items-start gap-3 text-sm border-l-2 border-primary/20 pl-3 py-1"
              >
                <span className="font-semibold text-foreground min-w-[100px]">
                  {key}:
                </span>
                <Badge
                  variant="outline"
                  className="font-normal bg-muted/50 border-border/50"
                >
                  {String(value)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      );
    }
    // For complex objects, use code block
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Data
        </div>
        <CodeBlock code={JSON.stringify(content, null, 2)} language="json" />
      </div>
    );
  }

  // If content is a string
  if (typeof content === "string") {
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(content);
      return <ToolResultDisplay content={parsed} />;
    } catch {
      // If not JSON, display as plain text or code block if it looks like code
      if (content.includes("\n") || content.length > 100) {
        return (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Output
            </div>
            <CodeBlock code={content} language="text" />
          </div>
        );
      }
      return (
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border border-border/50 text-sm text-foreground">
          {content}
        </div>
      );
    }
  }

  // Default: convert to string and display
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border border-border/50 text-sm text-foreground">
      {String(content)}
    </div>
  );
};

const ChatInterfaceContent: React.FC<{ sessionId: string }> = ({
  sessionId,
}) => {
  const {
    messages,
    messagesLoading,
    fetchSessionMessages,
    addMessage,
    selectedSession,
  } = useChatStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingState, setStreamingState] = useState<StreamingState>({
    content: "",
    tools: new Map(),
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<
    Array<{
      role: "user" | "assistant" | "system" | "tool";
      content: string;
      id?: string;
      tools?: ToolCall[];
    }>
  >([]);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionId) {
      fetchSessionMessages(sessionId);
    }
  }, [sessionId, fetchSessionMessages]);

  useEffect(() => {
    // Convert messages to conversation format
    const convMessages = messages.map((msg) => ({
      role: msg.role as "user" | "assistant" | "system" | "tool",
      content: msg.content,
      id: msg.id,
    }));
    setConversationMessages(convMessages);
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages, streamingState]);

  const handleSend = async (message: { text?: string; files?: any[] }) => {
    const inputText = message.text || "";
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
    setIsStreaming(true);
    setStreamingState({
      content: "",
      tools: new Map(),
    });

    const assistantMessageId = `temp-assistant-${Date.now()}`;
    let accumulatedContent = "";
    const messagesToSave: Array<{
      role: string;
      content: string;
      models?: Record<string, any>;
      tools?: Record<string, any>;
      interrupt?: Record<string, any>;
    }> = [
      {
        role: "user",
        content: userMessage.content,
      },
    ];

    setErrorMessage(null);
    try {
      await ChatService.streamMessage(sessionId, inputText, (event) => {
        if (event.event === "error") {
          console.error("Stream error:", event.data);
          const errorMsg = event.data?.message || "An error occurred";
          setErrorMessage(errorMsg);
          setIsStreaming(false);
          return;
        }

        if (event.event === "start") {
          // Chat started - reset streaming state
          setStreamingState({
            content: "",
            tools: new Map(),
          });
          setIsStreaming(true);
          return;
        }

        // Support legacy event names (tool_calls, tool_result, ai_result)
        if (event.event === "tool_calls") {
          // Backend sends a single tool call with { type, name, arguments }
          const toolName = event.data?.name || "unknown";
          const args = event.data?.arguments || {};
          const incomingId = event.data?.id || `${toolName}-${Date.now()}`;

          setStreamingState((prev) => {
            const newTools = new Map(prev.tools);
            if (!newTools.has(incomingId)) {
              newTools.set(incomingId, {
                id: incomingId,
                name: toolName,
                args,
                state: "input-available",
                content: undefined,
              });
            }
            return { ...prev, tools: newTools };
          });
        } else if (
          event.event === "tool_result" ||
          event.event === "tool_results"
        ) {
          // Handle tool result - tool has finished and returned result
          const toolName = event.data?.name || "unknown";
          const toolContent = event.data?.result ?? event.data?.content ?? "";
          const incomingId = event.data?.id as string | undefined;

          setStreamingState((prev) => {
            const newTools = new Map(prev.tools);

            // Prefer matching by incoming id, else by name with pending state
            let toolId =
              incomingId && newTools.has(incomingId) ? incomingId : "";
            if (!toolId) {
              for (const [id, tool] of newTools.entries()) {
                if (
                  tool.name === toolName &&
                  tool.state === "input-available"
                ) {
                  toolId = id;
                  break;
                }
              }
            }
            if (!toolId) toolId = `${toolName}-${Date.now()}`;

            // Parse tool content if it's JSON
            let parsedContent = toolContent;
            if (typeof toolContent === "string") {
              try {
                parsedContent = JSON.parse(toolContent);
              } catch {
                parsedContent = toolContent;
              }
            }

            // Update tool with result
            const existingTool = newTools.get(toolId);
            newTools.set(toolId, {
              id: toolId,
              name: toolName,
              args: existingTool?.args || {},
              content: parsedContent,
              state: "output-available", // Tool has completed
            });

            return {
              ...prev,
              tools: newTools,
            };
          });
          // Record tool message to save later
          const contentToSave =
            typeof toolContent === "string"
              ? toolContent
              : JSON.stringify(toolContent);
          messagesToSave.push({
            role: "tool",
            content: contentToSave,
            tools: { name: toolName },
          });
        } else if (event.event === "ai_result") {
          const content = event.data?.content || "";
          const isDelta = event.data?.is_delta === true;

          if (content) {
            // If it's a delta, append to accumulated content
            // Otherwise, use the full content
            if (isDelta) {
              accumulatedContent += content;
            } else {
              accumulatedContent = content;
            }

            setStreamingState((prev) => ({
              ...prev,
              content: accumulatedContent,
            }));
          }
        }

        // New unified backend format: event: "message" with data.type
        if (event.event === "message") {
          const data = event.data;
          const type = data?.type;

          if (type === "tool_call") {
            const toolName = data?.name || "unknown";
            const args = data?.arguments || {};
            const incomingId = data?.id || `${toolName}-${Date.now()}`;

            setStreamingState((prev) => {
              const newTools = new Map(prev.tools);
              if (!newTools.has(incomingId)) {
                newTools.set(incomingId, {
                  id: incomingId,
                  name: toolName,
                  args,
                  state: "input-available",
                  content: undefined,
                });
              }
              return { ...prev, tools: newTools };
            });
          } else if (type === "tool_result") {
            const toolName = data?.name || "unknown";
            const toolContent = data?.result ?? data?.content ?? "";
            const incomingId = data?.id as string | undefined;

            setStreamingState((prev) => {
              const newTools = new Map(prev.tools);

              // Prefer matching by incoming id, else by name with pending state
              let toolId =
                incomingId && newTools.has(incomingId) ? incomingId : "";
              if (!toolId) {
                for (const [id, tool] of newTools.entries()) {
                  if (
                    tool.name === toolName &&
                    tool.state === "input-available"
                  ) {
                    toolId = id;
                    break;
                  }
                }
              }
              if (!toolId) toolId = `${toolName}-${Date.now()}`;

              let parsedContent: any = toolContent;
              if (typeof toolContent === "string") {
                try {
                  parsedContent = JSON.parse(toolContent);
                } catch {
                  parsedContent = toolContent;
                }
              }

              const existingTool = newTools.get(toolId);
              newTools.set(toolId, {
                id: toolId,
                name: toolName,
                args: existingTool?.args || {},
                content: parsedContent,
                state: "output-available",
              });

              return { ...prev, tools: newTools };
            });

            // Record tool message to save later
            const contentToSave =
              typeof toolContent === "string"
                ? toolContent
                : JSON.stringify(toolContent);
            messagesToSave.push({
              role: "tool",
              content: contentToSave,
              tools: { name: toolName },
            });
          } else if (type === "message") {
            // Final assistant message content (non-delta)
            const content = data?.content || "";
            if (content) {
              accumulatedContent = String(content);
              setStreamingState((prev) => ({
                ...prev,
                content: accumulatedContent,
              }));
            }
          }
        }

        // Handle [DONE] marker
        if (event.data?.done === true || event.data === "[DONE]") {
          setIsStreaming(false);
        }
      });

      // Save final assistant message
      if (accumulatedContent) {
        // Ensure content is a string
        const finalContent =
          typeof accumulatedContent === "string"
            ? accumulatedContent
            : JSON.stringify(accumulatedContent);

        messagesToSave.push({
          role: "assistant",
          content: finalContent,
        });

        const assistantMessage: ChatMessage = {
          id: assistantMessageId,
          session_id: sessionId,
          owner_id: "",
          role: "assistant",
          content: finalContent,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        addMessage(assistantMessage);

        // Save conversation to backend
        await ChatService.saveConversation(sessionId, messagesToSave);
      }
    } catch (error) {
      console.error("Failed to stream message:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setIsStreaming(false);
      setStreamingState({
        content: "",
        tools: new Map(),
      });
      // Refresh messages to get saved ones from backend
      await fetchSessionMessages(sessionId);
    }
  };

  const displayMessages = [
    ...conversationMessages,
    ...(isStreaming && (streamingState.content || streamingState.tools.size > 0)
      ? [
          {
            role: "assistant" as const,
            content: streamingState.content,
            id: "streaming",
            tools: Array.from(streamingState.tools.values()),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">
            {selectedSession?.name || "Chat Session"}
          </h2>
        </div>
      </div>

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
            ) : displayMessages.length === 0 ? (
              <ConversationEmptyState
                title="No messages yet"
                description="Start a conversation by typing a message below"
                icon={<MessageSquare className="w-12 h-12" />}
              />
            ) : (
              <>
                {displayMessages.map((msg, idx) => (
                  <Message
                    key={msg.id || idx}
                    from={msg.role === "tool" ? "assistant" : msg.role}
                  >
                    <MessageAvatar
                      src=""
                      name={msg.role === "user" ? "You" : "AI"}
                    />
                    <MessageContent variant="contained">
                      {/* Display tool calls and results */}
                      {msg.tools && msg.tools.length > 0 && (
                        <div className="space-y-3 mb-3">
                          {msg.tools.map((tool) => (
                            <Tool
                              key={tool.id}
                              defaultOpen={tool.state === "output-available"}
                              className="border-border/50"
                            >
                              <ToolHeader
                                title={tool.name}
                                type={`tool-${tool.name}`}
                                state={tool.state}
                              />
                              <ToolContent>
                                {/* Show tool input/parameters if available */}
                                {tool.args &&
                                  Object.keys(tool.args).length > 0 && (
                                    <div className="p-4 pt-2 border-b border-border/50">
                                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                        Parameters
                                      </div>
                                      <CodeBlock
                                        code={JSON.stringify(
                                          tool.args,
                                          null,
                                          2
                                        )}
                                        language="json"
                                      />
                                    </div>
                                  )}
                                {/* Show tool result if available */}
                                {tool.content !== undefined && (
                                  <div className="p-4 pt-2">
                                    <div className="rounded-lg bg-muted/30 p-3">
                                      <ToolResultDisplay
                                        content={tool.content}
                                      />
                                    </div>
                                  </div>
                                )}
                                {/* Show loading state if tool is running */}
                                {tool.state === "input-available" &&
                                  tool.content === undefined && (
                                    <div className="p-4 pt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                      <Loader size={16} />
                                      <span>Executing tool...</span>
                                    </div>
                                  )}
                              </ToolContent>
                            </Tool>
                          ))}
                        </div>
                      )}
                      {/* Display message content */}
                      {msg.content && <Response>{msg.content}</Response>}
                      {/* Show loader if streaming with no content yet */}
                      {isStreaming &&
                        msg.id === "streaming" &&
                        !msg.content &&
                        msg.tools?.length === 0 && (
                          <div className="flex items-center gap-2 py-2">
                            <Loader size={16} />
                            <span className="text-muted-foreground text-sm">
                              Thinking...
                            </span>
                          </div>
                        )}
                    </MessageContent>
                  </Message>
                ))}
                <div ref={conversationEndRef} />
              </>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {errorMessage && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm border-t flex-shrink-0">
          {errorMessage}
        </div>
      )}

      <Separator className="flex-shrink-0" />

      {/* Input Area */}
      <div className="p-4 border-t flex-shrink-0">
        <PromptInput onSubmit={handleSend}>
          <PromptInputTextarea
            placeholder="Type your message..."
            disabled={isStreaming}
          />
          <PromptInputSubmit
            status={isStreaming ? "streaming" : undefined}
            disabled={isStreaming}
          />
        </PromptInput>
      </div>
    </div>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId }) => {
  return (
    <PromptInputProvider>
      <ChatInterfaceContent sessionId={sessionId} />
    </PromptInputProvider>
  );
};
