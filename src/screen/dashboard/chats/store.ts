import { toast } from "sonner";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { ChatService } from "./services";
import type {
  Chat,
  ChatMessage,
  ChatStore,
  CreateChatRequest,
  UpdateChatRequest,
} from "./type";

const initialState = {
  // Data
  chats: [],
  currentChat: null,
  messages: [],
  // Caching
  lastFetchTime: 0,
  messagesCache: {} as Record<
    string,
    { data: ChatMessage[]; lastFetchTime: number }
  >,

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
    persist(
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

              // Force refresh: mark cache stale then refresh list to include new chat
              set({ lastFetchTime: 0 });
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
          const TTL_MS = 30_000; // 30s TTL for chat list
          const cacheKey = `chats-${skip}-${limit}`;

          set({ isLoading: true });

          try {
            const state = get();
            const now = Date.now();
            const isSamePage =
              Math.floor(skip / limit) + 1 === state.pagination.page &&
              limit === state.pagination.pageSize;
            const isFresh = now - (state.lastFetchTime || 0) < TTL_MS;

            if (state.chats.length > 0 && isSamePage && isFresh) {
              // Serve cache immediately; background revalidate
              set({ isLoading: false });
              (async () => {
                try {
                  const resp = await ChatService.getChats(skip, limit);
                  if (resp) {
                    set({
                      chats: resp.chats || [],
                      pagination: {
                        page: Math.floor(skip / limit) + 1,
                        pageSize: limit,
                        total: resp.total,
                        totalPages: Math.ceil(resp.total / limit),
                      },
                      lastFetchTime: Date.now(),
                    });
                  }
                } catch (e) {
                  console.warn("Background revalidation (chats) failed:", e);
                }
              })();
              return;
            }

            // Check for pending request to avoid duplicate calls
            if (state._pendingRequests?.has(cacheKey)) {
              await state._pendingRequests.get(cacheKey);
              return;
            }

            // Create request promise
            const requestPromise = ChatService.getChats(skip, limit);

            // Store pending request
            set((s) => ({
              _pendingRequests: new Map(s._pendingRequests || new Map()).set(
                cacheKey,
                requestPromise
              ),
            }));

            const response = await requestPromise;
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
                lastFetchTime: Date.now(),
              });
            }

            // Clear pending request
            set((s) => {
              const newPending = new Map(s._pendingRequests || new Map());
              newPending.delete(cacheKey);
              return { _pendingRequests: newPending };
            });
          } catch (error) {
            console.error("❌ Chat Store - getChats error:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Failed to fetch chats";
            toast.error("Failed to load chats", {
              description: errorMessage,
            });
            set({ isLoading: false });

            // Clear pending request on error
            set((s) => {
              const newPending = new Map(s._pendingRequests || new Map());
              newPending.delete(cacheKey);
              return { _pendingRequests: newPending };
            });
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
          const TTL_MS = 30_000; // 30s TTL for messages
          set({ isLoadingMessages: true });

          try {
            const state = get();
            const cached = state.messagesCache[chatId];
            const now = Date.now();
            const isFresh =
              cached && now - (cached.lastFetchTime || 0) < TTL_MS;

            if (cached && isFresh) {
              // Serve cached messages immediately
              set({
                messages: cached.data,
                isLoadingMessages: false,
              });
              // Background revalidation
              (async () => {
                try {
                  const resp = await ChatService.getMessages(
                    chatId,
                    skip,
                    limit
                  );
                  if (resp) {
                    set((s) => ({
                      messagesCache: {
                        ...s.messagesCache,
                        [chatId]: {
                          data: resp.data,
                          lastFetchTime: Date.now(),
                        },
                      },
                    }));
                    // Only update visible messages if still on same chat
                    const cur = get();
                    if (cur.currentChat?.id === chatId) {
                      set({ messages: resp.data });
                    }
                  }
                } catch (e) {
                  console.warn("Background revalidation (messages) failed:", e);
                }
              })();
              return;
            }

            const response = await ChatService.getMessages(chatId, skip, limit);

            if (response) {
              set({
                messages: response.data,
                isLoadingMessages: false,
                messagesCache: {
                  ...state.messagesCache,
                  [chatId]: {
                    data: response.data,
                    lastFetchTime: Date.now(),
                  },
                },
              });
            } else {
              set({ isLoadingMessages: false });
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch messages";
            toast.error("Failed to load messages", {
              description: errorMessage,
            });
            set({ isLoadingMessages: false });
          }
         },

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
              error instanceof Error
                ? error.message
                : "Failed to clear messages";
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

        // Handle rehydration from localStorage
        _hasHydrated: false,
      }),
      {
        name: "chat-store",
        // Only persist essential data, not loading states
        partialize: (state) => ({
          chats: state.chats,
          currentChat: state.currentChat,
          messages: state.messages,
          messagesCache: state.messagesCache,
          selectedChatId: state.selectedChatId,
          sidebarOpen: state.sidebarOpen,
          pagination: state.pagination,
          lastFetchTime: state.lastFetchTime,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state._hasHydrated = true;
          }
        },
      }
    ),
    {
      name: "chat-store-devtools",
    }
  )
);
