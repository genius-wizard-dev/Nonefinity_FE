import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ChatInterface } from "./components/chat-interface";
import { ConfigList, CreateConfigDialog } from "./components/config-list";
import { SessionList } from "./components/session-list";
import { useChatStore } from "./store";
import type { ChatConfig, ChatSession } from "./types";

const ChatManager: React.FC = () => {
  const {
    selectedConfig,
    selectedSession,
    selectConfig,
    selectSession,
    fetchConfigs,
  } = useChatStore();
  const [createConfigDialogOpen, setCreateConfigDialogOpen] = useState(false);

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

  // Flow: Config List -> Session List -> Chat Interface
  // Step 1: Show config list if no config selected
  if (!selectedConfig) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    Chat Configs
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Select or create a chat configuration
                  </p>
                </div>
              </div>
              <Button onClick={() => setCreateConfigDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Config
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          <ConfigList
            onConfigSelect={handleConfigSelect}
            selectedConfigId={undefined}
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
