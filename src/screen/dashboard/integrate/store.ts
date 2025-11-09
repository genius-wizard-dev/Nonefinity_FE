import { create } from "zustand";
import { IntegrationService } from "./services";
import type { IntegrationDetail, IntegrationStore } from "./types";

export const useIntegrationStore = create<IntegrationStore>((set, get) => ({
  integrations: [],
  isLoading: false,
  error: null,
  lastFetchTime: null,
  stats: null,
  selectedIntegration: null,
  tools: [],
  isLoadingTools: false,
  selectedTools: new Set<string>(),

  fetchIntegrations: async (token: string, force = false) => {
    const { lastFetchTime } = get();
    const now = Date.now();

    // Don't fetch if we have recent data (within 30 seconds) and not forced
    if (!force && lastFetchTime && now - lastFetchTime < 30000) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await IntegrationService.getIntegrations(token);

      if (!response) {
        set({
          error: "Failed to fetch integrations",
          isLoading: false,
        });
        return;
      }

      const integrations = response.items || [];
      const connected = integrations.filter((item) => item.is_login).length;
      const available = integrations.length;

      // Clear tools cache when refreshing integrations
      const integrationsWithoutTools = integrations.map((item) => ({
        ...item,
        tools: undefined,
      }));

      set({
        integrations: integrationsWithoutTools,
        isLoading: false,
        lastFetchTime: now,
        error: null,
        stats: {
          total: response.total_items || available,
          connected,
          available,
        },
        // Clear selected integration and tools when refreshing
        selectedIntegration: null,
        tools: [],
      });
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch integrations";
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  connectIntegration: async (authConfigId: string, token: string) => {
    try {
      const redirectUrl = await IntegrationService.connectAccount(
        authConfigId,
        token
      );
      if (!redirectUrl) {
        set({
          error: "Failed to initiate connection",
        });
        return null;
      }

      return redirectUrl;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to connect integration";
      set({
        error: errorMessage,
      });
      return null;
    }
  },

  fetchTools: async (
    integrationId: string,
    toolkitSlug: string,
    token: string
  ) => {
    // Prevent multiple simultaneous calls
    const { isLoadingTools, selectedIntegration } = get();
    if (isLoadingTools && selectedIntegration?.id === integrationId) {
      return;
    }

    // Check if we already have this integration's tools cached in integrations array
    const { integrations } = get();
    const integration = integrations.find((i) => i.id === integrationId);

    if (!integration) {
      set({
        error: "Integration not found",
        isLoadingTools: false,
      });
      return;
    }

    // Set selectedIntegration immediately with basic info (for drawer to show)
    const integrationDetail: IntegrationDetail = {
      id: integration.id,
      name: integration.name,
      status: integration.status,
      toolkit: integration.toolkit,
      auth_scheme: integration.auth_scheme || "",
      is_login: integration.is_login,
      tools: integration.tools,
    };

    // If tools are cached, use them directly
    if (integration.tools && integration.tools.length > 0) {
      // Set selectedTools based on is_selected from cached tools
      const selectedToolsSet = new Set<string>();
      integration.tools.forEach((tool) => {
        if (tool.is_selected) {
          selectedToolsSet.add(tool.slug);
        }
      });

      set({
        selectedIntegration: integrationDetail,
        tools: integration.tools,
        selectedTools: selectedToolsSet,
        isLoadingTools: false,
        error: null,
      });
      return;
    }

    // Set selectedIntegration with basic info first (drawer will show loading)
    set({
      selectedIntegration: integrationDetail,
      isLoadingTools: true,
      error: null,
    });

    try {
      const toolsData = await IntegrationService.getTools(toolkitSlug, token);

      if (!toolsData) {
        set({
          error: "Failed to fetch tools",
          isLoadingTools: false,
        });
        return;
      }

      // Find the integration from the list
      if (!integration) {
        set({
          error: "Integration not found",
          isLoadingTools: false,
        });
        return;
      }

      // Update the integration in the integrations array with tools
      const updatedIntegrations = integrations.map((i) =>
        i.id === integrationId ? { ...i, tools: toolsData } : i
      );

      // Create integration detail with tools
      const integrationDetail: IntegrationDetail = {
        id: integration.id,
        name: integration.name,
        status: integration.status,
        toolkit: integration.toolkit,
        auth_scheme: integration.auth_scheme || "",
        is_login: integration.is_login,
        tools: toolsData,
      };

      // Set selectedTools based on is_selected from API
      const selectedToolsSet = new Set<string>();
      toolsData.forEach((tool) => {
        if (tool.is_selected) {
          selectedToolsSet.add(tool.slug);
        }
      });

      set({
        integrations: updatedIntegrations,
        selectedIntegration: integrationDetail,
        tools: toolsData,
        selectedTools: selectedToolsSet,
        isLoadingTools: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch tools";
      set({
        error: errorMessage,
        isLoadingTools: false,
      });
    }
  },

  setSelectedIntegration: (integration: IntegrationDetail) => {
    set({
      selectedIntegration: integration,
    });
  },

  toggleToolSelection: (toolSlug: string) => {
    const { selectedTools } = get();
    const newSelectedTools = new Set(selectedTools);

    if (newSelectedTools.has(toolSlug)) {
      newSelectedTools.delete(toolSlug);
    } else {
      newSelectedTools.add(toolSlug);
    }

    set({
      selectedTools: newSelectedTools,
    });
  },

  updateToolsInIntegration: (integrationId: string, toolkitSlug: string, toolSlugs: string[]) => {
    const { integrations, tools, selectedIntegration } = get();

    // Update tools with is_selected based on toolSlugs
    const updatedTools = tools.map((tool) => ({
      ...tool,
      is_selected: toolSlugs.includes(tool.slug),
    }));

    // Update integration in integrations array (store all tools with is_selected status)
    const updatedIntegrations = integrations.map((i) =>
      i.id === integrationId && i.toolkit?.slug === toolkitSlug
        ? { ...i, tools: updatedTools }
        : i
    );

    // Update selectedIntegration if it matches
    let updatedSelectedIntegration = selectedIntegration;
    if (selectedIntegration && selectedIntegration.id === integrationId && selectedIntegration.toolkit?.slug === toolkitSlug) {
      updatedSelectedIntegration = {
        ...selectedIntegration,
        tools: updatedTools,
      };
    }

    // Update selectedTools to match the new is_selected status
    const newSelectedTools = new Set<string>(toolSlugs);

    set({
      integrations: updatedIntegrations,
      selectedIntegration: updatedSelectedIntegration,
      tools: updatedTools,
      selectedTools: newSelectedTools,
    });
  },

  clearSelectedIntegration: () => {
    set({
      selectedIntegration: null,
      tools: [],
    });
  },

  reset: () => {
    set({
      integrations: [],
      isLoading: false,
      error: null,
      lastFetchTime: null,
      stats: null,
      selectedIntegration: null,
      tools: [],
      isLoadingTools: false,
      selectedTools: new Set<string>(),
    });
  },
}));
