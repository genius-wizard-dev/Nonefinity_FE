import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import ChatMain from "./components/chat-main";
import ChatSidebar from "./components/chat-sidebar";
import { useChatStore } from "./store";

export default function ChatsPage() {
  const { getChats, isLoading } = useChatStore();

  useEffect(() => {
    // Load chats on component mount
    getChats();
  }, [getChats]);

  if (isLoading) {
    return (
      <div className="h-full flex bg-background">
        {/* Sidebar Skeleton */}
        <div className="w-80 bg-card border-r flex flex-col h-full">
          <div className="p-4 border-b space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex-1 p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="border-b bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  i % 2 === 0 ? "justify-start" : "justify-end"
                }`}
              >
                <Skeleton
                  className={`h-16 ${i % 2 === 0 ? "w-1/2" : "w-1/3"}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-background">
      {/* Sidebar */}
      <ChatSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatMain />
      </div>
    </div>
  );
}
