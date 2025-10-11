import { create } from "zustand";
import { CredentialService, ProviderService } from "./services";
import type { Credential, CredentialFormData, Provider } from "./type";

interface CredentialStore {
  // State
  providers: Provider[];
  credentials: Credential[];
  loading: boolean;
  error: string | null;

  // Provider actions
  fetchProviders: () => Promise<void>;

  // Credential actions
  fetchCredentials: () => Promise<void>;
  createCredential: (data: CredentialFormData) => Promise<void>;
  updateCredential: (
    id: string,
    data: Partial<CredentialFormData>
  ) => Promise<void>;
  deleteCredential: (id: string) => Promise<void>;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCredentialStore = create<CredentialStore>((set) => ({
  // Initial state
  providers: [],
  credentials: [],
  loading: false,
  error: null,

  // Provider actions
  fetchProviders: async () => {
    set({ loading: true, error: null });
    try {
      const providers = await ProviderService.getProviders(true);
      set({ providers, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch providers",
        loading: false,
      });
    }
  },

  // Credential actions
  fetchCredentials: async () => {
    set({ loading: true, error: null });
    try {
      const response = await CredentialService.getCredentials();
      if (response) {
        set({ credentials: response.credentials, loading: false });
      } else {
        set({ credentials: [], loading: false });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch credentials",
        loading: false,
      });
    }
  },

  createCredential: async (data: CredentialFormData) => {
    set({ error: null });
    try {
      const result = await CredentialService.createCredential(data);
      if (result.success) {
        // Refetch credentials to get the updated list with the new credential
        const response = await CredentialService.getCredentials();
        if (response) {
          set({ credentials: response.credentials });
        }
      } else {
        set({
          error: result.error || "Failed to create credential",
        });
        throw new Error(result.error || "Failed to create credential");
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create credential",
      });
      throw error;
    }
  },

  updateCredential: async (id: string, data: Partial<CredentialFormData>) => {
    set({ error: null });

    // Optimistic update
    set((state) => ({
      credentials: state.credentials.map((cred) =>
        cred.id === id ? { ...cred, ...data } : cred
      ),
    }));

    try {
      const result = await CredentialService.updateCredential(id, data);
      if (result.success) {
        // Refetch credentials to get the updated list
        const response = await CredentialService.getCredentials();
        if (response) {
          set({ credentials: response.credentials });
        }
      } else {
        // Revert on error
        const credentials = await CredentialService.getCredentials();
        set({
          credentials: credentials?.credentials || [],
          error: result.error || "Failed to update credential",
        });
        throw new Error(result.error || "Failed to update credential");
      }
    } catch (error) {
      // Revert on error
      const credentials = await CredentialService.getCredentials();
      set({
        credentials: credentials?.credentials || [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to update credential",
      });
      throw error;
    }
  },

  deleteCredential: async (id: string) => {
    set({ error: null });

    try {
      const result = await CredentialService.deleteCredential(id);
      if (result.success) {
        // Refetch credentials to get the updated list after successful deletion
        const response = await CredentialService.getCredentials();
        if (response) {
          set({ credentials: response.credentials });
        }
      } else {
        set({
          error: result.error || "Failed to delete credential",
        });
        throw new Error(result.error || "Failed to delete credential");
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete credential",
      });
      throw error;
    }
  },

  // Utility actions
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
