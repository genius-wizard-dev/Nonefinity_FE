import { Cloud, FileSpreadsheet, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IntegrationProvider } from "../types";

// Resource type definition
export interface ResourceTypeConfig {
  type: string;
  label: string;
  icon: LucideIcon;
  placeholder: string;
  emptyMessage: string;
}

// Integration provider definition
export interface IntegrationProviderConfig {
  provider: IntegrationProvider;
  name: string;
  description: string;
  icon: LucideIcon;
  oauthProvider: string; // Clerk OAuth provider name
  resourceTypes: Record<string, ResourceTypeConfig>;
  checkConnection: (user: any) => boolean; // Function to check if user has connection
}

// Integration Registry
export const INTEGRATION_REGISTRY: Record<
  IntegrationProvider,
  IntegrationProviderConfig
> = {
  google: {
    provider: "google",
    name: "Google",
    description: "Connect to Google services for real-time data updates",
    icon: Cloud,
    oauthProvider: "google",
    resourceTypes: {
      sheets: {
        type: "sheets",
        label: "Google Sheet",
        icon: FileSpreadsheet,
        placeholder: "Select a Google Sheet",
        emptyMessage: "No sheets available",
      },
      pdfs: {
        type: "pdfs",
        label: "Google PDF",
        icon: FileText,
        placeholder: "Select a Google PDF",
        emptyMessage: "No PDFs available",
      },
    },
    checkConnection: (user) => {
      return user?.externalAccounts?.some(
        (account: any) => account.provider === "google"
      );
    },
  },
};

// Helper functions
export const getIntegrationConfig = (
  provider: IntegrationProvider
): IntegrationProviderConfig => {
  return INTEGRATION_REGISTRY[provider];
};

export const getAllIntegrationProviders = (): IntegrationProviderConfig[] => {
  return Object.values(INTEGRATION_REGISTRY);
};

export const getResourceTypeConfig = (
  provider: IntegrationProvider,
  resourceType: string
): ResourceTypeConfig | undefined => {
  return INTEGRATION_REGISTRY[provider]?.resourceTypes[resourceType];
};

