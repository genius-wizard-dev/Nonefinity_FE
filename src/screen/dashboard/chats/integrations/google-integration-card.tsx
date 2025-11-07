import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAuth, useUser } from "@clerk/clerk-react";
import React, { useEffect } from "react";
import { GoogleConnectionDialog } from "../../file-management/components/google-connection-dialog";
import {
  useChatStore,
  useGooglePDFs,
  useGooglePDFsLoading,
  useGoogleSheets,
  useGoogleSheetsLoading,
} from "../store";
import type { GoogleIntegration } from "../types";
import { getIntegrationConfig, getResourceTypeConfig } from "./registry";
import { ResourceSelector } from "./resource-selector";

interface GoogleIntegrationCardProps {
  integration: GoogleIntegration | null;
  onChange: (integration: GoogleIntegration | null) => void;
  loading?: boolean;
}

export const GoogleIntegrationCard: React.FC<GoogleIntegrationCardProps> = ({
  integration,
  onChange,
  loading = false,
}) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { fetchGoogleSheets, fetchGooglePDFs, clearGoogleResources } =
    useChatStore();
  const sheets = useGoogleSheets();
  const sheetsLoading = useGoogleSheetsLoading();
  const pdfs = useGooglePDFs();
  const pdfsLoading = useGooglePDFsLoading();
  const [showGoogleConnectionDialog, setShowGoogleConnectionDialog] =
    React.useState(false);

  const config = getIntegrationConfig("google");
  const hasGoogleConnection = config.checkConnection(user);
  // Check if integration exists and is not null
  const isEnabled = integration !== null && integration !== undefined;
  const isActive = integration?.enable ?? false;

  // Auto-fetch resources when component mounts if Google connection exists and integration is enabled
  useEffect(() => {
    const autoFetchResources = async () => {
      if (!hasGoogleConnection || !integration) return;

      const token = await getToken();
      if (!token) return;

      // Fetch resources if not already cached
      await Promise.all([
        fetchGoogleSheets(token, false),
        fetchGooglePDFs(token, false),
      ]);
    };

    autoFetchResources();
  }, [
    hasGoogleConnection,
    integration,
    getToken,
    fetchGoogleSheets,
    fetchGooglePDFs,
  ]);

  const handleEnableGoogle = async () => {
    if (!hasGoogleConnection) {
      setShowGoogleConnectionDialog(true);
      return;
    }

    // Enable with default values
    const newIntegration: GoogleIntegration = {
      provider: "google",
      enable: true,
      resources: {
        sheets: null,
        pdfs: null,
      },
    };
    onChange(newIntegration);

    // Auto-fetch resources when enabling
    const token = await getToken();
    if (token) {
      await Promise.all([
        fetchGoogleSheets(token, false),
        fetchGooglePDFs(token, false),
      ]);
    }
  };

  const handleDisableGoogle = () => {
    // Clear resources first
    clearGoogleResources();
    // Then remove integration
    onChange(null);
  };

  const handleToggleEnable = (enabled: boolean) => {
    if (integration) {
      onChange({
        ...integration,
        enable: enabled,
      });
    }
  };

  const handleSheetsChange = (sheet: { id: string; name: string }) => {
    if (integration) {
      onChange({
        ...integration,
        resources: {
          ...integration.resources,
          sheets: {
            type: "sheets",
            sheet_id: sheet.id,
            sheet_name: sheet.name,
          },
        },
      });
    }
  };

  const handleSheetsRemove = () => {
    if (integration) {
      onChange({
        ...integration,
        resources: {
          ...integration.resources,
          sheets: null,
        },
      });
    }
  };

  const handlePDFsChange = (pdf: { id: string; name: string }) => {
    if (integration) {
      onChange({
        ...integration,
        resources: {
          ...integration.resources,
          pdfs: {
            type: "pdfs",
            pdf_id: pdf.id,
            pdf_name: pdf.name,
          },
        },
      });
    }
  };

  const handlePDFsRemove = () => {
    if (integration) {
      onChange({
        ...integration,
        resources: {
          ...integration.resources,
          pdfs: null,
        },
      });
    }
  };

  const handleFetchSheets = async (force = false) => {
    if (!hasGoogleConnection) return;
    const token = await getToken();
    if (token) {
      await fetchGoogleSheets(token, force);
    }
  };

  const handleFetchPDFs = async (force = false) => {
    if (!hasGoogleConnection) return;
    const token = await getToken();
    if (token) {
      await fetchGooglePDFs(token, force);
    }
  };

  const Icon = config.icon;
  const sheetsConfig = getResourceTypeConfig("google", "sheets");
  const pdfsConfig = getResourceTypeConfig("google", "pdfs");

  if (loading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-base">{config.name}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {config.description}
                </CardDescription>
              </div>
            </div>
            {isEnabled ? (
              <div className="flex items-center gap-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={handleToggleEnable}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDisableGoogle}
                  className="gap-2"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEnableGoogle}
                className="gap-2"
                disabled={!hasGoogleConnection}
              >
                {/* <Icon className="w-4 h-4" /> */}
                {hasGoogleConnection ? "Add" : "Connect Google"}
              </Button>
            )}
          </div>
        </CardHeader>

        {isEnabled && sheetsConfig && pdfsConfig && (
          <CardContent className="space-y-4">
            <Separator />
            <div className="space-y-4">
              <ResourceSelector
                resourceType={sheetsConfig}
                resources={sheets}
                loading={sheetsLoading}
                selectedId={integration.resources.sheets?.sheet_id}
                selectedName={integration.resources.sheets?.sheet_name}
                onSelect={handleSheetsChange}
                onRemove={handleSheetsRemove}
                onRefresh={() => handleFetchSheets(true)}
                disabled={!isActive}
                id="google-sheets-selector"
              />

              <ResourceSelector
                resourceType={pdfsConfig}
                resources={pdfs}
                loading={pdfsLoading}
                selectedId={integration.resources.pdfs?.pdf_id}
                selectedName={integration.resources.pdfs?.pdf_name}
                onSelect={handlePDFsChange}
                onRemove={handlePDFsRemove}
                onRefresh={() => handleFetchPDFs(true)}
                disabled={!isActive}
                id="google-pdfs-selector"
              />
            </div>
          </CardContent>
        )}
      </Card>

      <GoogleConnectionDialog
        open={showGoogleConnectionDialog}
        onOpenChange={setShowGoogleConnectionDialog}
        onGoogleConnected={async () => {
          setShowGoogleConnectionDialog(false);
          // Auto-enable after connection
          const newIntegration: GoogleIntegration = {
            provider: "google",
            enable: true,
            resources: {
              sheets: null,
              pdfs: null,
            },
          };
          onChange(newIntegration);

          // Auto-fetch resources after connection
          const token = await getToken();
          if (token) {
            await Promise.all([
              fetchGoogleSheets(token, false),
              fetchGooglePDFs(token, false),
            ]);
          }
        }}
      />
    </>
  );
};
