import { useCallback, useRef, useState } from "react";
import { ChatSSEClient, saveConversationBatch } from "../sse-client";
import type { ResumeData, SSEEvent } from "../type";

interface UseChatStreamingOptions {
  chatId: string;
  token: string;
  onError?: (error: Error) => void;
}

interface StreamingMessage {
  role: "user" | "assistant" | "tool";
  content: string;
  message_type: "text" | "tool_call" | "tool_result" | "approval_request";
  metadata?: Record<string, unknown>;
  parent_message_id?: string | null;
  tempId?: string; // Temporary ID for UI rendering
}

export function useChatStreaming({
  chatId,
  token,
  onError,
}: UseChatStreamingOptions) {
  const [streamingMessages, setStreamingMessages] = useState<
    StreamingMessage[]
  >([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingApproval, setPendingApproval] = useState<{
    id: string;
    toolName: string;
    args: Record<string, unknown>;
    description: string;
    allowedDecisions: string[];
  } | null>(null);

  const clientRef = useRef<ChatSSEClient | null>(null);
  const messagesBufferRef = useRef<StreamingMessage[]>([]);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize client
  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = new ChatSSEClient(chatId, token);
    }
    return clientRef.current;
  }, [chatId, token]);

  // Throttled state update to avoid too many re-renders
  const scheduleUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      setStreamingMessages([...messagesBufferRef.current]);
    }, 50); // Update every 50ms max
  }, []);

  // Handle SSE events
  const handleSSEEvent = useCallback(
    (event: SSEEvent) => {
      console.log("SSE Event:", event);

      switch (event.event) {
        case "start": {
          // Stream started - just log it
          console.log("Stream started");
          break;
        }

        case "end": {
          // Stream ended - just log it
          console.log("Stream ended");
          break;
        }

        case "content": {
          // AI response content
          let textContent = "";

          // Parse content - it can be string or array of content blocks
          if (typeof event.data.content === "string") {
            textContent = event.data.content;
          } else if (Array.isArray(event.data.content)) {
            // Extract text from content blocks
            textContent = event.data.content
              .filter((block: any) => block.type === "text")
              .map((block: any) => block.text)
              .join("");
          }

          const message: StreamingMessage = {
            role: "assistant",
            content: textContent,
            message_type: "text",
            tempId: event.data.id,
          };
          messagesBufferRef.current.push(message);
          scheduleUpdate();
          break;
        }

        case "tool_call": {
          // Tool is being called
          const message: StreamingMessage = {
            role: "assistant",
            content: "",
            message_type: "tool_call",
            metadata: {
              tool_name: event.data.tool_name,
              args: event.data.args,
              status: event.data.status,
            },
            tempId: event.data.id,
          };
          messagesBufferRef.current.push(message);
          scheduleUpdate();
          break;
        }

        case "tool_result": {
          // Tool execution result
          const message: StreamingMessage = {
            role: "tool",
            content: event.data.result,
            message_type: "tool_result",
            metadata: {
              tool_name: event.data.tool_name,
              result: event.data.result,
              status: event.data.status,
            },
            tempId: event.data.id,
          };
          messagesBufferRef.current.push(message);
          scheduleUpdate();
          break;
        }

        case "approval_request": {
          // Approval required
          const message: StreamingMessage = {
            role: "assistant",
            content: "",
            message_type: "approval_request",
            metadata: {
              tool_name: event.data.tool_name,
              args: event.data.args,
              description: event.data.description,
              allowed_decisions: event.data.allowed_decisions,
            },
            tempId: event.data.id,
          };
          messagesBufferRef.current.push(message);
          scheduleUpdate();

          // Set pending approval state
          setPendingApproval({
            id: event.data.id,
            toolName: event.data.tool_name,
            args: event.data.args,
            description: event.data.description,
            allowedDecisions: event.data.allowed_decisions,
          });
          break;
        }

        case "error": {
          console.error("Stream error:", event.data.message);
          onError?.(new Error(event.data.message));
          break;
        }
      }
    },
    [onError, scheduleUpdate]
  );

  // Start streaming
  const startStreaming = useCallback(
    async (message: string) => {
      setIsStreaming(true);
      messagesBufferRef.current = [];

      // Add user message to buffer
      const userMessage: StreamingMessage = {
        role: "user",
        content: message,
        message_type: "text",
        tempId: `user-${Date.now()}`,
      };
      messagesBufferRef.current.push(userMessage);
      setStreamingMessages([userMessage]);

      const client = getClient();

      await client.stream(
        message,
        handleSSEEvent,
        (error) => {
          console.error("Streaming error:", error);
          setIsStreaming(false);
          onError?.(error);
        },
        async () => {
          setIsStreaming(false);
          console.log("Stream completed");

          // Save conversation to backend
          try {
            const messagesToSave = messagesBufferRef.current.map((msg) => ({
              role: msg.role,
              content: msg.content,
              message_type: msg.message_type,
              metadata: msg.metadata,
              parent_message_id: msg.parent_message_id || null,
            }));

            await saveConversationBatch(chatId, messagesToSave, token);
            console.log("Conversation saved successfully");
          } catch (error) {
            console.error("Error saving conversation:", error);
          }
        }
      );
    },
    [chatId, token, getClient, handleSSEEvent, onError]
  );

  // Handle approval decision
  const handleApproval = useCallback(
    async (
      decision: "approve" | "reject" | "edit",
      editedArgs?: Record<string, unknown>
    ) => {
      if (!pendingApproval) return;

      const resumeData: ResumeData = {
        decisions: [
          decision === "approve"
            ? { type: "approve" }
            : decision === "reject"
            ? { type: "reject" }
            : {
                type: "edit",
                edited_action: {
                  name: pendingApproval.toolName,
                  args: editedArgs || pendingApproval.args,
                },
              },
        ],
      };

      setPendingApproval(null);
      setIsStreaming(true);

      const client = getClient();

      await client.resume(
        resumeData,
        handleSSEEvent,
        (error) => {
          console.error("Resume error:", error);
          setIsStreaming(false);
          onError?.(error);
        },
        async () => {
          setIsStreaming(false);
          console.log("Resume completed");

          // Save conversation to backend
          try {
            const messagesToSave = messagesBufferRef.current.map((msg) => ({
              role: msg.role,
              content: msg.content,
              message_type: msg.message_type,
              metadata: msg.metadata,
              parent_message_id: msg.parent_message_id || null,
            }));

            await saveConversationBatch(chatId, messagesToSave, token);
            console.log("Conversation saved successfully");
          } catch (error) {
            console.error("Error saving conversation:", error);
          }
        }
      );
    },
    [pendingApproval, chatId, token, getClient, handleSSEEvent, onError]
  );

  // Clear streaming messages
  const clearStreamingMessages = useCallback(() => {
    messagesBufferRef.current = [];
    setStreamingMessages([]);
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.close();
      clientRef.current = null;
    }
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
  }, []);

  return {
    streamingMessages,
    isStreaming,
    pendingApproval,
    startStreaming,
    handleApproval,
    clearStreamingMessages,
    cleanup,
  };
}
