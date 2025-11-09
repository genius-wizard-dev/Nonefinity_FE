import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IntegrationHeader,
  IntegrationStats,
  IntegrationList,
  ToolsDetailSheet,
} from "./components";
import { IntegrationService } from "./services";
import { useIntegrationStore } from "./store";
import type { IntegrationItem, IntegrationDetail } from "./types";

export default function Integrate() {
  const { getToken } = useAuth();
  const {
    integrations,
    isLoading,
    error,
    stats,
    selectedIntegration,
    tools,
    isLoadingTools,
    selectedTools,
    fetchIntegrations,
    connectIntegration,
    fetchTools,
    setSelectedIntegration,
    toggleToolSelection,
    updateToolsInIntegration,
    clearSelectedIntegration,
  } = useIntegrationStore();

  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setPendingIntegrationId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load integrations on mount
  useEffect(() => {
    const loadIntegrations = async () => {
      const token = await getToken();
      if (token) {
        await fetchIntegrations(token);
      }
    };
    loadIntegrations();
  }, [getToken, fetchIntegrations]);

  const handleRefresh = async () => {
    const token = await getToken();
    if (token) {
      await fetchIntegrations(token, true);
    }
  };

  const handleConnect = async (integration: IntegrationItem) => {
    if (integration.is_login) {
      toast.info("Already connected", {
        description: `${integration.name} is already connected.`,
      });
      return;
    }

    setConnectingId(integration.id);
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required", {
          description: "Please sign in to connect integrations.",
        });
        return;
      }

      const redirectUrl = await connectIntegration(integration.id, token);
      if (redirectUrl) {
        const a = document.createElement("a");
        a.href = redirectUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (error: any) {
      toast.error("Connection failed", {
        description: error?.message || "An error occurred while connecting.",
      });
    } finally {
      setConnectingId(null);
    }
  };

  const handleViewTools = async (integration: IntegrationItem) => {
    if (!integration.toolkit?.slug) {
      toast.error("Invalid integration", {
        description: "Toolkit slug not found.",
      });
      return;
    }

    // Prevent multiple clicks if already loading the same integration
    if (isLoadingTools && selectedIntegration?.id === integration.id) {
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

    // Set selectedIntegration and open sheet immediately
    setSelectedIntegration(integrationDetail);
    setIsSheetOpen(true);
    setSearchQuery("");
    setPendingIntegrationId(integration.id);

    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required", {
          description: "Please sign in to view tools.",
        });
        setIsSheetOpen(false);
        clearSelectedIntegration();
        setPendingIntegrationId(null);
        return;
      }

      // Fetch tools (will update selectedIntegration with tools when done)
      await fetchTools(integration.id, integration.toolkit.slug, token);
    } catch (error: any) {
      toast.error("Failed to load tools", {
        description: error?.message || "An error occurred while loading tools.",
      });
      setIsSheetOpen(false);
      clearSelectedIntegration();
      setPendingIntegrationId(null);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    clearSelectedIntegration();
    setSearchQuery("");
    setPendingIntegrationId(null);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied", {
      description: `${label} copied to clipboard`,
    });
  };

  const handleAddTools = async () => {
    if (selectedTools.size === 0) {
      toast.info("No tools selected", {
        description: "Please select at least one tool to add.",
      });
      return;
    }

    if (!selectedIntegration?.toolkit?.slug) {
      toast.error("Invalid integration", {
        description: "Toolkit slug not found.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required", {
          description: "Please sign in to add tools.",
        });
        setIsUpdating(false);
        return;
      }

      const toolSlugs = Array.from(selectedTools);
      const toolsCount = toolSlugs.length;

      const success = await IntegrationService.addTools(
        selectedIntegration.toolkit.slug,
        toolSlugs,
        token
      );

      if (success) {
        // Update tools in store (this will also clear selectedTools)
        if (selectedIntegration) {
          updateToolsInIntegration(
            selectedIntegration.id,
            selectedIntegration.toolkit.slug,
            toolSlugs
          );
        }

        toast.success("Tools updated successfully", {
          description: `${toolsCount} tool(s) have been updated.`,
        });
      } else {
        toast.error("Failed to update tools", {
          description: "An error occurred while updating tools.",
        });
      }
    } catch (error: any) {
      toast.error("Failed to update tools", {
        description: error?.message || "An error occurred while updating tools.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error("Error", {
        description: error,
      });
    }
  }, [error]);

  // Close sheet when selectedIntegration is cleared
  useEffect(() => {
    if (!selectedIntegration && isSheetOpen && !isLoadingTools) {
      setIsSheetOpen(false);
      setPendingIntegrationId(null);
    }
  }, [selectedIntegration, isSheetOpen, isLoadingTools]);

  return (
    <div className="p-6 space-y-6">
      <IntegrationHeader isLoading={isLoading} onRefresh={handleRefresh} />

      <IntegrationStats integrations={integrations} stats={stats} />

      <IntegrationList
        integrations={integrations}
        isLoading={isLoading}
        connectingId={connectingId}
        onRefresh={handleRefresh}
        onViewTools={handleViewTools}
        onConnect={handleConnect}
      />

      <ToolsDetailSheet
        isOpen={isSheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseSheet();
          } else {
            setIsSheetOpen(true);
          }
        }}
        selectedIntegration={selectedIntegration}
        tools={tools}
        isLoadingTools={isLoadingTools}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTools={selectedTools}
        onToggleTool={toggleToolSelection}
        onAddTools={handleAddTools}
        onCopy={handleCopy}
        isUpdating={isUpdating}
      />
    </div>
  );
}
