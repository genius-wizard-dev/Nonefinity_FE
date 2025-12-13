import { create } from "zustand";
import { DatasetService } from "../dataset-management/services";
import type { Dataset } from "../dataset-management/types";
import { DriveService, PDFService } from "../file-management/services";
import type { GooglePDF, GoogleSheet } from "../file-management/types";
import { MCPService } from "../mcp/mcp-service";
import { ModelService } from "../models/service";
import type { Model } from "../models/type";
import { ChatService } from "./services";
import type {
  ChatConfig,
  ChatConfigCreate,
  ChatConfigUpdate,
  ChatMessage,
  ChatSession,
  ChatSessionCreate,
  IntegrationConfig,
  ToolItem,
} from "./types";

// MCP config type for the store (simplified from MCPListItem)
export interface MCPConfigStore {
  id: string;
  name: string;
  description?: string;
  server_name: string;
  transport: string;
  tools_count: number;
}

interface ChatState {
  // Chat Configs
  configs: ChatConfig[];
  selectedConfig: ChatConfig | null;
  configsLoading: boolean;
  configsError: string | null;
  configsLastFetch: number | null;

  // UI state
  configActiveTab: string;

  // Chat Sessions
  sessions: ChatSession[];
  selectedSession: ChatSession | null;
  sessionsLoading: boolean;
  sessionsError: string | null;
  sessionsLastFetch: number | null;

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

  // Models cache
  chatModels: Model[];
  chatModelsLoading: boolean;
  chatModelsLastFetch: number | null;
  embeddingModels: Model[];
  embeddingModelsLoading: boolean;
  embeddingModelsLastFetch: number | null;

  // Datasets cache
  datasets: Dataset[];
  datasetsLoading: boolean;
  datasetsLastFetch: number | null;

  // Integrations cache
  integrations: IntegrationConfig[];
  integrationsLoading: boolean;
  integrationsLastFetch: number | null;

  // Integration tools cache (batch loaded)
  integrationTools: Record<string, ToolItem[]>;
  integrationToolsLoading: boolean;
  integrationToolsLastFetch: number | null;

  // MCPs cache
  mcps: MCPConfigStore[];
  mcpsLoading: boolean;
  mcpsLastFetch: number | null;

  // Actions
  fetchConfigs: (force?: boolean) => Promise<void>;
  refreshConfigs: () => Promise<void>;
  createConfig: (data: ChatConfigCreate) => Promise<ChatConfig | null>;
  updateConfig: (
    id: string,
    data: ChatConfigUpdate
  ) => Promise<ChatConfig | null>;
  selectConfig: (config: ChatConfig | null) => void;
  deleteConfig: (id: string) => Promise<void>;

  fetchSessions: (configId?: string, force?: boolean) => Promise<void>;
  refreshSessions: (configId?: string) => Promise<void>;
  createSession: (data: ChatSessionCreate) => Promise<ChatSession | null>;
  selectSession: (session: ChatSession | null) => void;
  deleteSession: (id: string) => Promise<void>;
  deleteSessions: (ids: string[]) => Promise<number>;

  fetchSessionMessages: (sessionId: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  removeLastMessage: () => void;
  clearMessages: () => void;

  fetchGoogleSheets: (token: string, force?: boolean) => Promise<void>;
  fetchGooglePDFs: (token: string, force?: boolean) => Promise<void>;
  clearGoogleSheets: () => void;
  clearGooglePDFs: () => void;
  clearGoogleResources: () => void;

  // New actions for cached data
  fetchChatModels: (force?: boolean) => Promise<void>;
  fetchEmbeddingModels: (force?: boolean) => Promise<void>;
  fetchDatasets: (force?: boolean) => Promise<void>;
  fetchIntegrations: (force?: boolean) => Promise<void>;
  fetchIntegrationToolsBatch: (force?: boolean) => Promise<void>;
  fetchMcps: (token: string, force?: boolean) => Promise<void>;

  // UI actions
  setConfigActiveTab: (tab: string) => void;
  resetConfigActiveTab: () => void;

  reset: () => void;
}

const initialState = {
  configs: [],
  selectedConfig: null,
  configsLoading: false,
  configsError: null,
  configsLastFetch: null,
  configActiveTab: "basic",
  sessions: [],
  selectedSession: null,
  sessionsLoading: false,
  sessionsError: null,
  sessionsLastFetch: null,
  messages: [],
  messagesLoading: false,
  googleSheets: [],
  googleSheetsLoading: false,
  googleSheetsLastFetch: null,
  googlePDFs: [],
  googlePDFsLoading: false,
  googlePDFsLastFetch: null,
  // New cached data
  chatModels: [],
  chatModelsLoading: false,
  chatModelsLastFetch: null,
  embeddingModels: [],
  embeddingModelsLoading: false,
  embeddingModelsLastFetch: null,
  datasets: [],
  datasetsLoading: false,
  datasetsLastFetch: null,
  integrations: [],
  integrationsLoading: false,
  integrationsLastFetch: null,
  integrationTools: {},
  integrationToolsLoading: false,
  integrationToolsLastFetch: null,
  mcps: [],
  mcpsLoading: false,
  mcpsLastFetch: null,
};

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  fetchConfigs: async (force = false) => {
    const state = get();
    // Don't fetch if already loading
    if (state.configsLoading) return;

    // Check cache validity (5 minutes)
    if (!force && state.configs.length > 0 && state.configsLastFetch) {
      const cacheAge = Date.now() - state.configsLastFetch;
      if (cacheAge < 5 * 60 * 1000) return;
    }

    set({ configsLoading: true, configsError: null });
    try {
      const data = await ChatService.listConfigs();
      if (data) {
        set({
          configs: data.chat_configs,
          configsLoading: false,
          configsLastFetch: Date.now(),
        });
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

  refreshConfigs: async () => {
    await get().fetchConfigs(true);
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

  fetchSessions: async (configId?: string, force = false) => {
    const state = get();
    if (state.sessionsLoading) return;

    if (!force && state.sessions.length > 0 && state.sessionsLastFetch) {
      // If filtering by configId, check if we have sessions for that config
      if (configId) {
        const hasSessionsForConfig = state.sessions.some(
          (s) => s.chat_config_id === configId
        );
        if (hasSessionsForConfig) {
          const cacheAge = Date.now() - state.sessionsLastFetch;
          if (cacheAge < 5 * 60 * 1000) return;
        }
      } else {
        const cacheAge = Date.now() - state.sessionsLastFetch;
        if (cacheAge < 5 * 60 * 1000) return;
      }
    }

    set({ sessionsLoading: true, sessionsError: null });
    try {
      const data = await ChatService.listSessions();
      if (data) {
        let sessions = data.chat_sessions;
        // logic below filters by configId if provided but actually lists ALL sessions then filters
        // optimization: maybe backend supports filtering? For now stick to existing logic but filter in-memory
        if (configId) {
          sessions = sessions.filter((s) => s.chat_config_id === configId);
        }
        set({
          sessions,
          sessionsLoading: false,
          sessionsLastFetch: Date.now(),
        });
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

  refreshSessions: async (configId?: string) => {
    await get().fetchSessions(configId, true);
  },

  createSession: async (data: ChatSessionCreate) => {
    try {
      const session = await ChatService.createSession(data);
      if (session) {
        set((state) => {
          // Update the config's is_used status locally
          const updatedConfigs = state.configs.map((config) =>
            config.id === data.chat_config_id
              ? { ...config, is_used: true }
              : config
          );

          return {
            sessions: [session, ...state.sessions],
            configs: updatedConfigs,
          };
        });
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
        // Refresh configs to update is_used status
        get().fetchConfigs(true);
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
        // Refresh configs to update is_used status
        get().fetchConfigs(true);
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

  removeLastMessage: () => {
    set((state) => ({
      messages: state.messages.slice(0, -1),
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  fetchGoogleSheets: async (token: string, force = false) => {
    const state = get();
    // Don't fetch if already loading or if we have cached data and not forcing
    if (state.googleSheetsLoading) return;
    if (
      !force &&
      state.googleSheets.length > 0 &&
      state.googleSheetsLastFetch
    ) {
      // Cache is valid for 5 minutes
      const cacheAge = Date.now() - state.googleSheetsLastFetch;
      if (cacheAge < 5 * 60 * 1000) return;
    }

    set({ googleSheetsLoading: true });
    try {
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

  // New cached data fetch actions
  fetchChatModels: async (force = false) => {
    const state = get();
    if (state.chatModelsLoading) return;
    if (!force && state.chatModels.length > 0 && state.chatModelsLastFetch) {
      const cacheAge = Date.now() - state.chatModelsLastFetch;
      if (cacheAge < 5 * 60 * 1000) return; // 5 minutes cache
    }

    set({ chatModelsLoading: true });
    try {
      const data = await ModelService.listModels({
        type: "chat",
        active_only: true,
      });
      set({
        chatModels: data?.models || [],
        chatModelsLoading: false,
        chatModelsLastFetch: Date.now(),
      });
    } catch (error) {
      console.error("Failed to fetch chat models:", error);
      set({ chatModelsLoading: false });
    }
  },

  fetchEmbeddingModels: async (force = false) => {
    const state = get();
    if (state.embeddingModelsLoading) return;
    if (
      !force &&
      state.embeddingModels.length > 0 &&
      state.embeddingModelsLastFetch
    ) {
      const cacheAge = Date.now() - state.embeddingModelsLastFetch;
      if (cacheAge < 5 * 60 * 1000) return;
    }

    set({ embeddingModelsLoading: true });
    try {
      const data = await ModelService.listModels({
        type: "embedding",
        active_only: true,
      });
      set({
        embeddingModels: data?.models || [],
        embeddingModelsLoading: false,
        embeddingModelsLastFetch: Date.now(),
      });
    } catch (error) {
      console.error("Failed to fetch embedding models:", error);
      set({ embeddingModelsLoading: false });
    }
  },

  fetchDatasets: async (force = false) => {
    const state = get();
    if (state.datasetsLoading) return;
    if (!force && state.datasets.length > 0 && state.datasetsLastFetch) {
      const cacheAge = Date.now() - state.datasetsLastFetch;
      if (cacheAge < 5 * 60 * 1000) return;
    }

    set({ datasetsLoading: true });
    try {
      const data = await DatasetService.getDatasets(1, 100);
      set({
        datasets: data || [],
        datasetsLoading: false,
        datasetsLastFetch: Date.now(),
      });
    } catch (error) {
      console.error("Failed to fetch datasets:", error);
      set({ datasetsLoading: false });
    }
  },

  fetchIntegrations: async (force = false) => {
    const state = get();
    if (state.integrationsLoading) return;
    if (
      !force &&
      state.integrations.length > 0 &&
      state.integrationsLastFetch
    ) {
      const cacheAge = Date.now() - state.integrationsLastFetch;
      if (cacheAge < 5 * 60 * 1000) return;
    }

    set({ integrationsLoading: true });
    try {
      const data = await ChatService.getIntegrationConfigs();
      set({
        integrations: data || [],
        integrationsLoading: false,
        integrationsLastFetch: Date.now(),
      });
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
      set({ integrationsLoading: false });
    }
  },

  fetchIntegrationToolsBatch: async (force = false) => {
    const state = get();
    if (state.integrationToolsLoading) return;

    // Check cache validity
    if (
      !force &&
      Object.keys(state.integrationTools).length > 0 &&
      state.integrationToolsLastFetch
    ) {
      const cacheAge = Date.now() - state.integrationToolsLastFetch;
      if (cacheAge < 5 * 60 * 1000) return;
    }

    // Need integrations first
    if (state.integrations.length === 0) {
      // Wait for integrations to be fetched first
      return;
    }

    set({ integrationToolsLoading: true });
    try {
      const integrationIds = state.integrations.map((i) => i.id);
      const toolsMap = await ChatService.getAvailableToolsBatch(integrationIds);
      set({
        integrationTools: toolsMap || {},
        integrationToolsLoading: false,
        integrationToolsLastFetch: Date.now(),
      });
    } catch (error) {
      console.error("Failed to fetch integration tools batch:", error);
      set({ integrationToolsLoading: false });
    }
  },

  fetchMcps: async (token: string, force = false) => {
    const state = get();
    if (state.mcpsLoading) return;
    if (!force && state.mcps.length > 0 && state.mcpsLastFetch) {
      const cacheAge = Date.now() - state.mcpsLastFetch;
      if (cacheAge < 5 * 60 * 1000) return;
    }

    set({ mcpsLoading: true });
    try {
      const data = await MCPService.getMCPs(token);
      const mcpConfigs: MCPConfigStore[] = (data || []).map((mcp) => ({
        id: mcp.id,
        name: mcp.name,
        description: mcp.description,
        server_name: mcp.server_name,
        transport: mcp.transport,
        tools_count: mcp.tools_count,
      }));
      set({
        mcps: mcpConfigs,
        mcpsLoading: false,
        mcpsLastFetch: Date.now(),
      });
    } catch (error) {
      console.error("Failed to fetch MCPs:", error);
      set({ mcpsLoading: false });
    }
  },

  setConfigActiveTab: (tab: string) => {
    set({ configActiveTab: tab });
  },

  resetConfigActiveTab: () => {
    set({ configActiveTab: "basic" });
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

export const useGoogleSheets = () =>
  useChatStore((state) => state.googleSheets);
export const useGoogleSheetsLoading = () =>
  useChatStore((state) => state.googleSheetsLoading);
export const useGooglePDFs = () => useChatStore((state) => state.googlePDFs);
export const useGooglePDFsLoading = () =>
  useChatStore((state) => state.googlePDFsLoading);

// New selectors for cached data
export const useChatModels = () => useChatStore((state) => state.chatModels);
export const useChatModelsLoading = () =>
  useChatStore((state) => state.chatModelsLoading);
export const useEmbeddingModels = () =>
  useChatStore((state) => state.embeddingModels);
export const useEmbeddingModelsLoading = () =>
  useChatStore((state) => state.embeddingModelsLoading);
export const useDatasets = () => useChatStore((state) => state.datasets);
export const useDatasetsLoading = () =>
  useChatStore((state) => state.datasetsLoading);
export const useIntegrations = () =>
  useChatStore((state) => state.integrations);
export const useIntegrationsLoading = () =>
  useChatStore((state) => state.integrationsLoading);
export const useIntegrationTools = () =>
  useChatStore((state) => state.integrationTools);
export const useIntegrationToolsLoading = () =>
  useChatStore((state) => state.integrationToolsLoading);
export const useMcps = () => useChatStore((state) => state.mcps);
export const useMcpsLoading = () => useChatStore((state) => state.mcpsLoading);
