// Integration types matching backend API response

export interface IntegrationItem {
  id: string;
  name: string;
  status: "ENABLED" | "DISABLED";
  toolkit: {
    logo: string;
    slug: string;
  };
  auth_scheme?: string;
  is_login: boolean;
  tools?: Tool[];
}

export interface IntegrationListResponse {
  current_page: number;
  items: IntegrationItem[];
  total_items: number;
  total_pages: number;
  next_cursor?: string | null;
}

export interface ConnectAccountRequest {
  auth_config_id: string;
}

export interface ConnectAccountResponse {
  redirect_url: string;
}

// Store types
export interface IntegrationStoreState {
  integrations: IntegrationItem[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  stats: {
    total: number;
    connected: number;
    available: number;
  } | null;
  selectedIntegration: IntegrationDetail | null;
  tools: Tool[];
  isLoadingTools: boolean;
  selectedTools: Set<string>; // Set of tool slugs that are selected
}

export interface IntegrationStoreActions {
  fetchIntegrations: (token: string, force?: boolean) => Promise<void>;
  connectIntegration: (
    authConfigId: string,
    token: string
  ) => Promise<string | null>; // Returns redirect_url or null on error
  fetchTools: (
    integrationId: string,
    toolkitSlug: string,
    token: string
  ) => Promise<void>;
  setSelectedIntegration: (integration: IntegrationDetail) => void;
  toggleToolSelection: (toolSlug: string) => void;
  updateToolsInIntegration: (integrationId: string, toolkitSlug: string, toolSlugs: string[]) => void;
  clearSelectedIntegration: () => void;
  reset: () => void;
}

export interface IntegrationStore
  extends IntegrationStoreState,
    IntegrationStoreActions {}

// Tool types
export interface Tool {
  slug: string;
  name: string;
  description: string;
  is_selected?: boolean;
}

export interface IntegrationDetail {
  id: string;
  name: string;
  status: "ENABLED" | "DISABLED";
  toolkit: {
    logo: string;
    slug: string;
  };
  auth_scheme: string;
  is_login: boolean;
  tools?: Tool[];
}
