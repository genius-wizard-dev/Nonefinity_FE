import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileJson,
  FileText,
  MessageSquare,
  Plus,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChatInterface } from "./components/chat-interface";
import { ConfigList, CreateConfigDialog } from "./components/config-list";
import { SessionList } from "./components/session-list";
import { ChatService } from "./services";
import { useChatStore } from "./store";
import type { ChatConfig, ChatSession } from "./types";

import { Input } from "@/components/ui/input";

const ChatManager: React.FC = () => {
  const {
    selectedConfig,
    selectedSession,
    selectConfig,
    selectSession,
    fetchConfigs,
    refreshConfigs,
  } = useChatStore();
  const [createConfigDialogOpen, setCreateConfigDialogOpen] = useState(false);
  const [configSearchQuery, setConfigSearchQuery] = useState("");

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleConfigSelect = (config: ChatConfig) => {
    selectConfig(config);
    selectSession(null); // Clear selected session when config changes
  };

  const handleSessionSelect = (session: ChatSession) => {
    selectSession(session);
  };

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
                  size="sm"
                  onClick={() => {
                    selectConfig(null);
                    selectSession(null);
                  }}
                >
                  ← Back
                </Button>
                <Separator orientation="vertical" className="h-6" />
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
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  selectSession(null);
                }}
              >
                ← Back to Sessions
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="font-semibold">
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
