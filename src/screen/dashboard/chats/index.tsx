import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  FileJson,
  FileText,
  MessageSquare,
  Plus,
  RefreshCw,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ChatInterface } from "./components/chat-interface";
import {
  ChatInterfaceSkeleton,
  ConfigListSkeleton,
  SessionListSkeleton,
} from "./components/chat-skeletons";
import { ConfigList, CreateConfigDialog } from "./components/config-list";
import { SessionList } from "./components/session-list";
import { ChatService } from "./services";
import { useChatStore } from "./store";
import type { ChatConfig, ChatSession } from "./types";

import { Input } from "@/components/ui/input";

// ============================================================================
// Main ChatManager Component
// ============================================================================

const ChatManager: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    configs,
    sessions,
    configsLoading,
    selectedConfig,
    selectedSession,
    selectConfig,
    selectSession,
    fetchConfigs,
    fetchSessions,
    refreshConfigs,
  } = useChatStore();
  const [createConfigDialogOpen, setCreateConfigDialogOpen] = useState(false);
  const [configSearchQuery, setConfigSearchQuery] = useState("");
  const [isRestoring, setIsRestoring] = useState(true);
  const [isRestoringSession, setIsRestoringSession] = useState(false);

  // Get params from URL
  const configIdFromUrl = searchParams.get("config");
  const sessionIdFromUrl = searchParams.get("session");

  // Restore state from URL params on mount
  useEffect(() => {
    const restoreStateFromUrl = async () => {
      // First, fetch configs if needed
      await fetchConfigs();
      setIsRestoring(false);
    };

    restoreStateFromUrl();
  }, [fetchConfigs]);

  // Effect to restore config from URL after configs are loaded
  useEffect(() => {
    if (isRestoring || configs.length === 0) return;

    const restoreConfig = async () => {
      if (configIdFromUrl && !selectedConfig) {
        const config = configs.find((c) => c.id === configIdFromUrl);
        if (config) {
          selectConfig(config);
          // Fetch sessions for this config
          if (sessionIdFromUrl) {
            setIsRestoringSession(true);
          }
          await fetchSessions(config.id);
          setIsRestoringSession(false);
        } else {
          // Config not found, clear URL params
          setSearchParams({});
        }
      }
    };

    restoreConfig();
  }, [
    isRestoring,
    configs,
    configIdFromUrl,
    sessionIdFromUrl,
    selectedConfig,
    selectConfig,
    fetchSessions,
    setSearchParams,
  ]);

  // Effect to restore session from URL after sessions are loaded
  useEffect(() => {
    if (isRestoring || isRestoringSession || !selectedConfig) return;

    if (sessionIdFromUrl && !selectedSession && sessions.length > 0) {
      const session = sessions.find((s) => s.id === sessionIdFromUrl);
      if (session) {
        selectSession(session);
      } else {
        // Session not found, keep only config in URL
        setSearchParams({ config: selectedConfig.id });
      }
    }
  }, [
    isRestoring,
    isRestoringSession,
    sessions,
    sessionIdFromUrl,
    selectedSession,
    selectedConfig,
    selectSession,
    setSearchParams,
  ]);

  // Effect to sync state when URL changes (browser back/forward navigation)
  useEffect(() => {
    if (isRestoring) return;

    // Case 1: URL has no params but we have selected config/session -> clear state
    if (!configIdFromUrl && selectedConfig) {
      selectConfig(null);
      selectSession(null);
      return;
    }

    // Case 2: URL has config param different from selected config -> update config
    if (
      configIdFromUrl &&
      selectedConfig &&
      configIdFromUrl !== selectedConfig.id
    ) {
      const newConfig = configs.find((c) => c.id === configIdFromUrl);
      if (newConfig) {
        selectConfig(newConfig);
        selectSession(null);
        fetchSessions(newConfig.id);
      } else {
        // Config not found, clear everything
        selectConfig(null);
        selectSession(null);
        setSearchParams({});
      }
      return;
    }

    // Case 3: URL has no session param but we have selected session -> clear session
    if (
      !sessionIdFromUrl &&
      selectedSession &&
      configIdFromUrl === selectedConfig?.id
    ) {
      selectSession(null);
      return;
    }

    // Case 4: URL has session param different from selected session -> update session
    if (
      sessionIdFromUrl &&
      selectedSession &&
      sessionIdFromUrl !== selectedSession.id
    ) {
      const newSession = sessions.find((s) => s.id === sessionIdFromUrl);
      if (newSession) {
        selectSession(newSession);
      }
    }
  }, [
    isRestoring,
    configIdFromUrl,
    sessionIdFromUrl,
    selectedConfig,
    selectedSession,
    configs,
    sessions,
    selectConfig,
    selectSession,
    fetchSessions,
    setSearchParams,
  ]);

  // Update URL when config changes
  const handleConfigSelect = useCallback(
    (config: ChatConfig) => {
      selectConfig(config);
      selectSession(null);
      // Update URL with config param
      setSearchParams({ config: config.id });
    },
    [selectConfig, selectSession, setSearchParams]
  );

  // Update URL when session changes
  const handleSessionSelect = useCallback(
    (session: ChatSession) => {
      selectSession(session);
      if (selectedConfig) {
        // Update URL with both config and session params
        setSearchParams({ config: selectedConfig.id, session: session.id });
      }
    },
    [selectSession, selectedConfig, setSearchParams]
  );

  // Handle back to configs
  const handleBackToConfigs = useCallback(() => {
    selectConfig(null);
    selectSession(null);
    // Clear URL params
    setSearchParams({});
  }, [selectConfig, selectSession, setSearchParams]);

  // Handle back to sessions
  const handleBackToSessions = useCallback(() => {
    selectSession(null);
    if (selectedConfig) {
      // Keep only config in URL
      setSearchParams({ config: selectedConfig.id });
    }
  }, [selectSession, selectedConfig, setSearchParams]);

  const handleExportChatHistory = async (format: "csv" | "json") => {
    if (!selectedSession) return;

    try {
      toast.loading(`Exporting chat history as ${format.toUpperCase()}...`, {
        id: "export-chat-history",
      });

      const result = await ChatService.exportChatHistory(
        selectedSession.id,
        format
      );

      if (result) {
        toast.success(
          `Chat history exported successfully! (${result.qa_pairs_count} Q&A pairs)`,
          {
            id: "export-chat-history",
            description: `File: ${result.file_name}`,
            action: {
              label: "Download",
              onClick: () => {
                window.open(result.download_url, "_blank");
              },
            },
            duration: 5000,
          }
        );
      } else {
        toast.error("Failed to export chat history", {
          id: "export-chat-history",
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export chat history", {
        id: "export-chat-history",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Determine if we're still waiting for state to be restored from URL
  const isWaitingForConfigRestore =
    configIdFromUrl && !selectedConfig && !isRestoring;
  const isWaitingForSessionRestore =
    sessionIdFromUrl &&
    !selectedSession &&
    selectedConfig &&
    !isRestoringSession;

  // Show skeleton while restoring state from URL or loading configs
  if (isRestoring || configsLoading || isWaitingForConfigRestore) {
    // Determine which skeleton to show based on URL params
    if (sessionIdFromUrl && configIdFromUrl) {
      return <ChatInterfaceSkeleton />;
    }
    if (configIdFromUrl) {
      return <SessionListSkeleton />;
    }
    return <ConfigListSkeleton />;
  }

  // Show chat skeleton while restoring session
  if (isRestoringSession || isWaitingForSessionRestore) {
    return (
      <ChatInterfaceSkeleton
        sessionName={selectedSession?.name || "Loading..."}
      />
    );
  }

  // Flow: Config List -> Session List -> Chat Interface
  // Step 1: Show config list if no config selected
  if (!selectedConfig) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-fit">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    Chat Configs
                  </h1>
                  <p className="text-sm text-muted-foreground hidden md:block">
                    Select or create a chat configuration
                  </p>
                </div>
              </div>

              <div className="flex-1 max-w-xl mx-4">
                <Input
                  placeholder="Search configs..."
                  className="w-full bg-background/50"
                  value={configSearchQuery}
                  onChange={(e) => setConfigSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 min-w-fit">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refreshConfigs()}
                  title="Refresh configs"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button onClick={() => setCreateConfigDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Config
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          <ConfigList
            onConfigSelect={handleConfigSelect}
            selectedConfigId={undefined}
            searchQuery={configSearchQuery}
          />
        </div>

        <CreateConfigDialog
          open={createConfigDialogOpen}
          onOpenChange={setCreateConfigDialogOpen}
        />
      </div>
    );
  }

  // Step 2: Show session list if config selected but no session
  if (!selectedSession) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToConfigs}
                  aria-label="Back to Configs"
                  className="ml-12 lg:ml-0"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Separator
                  orientation="vertical"
                  className="h-6 hidden sm:block"
                />
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-foreground">
                      {selectedConfig.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Select or create a chat session
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          <SessionList
            configId={selectedConfig.id}
            onSessionSelect={handleSessionSelect}
            selectedSessionId={undefined}
          />
        </div>
      </div>
    );
  }

  // Step 3: Show chat interface if session selected
  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToSessions}
                className="flex-shrink-0 ml-12 lg:ml-0"
                aria-label="Back to Sessions"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Separator
                orientation="vertical"
                className="h-6 hidden sm:block"
              />
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base truncate">
                  {selectedSession.name || "Chat Session"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleExportChatHistory("csv")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExportChatHistory("json")}
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface sessionId={selectedSession.id} />
      </div>
    </div>
  );
};

export default ChatManager;
