import { Skeleton } from "@/components/ui/skeleton";
import React, { useMemo } from "react";
import type { Integration } from "../types";
import { GoogleIntegrationCard } from "../integrations/google-integration-card";
import { getAllIntegrationProviders } from "../integrations/registry";

interface IntegrationsSelectorProps {
  value: Integration[] | null;
  onChange: (value: Integration[] | null) => void;
  loading?: boolean;
}

export const IntegrationsSelector: React.FC<IntegrationsSelectorProps> = ({
  value,
  onChange,
  loading = false,
}) => {
  const providers = getAllIntegrationProviders();
  const integrations = value || [];

  // Create a map of provider -> integration for easy lookup
  const integrationsMap = useMemo(() => {
    const map = new Map<string, Integration>();
    if (integrations && integrations.length > 0) {
      integrations.forEach((integration) => {
        if (integration) {
          map.set(integration.provider, integration);
        }
      });
    }
    return map;
  }, [integrations]);

  const handleIntegrationChange = (
    provider: string,
    newIntegration: Integration | null
  ) => {
    if (newIntegration === null) {
      // Remove integration for this provider
      const updated = integrations.filter(
        (integration) => integration && integration.provider !== provider
      );
      // Always create new array reference, even if empty
      const result = updated.length > 0 ? [...updated] : null;
      // Force update by calling onChange with new reference
      onChange(result);
    } else {
      // Add or update integration for this provider
      const existingIndex = integrations.findIndex(
        (integration) => integration && integration.provider === provider
      );
      if (existingIndex >= 0) {
        // Update existing - create new array to trigger re-render
        const updated = [...integrations];
        updated[existingIndex] = newIntegration;
        onChange([...updated]);
      } else {
        // Add new - create new array to trigger re-render
        onChange([...integrations, newIntegration]);
      }
    }
  };

  if (loading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <div className="space-y-4">
      {providers.map((providerConfig) => {
        // Get integration for this provider
        const integration = integrationsMap.get(providerConfig.provider) || null;

        // Render provider-specific integration card
        switch (providerConfig.provider) {
          case "google":
            return (
              <GoogleIntegrationCard
                key={providerConfig.provider}
                integration={integration as any}
                onChange={(newIntegration) => {
                  handleIntegrationChange(providerConfig.provider, newIntegration);
                }}
                loading={loading}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
};
