import { ENDPOINTS } from "@/consts/endpoint";
import { getAuthToken, getBaseURL, httpClient } from "@/lib/axios";
import type {
  ChatConfig,
  ChatConfigCreate,
  ChatConfigListResponse,
  ChatConfigUpdate,
  ChatSession,
  ChatSessionCreate,
  ChatSessionDeleteResponse,
  ChatSessionListResponse,
} from "./types";

export class ChatService {
  // Chat Config Methods
  static async listConfigs(
    skip: number = 0,
    limit: number = 100
  ): Promise<ChatConfigListResponse | null> {
    try {
      const response = await httpClient.get<ChatConfigListResponse>(
        ENDPOINTS.CHATS.CONFIGS.LIST,
        { skip, limit }
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch chat configs:", response.message);
        return null;
      }

      return response.getData();
    } catch (error) {
      console.error("❌ Failed to fetch chat configs:", error);
      return null;
    }
  }

  static async createConfig(
    data: ChatConfigCreate
  ): Promise<ChatConfig | null> {
    try {
      const response = await httpClient.post<ChatConfig>(
        ENDPOINTS.CHATS.CONFIGS.CREATE,
        data
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to create chat config:", response.message);
        return null;
      }

      return response.getData();
    } catch (error) {
      console.error("❌ Failed to create chat config:", error);
      return null;
    }
  }

  static async getConfig(id: string): Promise<ChatConfig | null> {
    try {
      const response = await httpClient.get<ChatConfig>(
        ENDPOINTS.CHATS.CONFIGS.GET(id)
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch chat config:", response.message);
        return null;
      }

      return response.getData();
    } catch (error) {
      console.error("❌ Failed to fetch chat config:", error);
      return null;
    }
  }

  static async updateConfig(
    id: string,
    data: ChatConfigUpdate
  ): Promise<ChatConfig | null> {
    try {
      const response = await httpClient.put<ChatConfig>(
        ENDPOINTS.CHATS.CONFIGS.UPDATE(id),
        data
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to update chat config:", response.message);
        return null;
      }

      return response.getData();
    } catch (error) {
      console.error("❌ Failed to update chat config:", error);
      return null;
    }
  }

  static async deleteConfig(id: string): Promise<boolean> {
    try {
      const response = await httpClient.delete(
        ENDPOINTS.CHATS.CONFIGS.DELETE(id)
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to delete chat config:", response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Failed to delete chat config:", error);
      return false;
    }
  }

  // Chat Session Methods
  static async listSessions(
    skip: number = 0,
    limit: number = 100
  ): Promise<ChatSessionListResponse | null> {
    try {
      const response = await httpClient.get<ChatSessionListResponse>(
        ENDPOINTS.CHATS.SESSIONS.LIST,
        { skip, limit }
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch chat sessions:", response.message);
        return null;
      }

      return response.getData();
    } catch (error) {
      console.error("❌ Failed to fetch chat sessions:", error);
      return null;
    }
  }

  static async createSession(
    data: ChatSessionCreate
  ): Promise<ChatSession | null> {
    try {
      const response = await httpClient.post<ChatSession>(
        ENDPOINTS.CHATS.SESSIONS.CREATE,
        data
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to create chat session:", response.message);
        return null;
      }

      return response.getData();
    } catch (error) {
      console.error("❌ Failed to create chat session:", error);
      return null;
    }
  }

  static async getSession(
    id: string,
    skip: number = 0,
    limit: number = 100
  ): Promise<ChatSession | null> {
    try {
      const response = await httpClient.get<ChatSession>(
        ENDPOINTS.CHATS.SESSIONS.GET(id),
        { skip, limit }
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to fetch chat session:", response.message);
        return null;
      }

      return response.getData();
    } catch (error) {
      console.error("❌ Failed to fetch chat session:", error);
      return null;
    }
  }

  static async deleteSession(id: string): Promise<boolean> {
    try {
      const response = await httpClient.delete(
        ENDPOINTS.CHATS.SESSIONS.DELETE(id)
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to delete chat session:", response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Failed to delete chat session:", error);
      return false;
    }
  }

  static async deleteSessions(sessionIds: string[]): Promise<ChatSessionDeleteResponse | null> {
    try {
      const response = await httpClient.delete(
        ENDPOINTS.CHATS.SESSIONS.LIST,
        { session_ids: sessionIds }
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to delete chat sessions:", response.message);
        return null;
      }

      return response.getData() as ChatSessionDeleteResponse;
    } catch (error) {
      console.error("❌ Failed to delete chat sessions:", error);
      return null;
    }
  }

  static async clearSessionMessages(id: string): Promise<boolean> {
    try {
      const response = await httpClient.delete(
        ENDPOINTS.CHATS.SESSIONS.CLEAR_MESSAGES(id)
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to clear session messages:", response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Failed to clear session messages:", error);
      return false;
    }
  }

  // Streaming Methods
  static async streamMessage(
    sessionId: string,
    message: string,
    onEvent: (event: { event: string; data: any }) => void
  ): Promise<void> {
    try {
      // Use baseURL from axios config
      const baseURL = getBaseURL();
      console.debug("[ChatService.stream] baseURL:", baseURL);

      // Get token using same logic as axios interceptor
      const token = await getAuthToken();
      console.debug(
        "[ChatService.stream] sessionId:",
        sessionId,
        "tokenPresent:",
        Boolean(token),
        "messageLen:",
        message?.length ?? 0
      );

      const response = await fetch(
        `${baseURL}${ENDPOINTS.CHATS.SESSIONS.STREAM(sessionId)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            role: "user",
            content: message,
          }),
        }
      );

      console.debug(
        "[ChatService.stream] response status:",
        response.status,
        response.statusText
      );
      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => response.statusText);
        throw new Error(
          `Stream failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      // Check if response is actually a stream
      const contentType = response.headers.get("content-type");
      console.debug("[ChatService.stream] content-type:", contentType);
      if (!contentType?.includes("text/event-stream")) {
        console.warn("⚠️ Expected text/event-stream, got:", contentType);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available - response body is null");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.debug(
            "[ChatService.stream] reader done. remainingBufferLen:",
            buffer.length
          );
        } else {
          console.debug(
            "[ChatService.stream] chunk received. size:",
            value?.byteLength ?? 0
          );
        }

        if (done) {
          // Process remaining buffer before finishing
          if (buffer.trim()) {
            console.debug("[ChatService.stream] processing remaining buffer");
            ChatService._processSSEBuffer(buffer, onEvent);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        console.debug(
          "[ChatService.stream] lines parsed:",
          lines.length,
          "currentBufferLen:",
          buffer.length
        );

        // Keep the last incomplete line in buffer
        buffer = lines.pop() || "";

        // Process complete SSE messages
        for (const line of lines) {
          if (line.trim()) {
            console.debug(
              "[ChatService.stream] processing line:",
              line.slice(0, 200)
            );
            ChatService._processSSELine(line, onEvent);
          }
        }
      }
    } catch (error) {
      console.error("❌ Stream error:", error);

      // Notify caller of error via onEvent
      onEvent({
        event: "error",
        data: {
          message:
            error instanceof Error ? error.message : "Unknown stream error",
          error: String(error),
        },
      });

      throw error;
    }
  }

  /**
   * Process a single SSE line and emit event
   * @private
   */
  private static _processSSELine(
    line: string,
    onEvent: (event: { event: string; data: any }) => void
  ): void {
    const match = line.match(/^event: (.+)$/m);
    const dataMatch = line.match(/^data: (.+)$/m);
    console.debug(
      "[ChatService._processSSELine] raw line:",
      line.slice(0, 200)
    );

    if (match || dataMatch) {
      const eventType = match ? match[1] : "message";
      const dataStr = dataMatch ? dataMatch[1] : "{}";
      console.debug(
        "[ChatService._processSSELine] event:",
        eventType,
        "dataStr:",
        dataStr.slice(0, 200)
      );

      try {
        if (dataStr.trim() === '"[START]"') {
          console.debug("[ChatService._processSSELine] START event");
          onEvent({ event: "start", data: {} });
          return;
        }
        if (dataStr.trim() === '"[END]"') {
          console.debug("[ChatService._processSSELine] END event");
          onEvent({ event: eventType, data: { done: true } });
          return;
        }

        const data = JSON.parse(dataStr);
        console.debug("[ChatService._processSSELine] parsed data:", data);
        onEvent({ event: eventType, data });
      } catch (e) {
        console.error("Failed to parse SSE data:", e, "Raw data:", dataStr);
        onEvent({
          event: eventType,
          data: { raw: dataStr, parseError: String(e) },
        });
      }
    }
  }

  /**
   * Process SSE buffer (for remaining data at end of stream)
   * @private
   */
  private static _processSSEBuffer(
    buffer: string,
    onEvent: (event: { event: string; data: any }) => void
  ): void {
    const lines = buffer.split("\n\n").filter((line) => line.trim());
    console.debug(
      "[ChatService._processSSEBuffer] lines to flush:",
      lines.length
    );
    for (const line of lines) {
      console.debug(
        "[ChatService._processSSEBuffer] flushing line:",
        line.slice(0, 200)
      );
      ChatService._processSSELine(line, onEvent);
    }
  }

  static async saveConversation(
    sessionId: string,
    messages: Array<{
      role: string;
      content: string;
      models?: Record<string, any>;
      tools?: Record<string, any>;
      interrupt?: Record<string, any>;
    }>
  ): Promise<boolean> {
    try {
      const response = await httpClient.post(
        ENDPOINTS.CHATS.SESSIONS.SAVE_CONVERSATION(sessionId),
        { messages }
      );

      if (!response.isSuccess) {
        console.error("❌ Failed to save conversation:", response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Failed to save conversation:", error);
      return false;
    }
  }
}
