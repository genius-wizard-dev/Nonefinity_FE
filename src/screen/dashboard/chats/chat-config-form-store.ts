import { create } from "zustand";
import type { ChatConfigCreate, ChatConfigUpdate } from "./types";

export interface ChatConfigFormState {
  // Form Data
  formData: ChatConfigCreate | ChatConfigUpdate;

  // UI State
  isSubmitting: boolean;
  activeTab: string;

  // Actions
  setFormData: (data: ChatConfigCreate | ChatConfigUpdate) => void;
  updateField: <K extends keyof ChatConfigCreate>(
    field: K,
    value: ChatConfigCreate[K]
  ) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setActiveTab: (tab: string) => void;
  resetForm: () => void;
  initializeForm: (data?: ChatConfigCreate | ChatConfigUpdate) => void;
}

const defaultFormData: ChatConfigCreate = {
  name: "",
  chat_model_id: "",
  embedding_model_id: null,
  knowledge_store_id: null,
  dataset_ids: null,
  instruction_prompt: "",
  mcp_ids: null,
  selected_tools: null,
  middleware: null,
};

export const useChatConfigFormStore = create<ChatConfigFormState>((set) => ({
  formData: defaultFormData,
  isSubmitting: false,
  activeTab: "basic",

  setFormData: (data) => set({ formData: data }),

  updateField: (field, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [field]: value,
      },
    })),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  setActiveTab: (activeTab) => set({ activeTab }),

  resetForm: () =>
    set({
      formData: defaultFormData,
      isSubmitting: false,
      activeTab: "basic",
    }),

  initializeForm: (data) =>
    set({
      formData: data || defaultFormData,
      isSubmitting: false,
      activeTab: "basic", // Always start at basic tab
    }),
}));
