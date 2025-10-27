import { API_CONFIG, ENDPOINTS } from "@/consts/endpoint";
import type { ResumeData, SSEEvent } from "./type";

export type SSEEventHandler = (event: SSEEvent) => void;
export type SSEErrorHandler = (error: Error) => void;
export type SSECompleteHandler = () => void;

export class ChatSSEClient {
  private eventSource: EventSource | null = null;
  private abortController: AbortController | null = null;
  private chatId: string;
  private token: string;

  constructor(chatId: string, token: string) {
    this.chatId = chatId;
    this.token = token;
  }

  /**
   * Start streaming a new message
   */
  async stream(
    message: string,
    onEvent: SSEEventHandler,
    onError: SSEErrorHandler,
    onComplete: SSECompleteHandler
  ): Promise<void> {
    try {
      const url = `${API_CONFIG.BASE_URL}${
        API_CONFIG.API_PREFIX
      }${ENDPOINTS.CHATS.STREAM(this.chatId)}`;

      // Use fetch with ReadableStream for better control
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          role: "user",
          content: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      let buffer = "";
      let currentEventType = "message"; // Default event type

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;

          if (line.startsWith("event:")) {
            // Store the event type for the next data line
            currentEventType = line.slice(6).trim();
            continue;
          }

          if (line.startsWith("data:")) {
            try {
              const data = JSON.parse(line.slice(5).trim());

              // Use the event type from the event line
              const event: SSEEvent = {
                event: currentEventType as any,
                data: data,
              } as SSEEvent;

              onEvent(event);

              // Reset to default after processing
              currentEventType = "message";
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }

      onComplete();
    } catch (error) {
      console.error("SSE streaming error:", error);
      onError(error as Error);
    }
  }

  /**
   * Continue streaming after approval
   */
  async resume(
    resumeData: ResumeData,
    onEvent: SSEEventHandler,
    onError: SSEErrorHandler,
    onComplete: SSECompleteHandler
  ): Promise<void> {
    try {
      const url = `${API_CONFIG.BASE_URL}${
        API_CONFIG.API_PREFIX
      }${ENDPOINTS.CHATS.APPROVE(this.chatId)}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          resume_data: resumeData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      let buffer = "";
      let currentEventType = "message"; // Default event type

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;

          if (line.startsWith("event:")) {
            // Store the event type for the next data line
            currentEventType = line.slice(6).trim();
            continue;
          }

          if (line.startsWith("data:")) {
            try {
              const data = JSON.parse(line.slice(5).trim());

              // Use the event type from the event line
              const event: SSEEvent = {
                event: currentEventType as any,
                data: data,
              } as SSEEvent;

              onEvent(event);

              // Reset to default after processing
              currentEventType = "message";
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }

      onComplete();
    } catch (error) {
      console.error("SSE resume error:", error);
      onError(error as Error);
    }
  }

  /**
   * Close the connection
   */
  close(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

/**
 * Save conversation batch to backend
 */
export async function saveConversationBatch(
  chatId: string,
  messages: Array<{
    role: string;
    content: string;
    message_type: string;
    metadata?: Record<string, unknown>;
    parent_message_id?: string | null;
  }>,
  token: string
): Promise<boolean> {
  try {
    const url = `${API_CONFIG.BASE_URL}${
      API_CONFIG.API_PREFIX
    }${ENDPOINTS.CHATS.SAVE_CONVERSATION(chatId)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error saving conversation batch:", error);
    return false;
  }
}
