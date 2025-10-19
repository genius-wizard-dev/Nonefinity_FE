import { Skeleton } from "@/components/ui/skeleton";
import { useChatStore } from "../store";
import { ChatItem } from "./chat-item";

interface ChatListProps {
  searchQuery: string;
}

export function ChatList({ searchQuery }: ChatListProps) {
  const { chats, isLoading, selectedChatId, setCurrentChat } = useChatStore();

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredChats.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {searchQuery
          ? "No chats found matching your search."
          : "No chats yet. Create your first chat!"}
      </div>
    );
  }

  return (
    <div className="p-2">
      {filteredChats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isSelected={selectedChatId === chat.id}
          onClick={() => setCurrentChat(chat)}
        />
      ))}
    </div>
  );
}
