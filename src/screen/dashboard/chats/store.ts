import { toast } from "sonner";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ChatService } from "./services";
import type {
  Chat,
  ChatStore,
  CreateChatRequest,
  UpdateChatRequest,
} from "./type";

const initialState = {
  // Data
  chats: [],
  currentChat: null,
  messages: [],

  // Loading states
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isSendingMessage: false,
  isLoadingMessages: false,

  // Pagination
  pagination: {
    page: 1,
    pageSize: 100,
    total: 0,
    totalPages: 0,
  },

  // UI state
  sidebarOpen: true,
  selectedChatId: null,
};

export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Chat CRUD Actions
      createChat: async (data: CreateChatRequest) => {
        set({ isCreating: true });

        try {
          console.log("🚀 Creating chat with data:", data);
          const chat = await ChatService.createChat(data);
          console.log("✅ Chat created successfully:", chat);

          if (chat) {
            // Show success toast
            toast.success("Chat created successfully", {
              description: `"${chat.name}" has been created`,
            });

            // Refresh the chats list to get updated data from backend
            console.log("🔄 Refreshing chat list...");
            await get().getChats();
            console.log(
              "✅ Chat list refreshed, total chats:",
              get().chats.length
            );

            // Set the newly created chat as current
            set({
              currentChat: chat,
              selectedChatId: chat.id,
              isCreating: false,
            });

            return chat;
          }

          set({ isCreating: false });
          return null;
        } catch (error) {
          console.error("❌ Error creating chat:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create chat";
          toast.error("Failed to create chat", {
            description: errorMessage,
          });
          set({ isCreating: false });
          return null;
        }
      },

      getChats: async (skip: number = 0, limit: number = 100) => {
        set({ isLoading: true });

        try {
          const response = await ChatService.getChats(skip, limit);
          console.log("📊 Chat Store - getChats response:", response);

          if (response) {
            console.log("✅ Response chats:", response.chats);
            console.log("📄 Response total:", response.total);

            set({
              chats: response.chats || [],
              pagination: {
                page: Math.floor(skip / limit) + 1,
                pageSize: limit,
                total: response.total,
                totalPages: Math.ceil(response.total / limit),
              },
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("❌ Chat Store - getChats error:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch chats";
          toast.error("Failed to load chats", {
            description: errorMessage,
          });
          set({ isLoading: false });
        }
      },

      getChat: async (id: string) => {
        set({ isLoading: true });

        try {
          const chat = await ChatService.getChat(id);

          if (chat) {
            set({
              currentChat: chat,
              selectedChatId: id,
              isLoading: false,
            });

            // Load messages for this chat
            await get().getMessages(id);
          }

          return chat;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch chat";
          toast.error("Failed to load chat", {
            description: errorMessage,
          });
          set({ isLoading: false });
          return null;
        }
      },

      updateChat: async (id: string, data: UpdateChatRequest) => {
        set({ isUpdating: true });

        try {
          const chat = await ChatService.updateChat(id, data);

          if (chat) {
            toast.success("Chat updated successfully", {
              description: `"${chat.name}" has been updated`,
            });

            // Update current chat if it's the one being edited
            set((state) => ({
              currentChat:
                state.currentChat?.id === id ? chat : state.currentChat,
              isUpdating: false,
            }));

            // Refresh the chats list to get updated data from backend
            await get().getChats();

            return chat;
          }

          set({ isUpdating: false });
          return null;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update chat";
          toast.error("Failed to update chat", {
            description: errorMessage,
          });
          set({ isUpdating: false });
          return null;
        }
      },

      deleteChat: async (id: string) => {
        set({ isDeleting: true });

        try {
          const success = await ChatService.deleteChat(id);

          if (success) {
            toast.success("Chat deleted successfully");

            // Remove chat from chats list and update current chat state
            set((state) => ({
              chats: state.chats.filter((chat) => chat.id !== id),
              currentChat:
                state.currentChat?.id === id ? null : state.currentChat,
              selectedChatId:
                state.selectedChatId === id ? null : state.selectedChatId,
              messages: state.currentChat?.id === id ? [] : state.messages,
              isDeleting: false,
            }));

            return true;
          }

          set({ isDeleting: false });
          return false;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete chat";
          toast.error("Failed to delete chat", {
            description: errorMessage,
          });
          set({ isDeleting: false });
          return false;
        }
      },

      // Message Actions
      getMessages: async (
        chatId: string,
        skip: number = 0,
        limit: number = 100
      ) => {
        set({ isLoadingMessages: true });

        try {
          const response = await ChatService.getMessages(chatId, skip, limit);

          console.log("📥 Store - getMessages response:", response);

          if (response) {
            // Response is already the array of messages
            set({
              messages: response,
              isLoadingMessages: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch messages";
          toast.error("Failed to load messages", {
            description: errorMessage,
          });
          set({ isLoadingMessages: false });
        }
      },

      // NOTE: sendMessage is deprecated - use useChatStreaming hook instead for real-time streaming
      // Messages are automatically saved after streaming completes

      clearMessages: async (chatId: string) => {
        set({ isUpdating: true });

        try {
          const updatedChat = await ChatService.clearMessages(chatId);

          if (updatedChat) {
            set({
              messages: [],
              isUpdating: false,
            });

            // Update current chat if it's the one being cleared
            set((state) => ({
              currentChat:
                state.currentChat?.id === chatId
                  ? updatedChat
                  : state.currentChat,
            }));

            // Update chat in chats list
            set((state) => ({
              chats: state.chats.map((chat) =>
                chat.id === chatId ? updatedChat : chat
              ),
            }));

            toast.success("Messages cleared successfully");
            return true;
          }

          set({ isUpdating: false });
          return false;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to clear messages";
          toast.error("Failed to clear messages", {
            description: errorMessage,
          });
          set({ isUpdating: false });
          return false;
        }
      },

      // UI Actions
      setCurrentChat: (chat: Chat | null) => {
        set({ currentChat: chat, selectedChatId: chat?.id || null });
        if (chat) {
          get().getMessages(chat.id);
        } else {
          set({ messages: [] });
        }
      },

      setSelectedChatId: (id: string | null) => {
        set({ selectedChatId: id });
        if (id) {
          const chat = get().chats.find((c) => c.id === id);
          if (chat) {
            get().setCurrentChat(chat);
          }
        }
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "chat-store",
    }
  )
);
