"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import { PromptInput } from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import { Separator } from "@/components/ui/separator";
import { MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatService } from "../services";
import { useChatStore } from "../store";
import type { ChatMessage } from "../types";

interface ChatInterfaceProps {
  sessionId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId }) => {
  const {
    messages,
    messagesLoading,
    fetchSessionMessages,
    addMessage,
    selectedSession,
  } = useChatStore();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [conversationMessages, setConversationMessages] = useState<
    Array<{
      role: "user" | "assistant" | "system" | "tool";
      content: string;
      id?: string;
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
  }, [conversationMessages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: sessionId,
      owner_id: "",
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

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

    try {
      await ChatService.streamMessage(sessionId, input, (event) => {
        if (event.event === "error") {
          console.error("Stream error:", event.data);
          setIsStreaming(false);
          return;
        }

        if (event.event === "ai_result") {
          const content = event.data.content || "";
          if (content) {
            accumulatedContent += content;
            setStreamingContent(accumulatedContent);
          }
        } else if (event.event === "tool_calls") {
          // Handle tool calls
          const tools = event.data.tools || [];
          messagesToSave.push({
            role: "assistant",
            content: accumulatedContent,
            tools: { calls: tools },
          });
        } else if (event.event === "tool_result") {
          const content = event.data.content || "";
          const name = event.data.name || "";
          messagesToSave.push({
            role: "tool",
            content,
            tools: { name },
          });
        }
      });

      // Save final assistant message
      if (accumulatedContent) {
        messagesToSave.push({
          role: "assistant",
          content: accumulatedContent,
        });

        const assistantMessage: ChatMessage = {
          id: assistantMessageId,
          session_id: sessionId,
          owner_id: "",
          role: "assistant",
          content: accumulatedContent,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        addMessage(assistantMessage);

        // Save conversation to backend
        await ChatService.saveConversation(sessionId, messagesToSave);
      }
    } catch (error) {
      console.error("Failed to stream message:", error);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      // Refresh messages to get saved ones from backend
      await fetchSessionMessages(sessionId);
    }
  };

  const displayMessages = [
    ...conversationMessages,
    ...(isStreaming && streamingContent
      ? [
          {
            role: "assistant" as const,
            content: streamingContent,
            id: "streaming",
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">
            {selectedSession?.name || "Chat Session"}
          </h2>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <Conversation>
          <ConversationContent>
            {messagesLoading && conversationMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading messages...</div>
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
                  <Message key={msg.id || idx} from={msg.role}>
                    <MessageAvatar
                      src={msg.role === "user" ? "" : ""}
                      name={msg.role === "user" ? "You" : "AI"}
                    />
                    <MessageContent variant="contained">
                      <Response>{msg.content}</Response>
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

      <Separator />

      {/* Input Area */}
      <div className="p-4 border-t">
        <PromptInput
          value={input}
          onValueChange={setInput}
          onSubmit={handleSend}
          disabled={isStreaming}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
};
