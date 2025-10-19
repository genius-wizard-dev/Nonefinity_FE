import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "../store";
import { ChatList } from "./chat-list";
import CreateChatDialog from "./create-chat-dialog";

export default function ChatSidebar() {
  const { sidebarOpen, setSidebarOpen } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");

  if (!sidebarOpen) {
    return (
      <div className="w-16 bg-card border-r flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="mb-4"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-r flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chats</h2>
          <CreateChatDialog />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <ChatList searchQuery={searchQuery} />
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
          className="w-full"
        >
          Collapse Sidebar
        </Button>
      </div>
    </div>
  );
}
