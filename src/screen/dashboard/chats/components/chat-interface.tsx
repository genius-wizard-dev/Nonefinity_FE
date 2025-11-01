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
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Tool, ToolContent, ToolHeader } from "@/components/ai-elements/tool";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileTextIcon,
  MessageSquare,
} from "lucide-react";
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
  content?: string;
}

interface StreamingState {
  content: string;
  tools: Map<string, ToolCall>;
}

// Component to render tool results in a beautiful, professional format
const ToolResultDisplay: React.FC<{ content: any; uniquePrefix?: string }> = ({
  content,
  uniquePrefix = "",
}) => {
  // Generate a unique prefix to avoid ID conflicts across multiple messages/tools
  const prefix =
    uniquePrefix ||
    `tool-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  if (Array.isArray(content)) {
    if (
      content.length > 0 &&
      typeof content[0] === "object" &&
      !Array.isArray(content[0])
    ) {
      const keys = Object.keys(content[0]);
      if (keys.length === 1) {
        // Component for each document item with better UI
        const DocumentItem: React.FC<{
          item: any;
          index: number;
          keyName: string;
        }> = ({ item, index, keyName }) => {
          const [isOpen, setIsOpen] = useState(false);
          const contentValue = item[keyName];
          const isLongContent =
            typeof contentValue === "string" && contentValue.length > 200;

          return (
            <div className="w-full group">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 font-medium bg-secondary/50 hover:bg-secondary border border-border/50 rounded-lg transition-all duration-200 cursor-pointer select-none group-hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold">
                      {index + 1}
                    </div>
                    <FileTextIcon className="size-4 text-primary flex-shrink-0" />
                  </div>
                  <span className="text-sm text-foreground font-medium truncate">
                    Document {index + 1}
                  </span>
                  {isLongContent && !isOpen && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      Click to expand
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isLongContent && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {contentValue.length} chars
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronUp className="size-4 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground transition-transform" />
                  )}
                </div>
              </button>
              {isOpen && (
                <div className="mt-2 ml-2 pl-6 border-l-2 border-primary/20 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-muted/30 rounded-md border border-border/30 text-sm text-foreground whitespace-pre-wrap break-words">
                    {typeof contentValue === "string" ? (
                      <pre className="font-sans whitespace-pre-wrap break-words">
                        {contentValue}
                      </pre>
                    ) : (
                      <pre className="font-sans whitespace-pre-wrap break-words">
                        {JSON.stringify(contentValue, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        };

        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Results
              </div>
              <Badge variant="secondary" className="text-xs font-mono">
                {content.length}{" "}
                {content.length === 1 ? "document" : "documents"}
              </Badge>
            </div>
            <div className="space-y-2">
              {content.map((item, idx) => (
                <DocumentItem
                  key={idx}
                  item={item}
                  index={idx}
                  keyName={keys[0]}
                />
              ))}
            </div>
          </div>
        );
      }
    }
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
                className="gap-1.5 px-3 py-1.5 text-sm font-medium border border-border/50"
              >
                <CheckCircle2 className="size-3.5 text-green-600" />
                {item}
              </Badge>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Results ({content.length} items)
        </div>
        <CodeBlock code={JSON.stringify(content, null, 2)} language="json" />
      </div>
    );
  }

  if (
    typeof content === "object" &&
    content !== null &&
    !Array.isArray(content)
  ) {
    const entries = Object.entries(content);
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
      return <ToolResultDisplay content={parsed} uniquePrefix={prefix} />;
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
  const [isThinking, setIsThinking] = useState(false);
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
      tools:
        msg.tools?.map((t, idx) => ({
          id: `${t.name}-${idx}-${msg.id}`,
          name: t.name,
          args: t.arguments || {},
          state: "output-available" as const,
          content: t.result,
        })) || [],
    }));
    setConversationMessages(convMessages);
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive or streaming state changes
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages, streamingState, isThinking]);

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
    setIsThinking(true);
    setStreamingState({
      content: "",
      tools: new Map(),
    });

    const assistantMessageId = `temp-assistant-${Date.now()}`;
    let accumulatedContent = "";
    const messagesToSave: Array<{
      role: string;
      content: string;
      // aggregated tools for assistant message
      tools?: Array<{
        name: string;
        arguments?: Record<string, any>;
        result?: any;
      }>;
      models?: Record<string, any>;
      interrupt?: Record<string, any>;
    }> = [
      {
        role: "user",
        content: userMessage.content,
      },
    ];

    setErrorMessage(null);
    // Accumulate tool calls/results during the stream
    const accumulatedTools: Array<{
      id: string;
      name: string;
      arguments?: Record<string, any>;
      result?: any;
    }> = [];
    try {
      await ChatService.streamMessage(sessionId, inputText, (event) => {
        // Debug incoming events for diagnosis
        try {
          // Avoid logging huge payloads
          const preview =
            typeof event.data === "string"
              ? event.data.slice(0, 200)
              : JSON.stringify(event.data)?.slice(0, 200);
          console.debug(
            "[chat-interface] event:",
            event.event,
            "data:",
            preview
          );
        } catch {
          console.debug("[chat-interface] event:", event.event);
        }

        const parseMaybeJSON = (v: any) => {
          if (typeof v !== "string") return v;
          try {
            return JSON.parse(v);
          } catch {
            return v;
          }
        };

        if (event.event === "error") {
          console.error("Stream error:", event.data);
          const errorMsg = event.data?.message || "An error occurred";
          setErrorMessage(errorMsg);
          setIsStreaming(false);
          setIsThinking(false);
          return;
        }

        if (event.event === "start") {
          // Chat started - reset streaming state
          setStreamingState({
            content: "",
            tools: new Map(),
          });
          setIsStreaming(true);
          setIsThinking(true);
          return;
        }

        // Events from backend: tool_calls, tool_results, ai_result
        if (event.event === "tool_calls") {
          // Backend sends a single tool call with { type, name, arguments }
          const payload = parseMaybeJSON(event.data) as any;
          const toolName = payload?.name || "unknown";
          const args = payload?.arguments || {};
          const incomingId = payload?.id || `${toolName}-${Date.now()}`;

          // Stop thinking when tool is called
          setIsThinking(false);

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
          // Track for saving later (avoid relying on async state)
          const existingIdx = accumulatedTools.findIndex((t) =>
            payload?.id ? t.id === payload.id : t.name === toolName
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
          // Handle tool result - tool has finished and returned result
          const payload = parseMaybeJSON(event.data) as any;
          const toolName = payload?.name || "unknown";
          const toolContent = payload?.result ?? payload?.content ?? "";
          const incomingId = payload?.id as string | undefined;

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
              state: "output-available",
            });

            return {
              ...prev,
              tools: newTools,
            };
          });
          // Aggregate into accumulatedTools
          const contentToSave =
            typeof toolContent === "string"
              ? toolContent
              : JSON.stringify(toolContent);
          const argsFromState = (() => {
            const existing = Array.from(streamingState.tools.values()).find(
              (t) =>
                t.name === toolName &&
                (t.id === incomingId ||
                  t.state === "input-available" ||
                  t.state === "output-available")
            );
            return (
              existing?.args ||
              (payload?.arguments as Record<string, any>) ||
              {}
            );
          })();
          // find last matching by id or name
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
              arguments: accumulatedTools[idx].arguments || argsFromState,
              result: contentToSave,
            };
          } else {
            accumulatedTools.push({
              id: incomingId || `${toolName}-${Date.now()}`,
              name: toolName,
              arguments: argsFromState,
              result: contentToSave,
            });
          }
        } else if (event.event === "ai_result") {
          const payload = parseMaybeJSON(event.data) as any;
          const content = payload?.content || "";
          const isDelta = payload?.is_delta === true;

          if (content) {
            // Stop thinking when content starts arriving
            setIsThinking(false);

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

        // Handle END marker translated by service to { done: true }
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
          tools: accumulatedTools.map((t) => ({
            name: t.name,
            arguments: t.arguments,
            result: t.result,
          })),
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
      setIsThinking(false);
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
    ...(isStreaming &&
    (streamingState.content || streamingState.tools.size > 0 || isThinking)
      ? [
          {
            role: "assistant" as const,
            content: streamingState.content,
            id: "streaming",
            tools: Array.from(streamingState.tools.values()),
            isThinking,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">
            {selectedSession?.name || "Chat Session"}
          </h2>
        </div>
      </div>

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

                                {tool.content !== undefined && (
                                  <div className="p-4 pt-2">
                                    <div className="">
                                      <ToolResultDisplay
                                        content={tool.content}
                                        uniquePrefix={`${msg.id || "msg"}-${
                                          tool.id || "tool"
                                        }`}
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
                      {/* Display message content with streaming effect */}
                      {msg.content && (
                        <div className="inline-flex items-baseline gap-0.5">
                          <Response>{msg.content}</Response>
                          {isStreaming && msg.id === "streaming" && (
                            <span className="inline-block w-0.5 h-4 bg-primary animate-pulse" />
                          )}
                        </div>
                      )}
                      {/* Show thinking indicator like ChatGPT */}
                      {isStreaming &&
                        msg.id === "streaming" &&
                        !msg.content &&
                        msg.tools?.length === 0 &&
                        (msg as any).isThinking && (
                          <div className="flex items-center gap-2.5 py-1.5">
                            <Loader size={18} className="text-primary/60" />
                            <Shimmer
                              className="text-sm text-muted-foreground"
                              duration={1.5}
                            >
                              Thinking...
                            </Shimmer>
                          </div>
                        )}
                      {/* Show minimal loader if just started streaming */}
                      {isStreaming &&
                        msg.id === "streaming" &&
                        !msg.content &&
                        msg.tools?.length === 0 &&
                        !(msg as any).isThinking && (
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
