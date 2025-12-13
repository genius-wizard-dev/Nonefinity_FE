import { create } from "zustand";

/**
 * Separate store for chat streaming state to avoid re-rendering the entire chat
 * when streaming data changes. This prevents lag when receiving large JSON/data from backend.
 */

export interface StreamingToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  // Store content as a reference ID instead of the full data to prevent re-renders
  contentRef?: string;
}

export interface StreamingMessage {
  id: string;
  content: string;
  tools: StreamingToolCall[];
  isThinking: boolean;
}

// Separate store for large tool content data - this is kept separate to avoid
// triggering re-renders when only content changes
interface ToolContentStore {
  contents: Map<string, unknown>;
  setContent: (id: string, content: unknown) => void;
  getContent: (id: string) => unknown | undefined;
  clearContent: (id: string) => void;
  clearAllContents: () => void;
}

export const useToolContentStore = create<ToolContentStore>((set, get) => ({
  contents: new Map(),

  setContent: (id: string, content: unknown) => {
    const contents = new Map(get().contents);
    contents.set(id, content);
    set({ contents });
  },

  getContent: (id: string) => {
    return get().contents.get(id);
  },

  clearContent: (id: string) => {
    const contents = new Map(get().contents);
    contents.delete(id);
    set({ contents });
  },

  clearAllContents: () => {
    set({ contents: new Map() });
  },
}));

interface StreamingState {
  // Current streaming message
  streamingMessage: StreamingMessage | null;

  // UI state
  isStreaming: boolean;
  isThinking: boolean;
  errorMessage: string | null;

  // Actions
  startStreaming: () => void;
  ensureStreaming: () => void; // Safe to call multiple times, won't reset state
  stopStreaming: () => void;
  setThinking: (thinking: boolean) => void;
  setError: (error: string | null) => void;

  // Content updates - optimized to avoid full re-renders
  appendContent: (content: string) => void;
  setContent: (content: string) => void;

  // Tool updates
  addTool: (tool: Omit<StreamingToolCall, "contentRef">) => void;
  updateToolState: (toolId: string, state: StreamingToolCall["state"]) => void;
  setToolContent: (toolId: string, content: unknown) => void;

  // Reset
  reset: () => void;
}

const initialStreamingMessage: StreamingMessage = {
  id: "streaming",
  content: "",
  tools: [],
  isThinking: false,
};

export const useChatStreamingStore = create<StreamingState>((set) => ({
  streamingMessage: null,
  isStreaming: false,
  isThinking: false,
  errorMessage: null,

  startStreaming: () => {
    // Clear any previous tool content
    useToolContentStore.getState().clearAllContents();

    set({
      isStreaming: true,
      isThinking: true,
      errorMessage: null,
      streamingMessage: { ...initialStreamingMessage },
    });
  },

  // Safe to call multiple times - won't reset existing tools/content
  ensureStreaming: () => {
    set((state) => {
      // If already streaming with a message, don't reset
      if (state.isStreaming && state.streamingMessage) {
        return state;
      }
      // Otherwise start fresh
      useToolContentStore.getState().clearAllContents();
      return {
        isStreaming: true,
        isThinking: true,
        errorMessage: null,
        streamingMessage: { ...initialStreamingMessage },
      };
    });
  },

  stopStreaming: () => {
    set({
      isStreaming: false,
      isThinking: false,
      streamingMessage: null,
    });
  },

  setThinking: (thinking: boolean) => {
    set((state) => ({
      isThinking: thinking,
      streamingMessage: state.streamingMessage
        ? { ...state.streamingMessage, isThinking: thinking }
        : null,
    }));
  },

  setError: (error: string | null) => {
    set({ errorMessage: error });
    if (error) {
      set({ isStreaming: false, isThinking: false });
    }
  },

  appendContent: (content: string) => {
    set((state) => {
      if (!state.streamingMessage) return state;
      return {
        isThinking: false,
        streamingMessage: {
          ...state.streamingMessage,
          content: state.streamingMessage.content + content,
          isThinking: false,
        },
      };
    });
  },

  setContent: (content: string) => {
    set((state) => {
      if (!state.streamingMessage) return state;
      return {
        isThinking: false,
        streamingMessage: {
          ...state.streamingMessage,
          content,
          isThinking: false,
        },
      };
    });
  },

  addTool: (tool) => {
    set((state) => {
      if (!state.streamingMessage) return state;

      // Check if tool already exists
      const existingIndex = state.streamingMessage.tools.findIndex(
        (t) => t.id === tool.id
      );

      if (existingIndex >= 0) {
        // Update existing tool
        const newTools = [...state.streamingMessage.tools];
        newTools[existingIndex] = { ...newTools[existingIndex], ...tool };
        return {
          isThinking: false,
          streamingMessage: {
            ...state.streamingMessage,
            tools: newTools,
            isThinking: false,
          },
        };
      }

      return {
        isThinking: false,
        streamingMessage: {
          ...state.streamingMessage,
          tools: [...state.streamingMessage.tools, tool],
          isThinking: false,
        },
      };
    });
  },

  updateToolState: (toolId: string, newState: StreamingToolCall["state"]) => {
    set((state) => {
      if (!state.streamingMessage) return state;

      const newTools = state.streamingMessage.tools.map((t) =>
        t.id === toolId ? { ...t, state: newState } : t
      );

      return {
        streamingMessage: {
          ...state.streamingMessage,
          tools: newTools,
        },
      };
    });
  },

  setToolContent: (toolId: string, content: unknown) => {
    // Store content in separate store to avoid re-renders
    const contentRef = `tool-content-${toolId}`;
    useToolContentStore.getState().setContent(contentRef, content);

    set((state) => {
      if (!state.streamingMessage) return state;

      const newTools = state.streamingMessage.tools.map((t) =>
        t.id === toolId
          ? { ...t, state: "output-available" as const, contentRef }
          : t
      );

      return {
        streamingMessage: {
          ...state.streamingMessage,
          tools: newTools,
        },
      };
    });
  },

  reset: () => {
    useToolContentStore.getState().clearAllContents();
    set({
      streamingMessage: null,
      isStreaming: false,
      isThinking: false,
      errorMessage: null,
    });
  },
}));

// Selectors for optimal re-rendering
export const useIsStreaming = () =>
  useChatStreamingStore((state) => state.isStreaming);
export const useIsThinking = () =>
  useChatStreamingStore((state) => state.isThinking);
export const useStreamingError = () =>
  useChatStreamingStore((state) => state.errorMessage);
export const useStreamingMessage = () =>
  useChatStreamingStore((state) => state.streamingMessage);
export const useStreamingContent = () =>
  useChatStreamingStore((state) => state.streamingMessage?.content ?? "");
export const useStreamingTools = () =>
  useChatStreamingStore((state) => state.streamingMessage?.tools ?? []);

// Hook to get tool content lazily (only when expanded)
export const useToolContent = (contentRef?: string) => {
  return useToolContentStore((state) =>
    contentRef ? state.contents.get(contentRef) : undefined
  );
};
