import { create } from "zustand";
import { ChatService } from "./services";
import type {
  ChatConfig,
  ChatConfigCreate,
  ChatConfigUpdate,
  ChatMessage,
  ChatSession,
  ChatSessionCreate,
} from "./types";
import type { GoogleSheet, GooglePDF } from "../drive/types";

interface ChatState {
  // Chat Configs
  configs: ChatConfig[];
  selectedConfig: ChatConfig | null;
  configsLoading: boolean;
  configsError: string | null;

  // Chat Sessions
  sessions: ChatSession[];
  selectedSession: ChatSession | null;
  sessionsLoading: boolean;
  sessionsError: string | null;

  // Messages
  messages: ChatMessage[];
  messagesLoading: boolean;

  // Google resources cache
  googleSheets: GoogleSheet[];
  googleSheetsLoading: boolean;
  googleSheetsLastFetch: number | null;
  googlePDFs: GooglePDF[];
  googlePDFsLoading: boolean;
  googlePDFsLastFetch: number | null;

  // Actions
  fetchConfigs: () => Promise<void>;
  createConfig: (data: ChatConfigCreate) => Promise<ChatConfig | null>;
  updateConfig: (id: string, data: ChatConfigUpdate) => Promise<ChatConfig | null>;
  selectConfig: (config: ChatConfig | null) => void;
  deleteConfig: (id: string) => Promise<void>;

  fetchSessions: (configId?: string) => Promise<void>;
  createSession: (data: ChatSessionCreate) => Promise<ChatSession | null>;
  selectSession: (session: ChatSession | null) => void;
  deleteSession: (id: string) => Promise<void>;
  deleteSessions: (ids: string[]) => Promise<number>;

  fetchSessionMessages: (sessionId: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;

  fetchGoogleSheets: (token: string, force?: boolean) => Promise<void>;
  fetchGooglePDFs: (token: string, force?: boolean) => Promise<void>;
  clearGoogleSheets: () => void;
  clearGooglePDFs: () => void;
  clearGoogleResources: () => void;

  reset: () => void;
}

const initialState = {
  configs: [],
  selectedConfig: null,
  configsLoading: false,
  configsError: null,
  sessions: [],
  selectedSession: null,
  sessionsLoading: false,
  sessionsError: null,
  messages: [],
  messagesLoading: false,
  googleSheets: [],
  googleSheetsLoading: false,
  googleSheetsLastFetch: null,
  googlePDFs: [],
  googlePDFsLoading: false,
  googlePDFsLastFetch: null,
};

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  fetchConfigs: async () => {
    set({ configsLoading: true, configsError: null });
    try {
      const data = await ChatService.listConfigs();
      if (data) {
        set({ configs: data.chat_configs, configsLoading: false });
      } else {
        set({ configsLoading: false, configsError: "Failed to fetch configs" });
      }
    } catch (error) {
      set({
        configsLoading: false,
        configsError: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  createConfig: async (data: ChatConfigCreate) => {
    try {
      const config = await ChatService.createConfig(data);
      if (config) {
        set((state) => ({
          configs: [config, ...state.configs],
        }));
        return config;
      }
      return null;
    } catch (error) {
      console.error("Failed to create config:", error);
      return null;
    }
  },

  updateConfig: async (id: string, data: ChatConfigUpdate) => {
    try {
      const config = await ChatService.updateConfig(id, data);
      if (config) {
        set((state) => ({
          configs: state.configs.map((c) => (c.id === id ? config : c)),
          selectedConfig:
            state.selectedConfig?.id === id ? config : state.selectedConfig,
        }));
        return config;
      }
      return null;
    } catch (error) {
      console.error("Failed to update config:", error);
      return null;
    }
  },

  selectConfig: (config: ChatConfig | null) => {
    set({ selectedConfig: config });
    if (config) {
      get().fetchSessions(config.id);
    }
  },

  deleteConfig: async (id: string) => {
    try {
      const success = await ChatService.deleteConfig(id);
      if (success) {
        set((state) => ({
          configs: state.configs.filter((c) => c.id !== id),
          selectedConfig:
            state.selectedConfig?.id === id ? null : state.selectedConfig,
        }));
      }
    } catch (error) {
      console.error("Failed to delete config:", error);
    }
  },

  fetchSessions: async (configId?: string) => {
    set({ sessionsLoading: true, sessionsError: null });
    try {
      const data = await ChatService.listSessions();
      if (data) {
        let sessions = data.chat_sessions;
        if (configId) {
          sessions = sessions.filter((s) => s.chat_config_id === configId);
        }
        set({ sessions, sessionsLoading: false });
      } else {
        set({
          sessionsLoading: false,
          sessionsError: "Failed to fetch sessions",
        });
      }
    } catch (error) {
      set({
        sessionsLoading: false,
        sessionsError: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  createSession: async (data: ChatSessionCreate) => {
    try {
      const session = await ChatService.createSession(data);
      if (session) {
        set((state) => ({
          sessions: [session, ...state.sessions],
        }));
        return session;
      }
      return null;
    } catch (error) {
      console.error("Failed to create session:", error);
      return null;
    }
  },

  selectSession: async (session: ChatSession | null) => {
    set({ selectedSession: session });
    if (session) {
      await get().fetchSessionMessages(session.id);
    } else {
      set({ messages: [] });
    }
  },

  deleteSession: async (id: string) => {
    try {
      const success = await ChatService.deleteSession(id);
      if (success) {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          selectedSession:
            state.selectedSession?.id === id ? null : state.selectedSession,
        }));
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  },

  deleteSessions: async (ids: string[]) => {
    try {
      const deletedCount = await ChatService.deleteSessions(ids);
      if (deletedCount > 0) {
        set((state) => ({
          sessions: state.sessions.filter((s) => !ids.includes(s.id)),
          selectedSession:
            state.selectedSession && ids.includes(state.selectedSession.id)
              ? null
              : state.selectedSession,
        }));
      }
      return deletedCount;
    } catch (error) {
      console.error("Failed to delete sessions:", error);
      return 0;
    }
  },

  fetchSessionMessages: async (sessionId: string) => {
    set({ messagesLoading: true });
    try {
      const session = await ChatService.getSession(sessionId);
      if (session && session.messages) {
        set({
          messages: session.messages.chat_messages,
          messagesLoading: false,
        });
      } else {
        set({ messages: [], messagesLoading: false });
      }
    } catch (error) {
      set({ messagesLoading: false });
      console.error("Failed to fetch messages:", error);
    }
  },

  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  fetchGoogleSheets: async (token: string, force = false) => {
    const state = get();
    // Don't fetch if already loading or if we have cached data and not forcing
    if (state.googleSheetsLoading) return;
    if (!force && state.googleSheets.length > 0 && state.googleSheetsLastFetch) {
      // Cache is valid for 5 minutes
      const cacheAge = Date.now() - state.googleSheetsLastFetch;
      if (cacheAge < 5 * 60 * 1000) return;
    }

    set({ googleSheetsLoading: true });
    try {
      const { DriveService } = await import("../drive/services");
      const response = await DriveService.listSheets(token, undefined, 100);
      set({
        googleSheets: response.files || [],
        googleSheetsLoading: false,
        googleSheetsLastFetch: Date.now(),
      });
    } catch (error) {
      console.error("Failed to fetch Google Sheets:", error);
      set({
        googleSheets: [],
        googleSheetsLoading: false,
      });
    }
  },

  fetchGooglePDFs: async (token: string, force = false) => {
    const state = get();
    if (state.googlePDFsLoading) return;
    if (!force && state.googlePDFs.length > 0 && state.googlePDFsLastFetch) {
      const cacheAge = Date.now() - state.googlePDFsLastFetch;
      if (cacheAge < 5 * 60 * 1000) return;
    }

    set({ googlePDFsLoading: true });
    try {
      const { PDFService } = await import("../drive/services");
      const response = await PDFService.listPDFs(token, undefined, 100);
      set({
        googlePDFs: response.files || [],
        googlePDFsLoading: false,
        googlePDFsLastFetch: Date.now(),
      });
    } catch (error) {
      console.error("Failed to fetch Google PDFs:", error);
      set({
        googlePDFs: [],
        googlePDFsLoading: false,
      });
    }
  },

  clearGoogleSheets: () => {
    set({
      googleSheets: [],
      googleSheetsLastFetch: null,
    });
  },

  clearGooglePDFs: () => {
    set({
      googlePDFs: [],
      googlePDFsLastFetch: null,
    });
  },

  clearGoogleResources: () => {
    set({
      googleSheets: [],
      googleSheetsLastFetch: null,
      googlePDFs: [],
      googlePDFsLastFetch: null,
    });
  },

  reset: () => {
    set(initialState);
  },
}));

// Selectors
export const useChatConfigs = () => useChatStore((state) => state.configs);
export const useSelectedConfig = () =>
  useChatStore((state) => state.selectedConfig);
export const useConfigsLoading = () =>
  useChatStore((state) => state.configsLoading);
export const useConfigsError = () =>
  useChatStore((state) => state.configsError);

export const useChatSessions = () => useChatStore((state) => state.sessions);
export const useSelectedSession = () =>
  useChatStore((state) => state.selectedSession);
export const useSessionsLoading = () =>
  useChatStore((state) => state.sessionsLoading);
export const useSessionsError = () =>
  useChatStore((state) => state.sessionsError);

export const useChatMessages = () => useChatStore((state) => state.messages);
export const useMessagesLoading = () =>
  useChatStore((state) => state.messagesLoading);

export const useGoogleSheets = () => useChatStore((state) => state.googleSheets);
export const useGoogleSheetsLoading = () =>
  useChatStore((state) => state.googleSheetsLoading);
export const useGooglePDFs = () => useChatStore((state) => state.googlePDFs);
export const useGooglePDFsLoading = () =>
  useChatStore((state) => state.googlePDFsLoading);
