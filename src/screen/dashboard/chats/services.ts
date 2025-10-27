import { ENDPOINTS } from "@/consts/endpoint";
import { httpClient } from "@/lib/axios";
import type {
  Chat,
  ChatListResponse,
  CreateChatRequest,
  MessageListResponse,
  UpdateChatRequest,
} from "./type";

export class ChatService {
  // Chat CRUD Operations
  static async createChat(data: CreateChatRequest): Promise<Chat | null> {
    try {
      console.log("📤 ChatService - Creating chat with data:", data);
      const response = await httpClient.post<Chat>(
        ENDPOINTS.CHATS.CREATE,
        data
      );

      console.log("📡 ChatService - Create response:", response);
      console.log("📦 ChatService - response.data:", response.data);
      console.log("✅ ChatService - isSuccess:", response.isSuccess);

      if (response.isSuccess && response.data) {
        console.log("🎉 ChatService - Returning chat:", response.data);
        return response.data;
      }

      throw new Error(response.message || "Failed to create chat");
    } catch (error) {
      console.error("❌ ChatService - Error creating chat:", error);
      throw error;
    }
  }

  static async getChats(
    skip: number = 0,
    limit: number = 10
  ): Promise<ChatListResponse | null> {
    try {
      console.log("🔍 ChatService - getChats called with:", { skip, limit });

      const response = await httpClient.get<ChatListResponse>(
        ENDPOINTS.CHATS.LIST,
        { skip, limit }
      );

      console.log("📡 ChatService - Raw API response:", response);
      console.log("📦 ChatService - response.data:", response.data);

      if (response.isSuccess && response.data) {
        console.log("✅ ChatService - Returning data:", response.data);
        // Response.data now contains the nested structure { chats, total, skip, limit }
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch chats");
    } catch (error) {
      console.error("❌ ChatService - Error fetching chats:", error);
      throw error;
    }
  }

  static async getChat(id: string): Promise<Chat | null> {
    try {
      const response = await httpClient.get<Chat>(ENDPOINTS.CHATS.GET(id));

      if (response.isSuccess && response.data) {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch chat");
    } catch (error) {
      console.error("Error fetching chat:", error);
      throw error;
    }
  }

  static async updateChat(
    id: string,
    data: UpdateChatRequest
  ): Promise<Chat | null> {
    try {
      const response = await httpClient.put<Chat>(
        ENDPOINTS.CHATS.UPDATE(id),
        data
      );

      if (response.isSuccess && response.data) {
        return response.data;
      }

      throw new Error(response.message || "Failed to update chat");
    } catch (error) {
      console.error("Error updating chat:", error);
      throw error;
    }
  }

  static async deleteChat(id: string): Promise<boolean> {
    try {
      const response = await httpClient.delete(ENDPOINTS.CHATS.DELETE(id));

      if (response.isSuccess) {
        return true;
      }

      throw new Error(response.message || "Failed to delete chat");
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw error;
    }
  }

  // Message Operations
  static async getMessages(
    chatId: string,
    skip: number = 0,
    limit: number = 100
  ): Promise<MessageListResponse | null> {
    try {
      const response = await httpClient.get<MessageListResponse>(
        ENDPOINTS.CHATS.MESSAGES.LIST(chatId),
        { skip, limit }
      );

      if (response.isSuccess && response.data) {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch messages");
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  // DEPRECATED: Use useChatStreaming hook for real-time streaming instead
  // This method is kept for backward compatibility but should not be used
  // static async sendMessage(
  //   chatId: string,
  //   content: string
  // ): Promise<ChatMessage | null> {
  //   try {
  //     const data: CreateMessageRequest = {
  //       role: "user",
  //       content,
  //     };
  //
  //     const response = await httpClient.post<MessageResponse>(
  //       ENDPOINTS.CHATS.MESSAGES.CREATE(chatId),
  //       data
  //     );
  //
  //     if (response.isSuccess && response.data) {
  //       return response.data.data;
  //     }
  //
  //     throw new Error(response.message || "Failed to send message");
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //     throw error;
  //   }
  // }

  static async clearMessages(chatId: string): Promise<Chat | null> {
    try {
      const response = await httpClient.delete<Chat>(
        ENDPOINTS.CHATS.MESSAGES.DELETE(chatId)
      );

      if (response.isSuccess && response.data) {
        return response.data;
      }

      throw new Error(response.message || "Failed to clear messages");
    } catch (error) {
      console.error("Error clearing messages:", error);
      throw error;
    }
  }

  // Helper Methods
  static getChatType(
    chat: Chat
  ): "ai_only" | "knowledge_base" | "dataset" | "full_featured" {
    const hasKnowledgeStore =
      chat.knowledge_store_id !== null && chat.knowledge_store_id !== undefined;
    const hasDatasets =
      chat.dataset_ids &&
      Array.isArray(chat.dataset_ids) &&
      chat.dataset_ids.length > 0;

    if (hasKnowledgeStore && hasDatasets) {
      return "full_featured";
    } else if (hasKnowledgeStore) {
      return "knowledge_base";
    } else if (hasDatasets) {
      return "dataset";
    } else {
      return "ai_only";
    }
  }

  static validateChatData(
    data: Partial<CreateChatRequest | UpdateChatRequest>
  ): string[] {
    const errors: string[] = [];

    // Check if embedding model is provided but knowledge store is not
    if (data.embedding_model_id && !data.knowledge_store_id) {
      errors.push(
        "Knowledge store ID is required when embedding model is provided"
      );
    }

    // Check if knowledge store is provided but embedding model is not
    if (data.knowledge_store_id && !data.embedding_model_id) {
      errors.push(
        "Embedding model ID is required when knowledge store is provided"
      );
    }

    // Validate temperature range
    if (
      data.temperature !== undefined &&
      (data.temperature < 0 || data.temperature > 1)
    ) {
      errors.push("Temperature must be between 0 and 1");
    }

    // Validate max_tokens
    if (data.max_tokens !== undefined && data.max_tokens < 1) {
      errors.push("Max tokens must be greater than 0");
    }

    // Validate top_p range
    if (data.top_p !== undefined && (data.top_p < 0 || data.top_p > 1)) {
      errors.push("Top P must be between 0 and 1");
    }

    return errors;
  }
}
