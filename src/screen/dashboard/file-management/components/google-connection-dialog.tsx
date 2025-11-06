"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@clerk/clerk-react";
import { AlertCircle, Cloud } from "lucide-react";
import { useEffect } from "react";

interface GoogleConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoogleConnected?: () => void;
}

export function GoogleConnectionDialog({
  open,
  onOpenChange,
  onGoogleConnected,
}: GoogleConnectionDialogProps) {
  const { user } = useUser();

  // Check if user has Google OAuth connection
  const hasGoogleConnection = user?.externalAccounts?.some(
    (account) => account.provider === "google"
  );

  // Check if Google is connected
  useEffect(() => {
    if (user) {
      const hasGoogle = user.externalAccounts?.some(
        (account) => account.provider === "google"
      );
      if (hasGoogle && !hasGoogleConnection) {
        // User just connected Google
        onGoogleConnected?.();
        onOpenChange(false);
      }
    }
  }, [user, hasGoogleConnection, onGoogleConnected, onOpenChange]);

  // Close dialog if user already has Google connection
  useEffect(() => {
    if (hasGoogleConnection && open) {
      onOpenChange(false);
    }
  }, [hasGoogleConnection, open, onOpenChange]);

  // Don't show dialog if user already has Google connection
  if (hasGoogleConnection) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle>Connect Google Account</DialogTitle>
              <DialogDescription className="mt-1">
                You need to connect your Google account to import files from
                Google Drive.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription className="mt-2">
              To import files from Google Drive, please connect your Google
              account by clicking on your profile avatar in the sidebar and
              adding a Google account connection.
            </AlertDescription>
          </Alert>

          <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              After connecting your Google account, you will be able to:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">•</span>
                <span>Access your Google Drive files</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">•</span>
                <span>Import Google Sheets and PDFs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">•</span>
                <span>Import files directly from Google Drive</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
