import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, FileSpreadsheet, RefreshCw } from "lucide-react";
import React, { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { DriveService } from "../../drive/services";
import type { GoogleSheet } from "../../drive/types";
import { GoogleConnectionDialog } from "../../file-management/components/google-connection-dialog";
import type { Integration, GoogleIntegration } from "../types";

interface IntegrationsSelectorProps {
  value: Integration | null;
  onChange: (value: Integration | null) => void;
  loading?: boolean;
}

// Supported integrations
const SUPPORTED_INTEGRATIONS = [
  {
    provider: "google" as const,
    name: "Google Sheets",
    description: "Connect to Google Sheets for real-time data updates",
    icon: Cloud,
  },
];

export const IntegrationsSelector: React.FC<IntegrationsSelectorProps> = ({
  value,
  onChange,
  loading = false,
}) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [sheets, setSheets] = useState<GoogleSheet[]>([]);
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [showGoogleConnectionDialog, setShowGoogleConnectionDialog] =
    useState(false);

  // Check if user has Google OAuth connection
  const hasGoogleConnection = user?.externalAccounts?.some(
    (account) => account.provider === "google"
  );

  // Get current Google integration
  const googleIntegration = value?.provider === "google" ? value : null;

  const fetchSheets = async () => {
    if (!hasGoogleConnection) return;

    const token = await getToken();
    if (!token) return;

    setSheetsLoading(true);
    try {
      const response = await DriveService.listSheets(token, undefined, 100);
      setSheets(response.files || []);
    } catch (error) {
      console.error("Failed to fetch Google Sheets:", error);
      setSheets([]);
    } finally {
      setSheetsLoading(false);
    }
  };

  const handleEnableGoogle = () => {
    if (!hasGoogleConnection) {
      setShowGoogleConnectionDialog(true);
      return;
    }

    // Enable with default values (enable = true by default)
    const newIntegration: GoogleIntegration = {
      provider: "google",
      enable: true,
      sheet_id: "",
      sheet_name: "",
    };
    onChange(newIntegration);
    // Don't auto-fetch, user will click refresh if needed
  };

  const handleDisableGoogle = () => {
    onChange(null);
  };

  const handleToggleEnable = (enabled: boolean) => {
    if (googleIntegration) {
      onChange({
        ...googleIntegration,
        enable: enabled,
      });
    }
  };

  const handleSheetChange = (sheetId: string) => {
    if (googleIntegration) {
      const selectedSheet = sheets.find((s) => s.id === sheetId);
      if (selectedSheet) {
        onChange({
          ...googleIntegration,
          sheet_id: selectedSheet.id,
          sheet_name: selectedSheet.name,
        });
      }
    }
  };

  if (loading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <div className="space-y-4">
      {SUPPORTED_INTEGRATIONS.map((integration) => {
        const Icon = integration.icon;
        const isEnabled = googleIntegration !== null;
        const isActive = googleIntegration?.enable ?? false;

        return (
          <Card key={integration.provider}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {integration.description}
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
                    <Icon className="w-4 h-4" />
                    {hasGoogleConnection ? "Add" : "Connect Google"}
                  </Button>
                )}
              </div>
            </CardHeader>

            {isEnabled && (
              <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${integration.provider}-sheet`}>
                      Google Sheet
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={fetchSheets}
                      disabled={sheetsLoading || !hasGoogleConnection}
                      className="gap-2 h-7"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${sheetsLoading ? "animate-spin" : ""}`}
                      />
                      Refresh
                    </Button>
                  </div>
                  {sheetsLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={googleIntegration?.sheet_id || ""}
                      onValueChange={handleSheetChange}
                      disabled={!isActive}
                    >
                      <SelectTrigger id={`${integration.provider}-sheet`}>
                        <SelectValue placeholder="Select a Google Sheet" />
                      </SelectTrigger>
                      <SelectContent>
                        {sheets.length === 0 ? (
                          <SelectItem value="__no_sheets__" disabled>
                            {googleIntegration?.sheet_id
                              ? "Click Refresh to load sheets"
                              : "No sheets available"}
                          </SelectItem>
                        ) : (
                          sheets.map((sheet) => (
                            <SelectItem key={sheet.id} value={sheet.id}>
                              <div className="flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4" />
                                <span>{sheet.name}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {googleIntegration?.sheet_id && (
                    <div className="space-y-1 p-2 bg-muted/50 rounded-md">
                      <p className="text-xs text-muted-foreground">
                        Selected Sheet:
                      </p>
                      {googleIntegration?.sheet_name && (
                        <p className="text-sm font-medium">
                          {googleIntegration.sheet_name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground font-mono break-all">
                        ID: {googleIntegration.sheet_id}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      <GoogleConnectionDialog
        open={showGoogleConnectionDialog}
        onOpenChange={setShowGoogleConnectionDialog}
        onGoogleConnected={() => {
          setShowGoogleConnectionDialog(false);
          // Auto-enable after connection (enable = true by default)
          const newIntegration: GoogleIntegration = {
            provider: "google",
            enable: true,
            sheet_id: "",
            sheet_name: "",
          };
          onChange(newIntegration);
          // Don't auto-fetch, user will click refresh if needed
        }}
      />
    </div>
  );
};
