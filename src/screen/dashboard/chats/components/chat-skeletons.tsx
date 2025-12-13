import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import React, { memo } from "react";

// ============================================================================
// Messages Skeleton - Reusable for both loading states
// ============================================================================

export const MessagesLoadingSkeleton: React.FC = memo(() => (
  <div className="p-4 space-y-6 animate-in fade-in-0 duration-300">
    {/* User message skeleton */}
    <div className="flex justify-end">
      <div className="flex items-end gap-3 max-w-[75%]">
        <div className="bg-primary/10 rounded-2xl rounded-br-md px-4 py-3 space-y-2">
          <Skeleton className="h-4 w-48 bg-primary/20" />
          <Skeleton className="h-4 w-32 bg-primary/20" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      </div>
    </div>

    {/* Assistant message skeleton */}
    <div className="flex justify-start">
      <div className="flex items-end gap-3 max-w-[75%]">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ring-1 ring-border">
          <div className="w-4 h-4 rounded-full bg-primary/30 animate-pulse" />
        </div>
        <div className="bg-secondary/80 rounded-2xl rounded-bl-md px-4 py-3 space-y-2.5">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>

    {/* User message skeleton */}
    <div className="flex justify-end">
      <div className="flex items-end gap-3 max-w-[75%]">
        <div className="bg-primary/10 rounded-2xl rounded-br-md px-4 py-3">
          <Skeleton className="h-4 w-36 bg-primary/20" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      </div>
    </div>

    {/* Assistant message with tool skeleton */}
    <div className="flex justify-start">
      <div className="flex items-end gap-3 max-w-[75%]">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ring-1 ring-border">
          <div className="w-4 h-4 rounded-full bg-primary/30 animate-pulse" />
        </div>
        <div className="space-y-3">
          {/* Tool call skeleton */}
          <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-16 rounded-full ml-auto" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
          {/* Response content */}
          <div className="bg-secondary/80 rounded-2xl rounded-bl-md px-4 py-3 space-y-2.5">
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
    </div>
  </div>
));
MessagesLoadingSkeleton.displayName = "MessagesLoadingSkeleton";

// ============================================================================
// Full Chat Interface Skeleton - For page-level loading
// ============================================================================

interface ChatInterfaceSkeletonProps {
  sessionName?: string;
}

export const ChatInterfaceSkeleton: React.FC<ChatInterfaceSkeletonProps> = memo(
  ({ sessionName }) => (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Skeleton className="h-10 w-10 rounded-md ml-12 lg:ml-0" />
              <Separator
                orientation="vertical"
                className="h-6 hidden sm:block"
              />
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                {sessionName ? (
                  <span className="font-semibold text-sm sm:text-base truncate">
                    {sessionName}
                  </span>
                ) : (
                  <Skeleton className="h-5 w-32" />
                )}
              </div>
            </div>
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </header>

      {/* Messages Skeleton */}
      <div className="flex-1 overflow-hidden">
        <MessagesLoadingSkeleton />
      </div>

      {/* Input Skeleton */}
      <div className="flex-shrink-0 border-t bg-gradient-to-t from-background via-background to-transparent p-4 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Skeleton className="h-14 w-full rounded-xl" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
);
ChatInterfaceSkeleton.displayName = "ChatInterfaceSkeleton";

// ============================================================================
// Config List Skeleton
// ============================================================================

export const ConfigListSkeleton: React.FC = memo(() => (
  <div className="min-h-screen bg-background">
    {/* Header Skeleton */}
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-fit">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 hidden md:block" />
            </div>
          </div>
          <div className="flex-1 max-w-xl mx-4">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="flex items-center gap-2 min-w-fit">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </header>

    {/* Config Grid Skeleton */}
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
));
ConfigListSkeleton.displayName = "ConfigListSkeleton";

// ============================================================================
// Session List Skeleton
// ============================================================================

interface SessionListSkeletonProps {
  configName?: string;
}

export const SessionListSkeleton: React.FC<SessionListSkeletonProps> = memo(
  ({ configName }) => (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-md ml-12 lg:ml-0" />
              <Separator
                orientation="vertical"
                className="h-6 hidden sm:block"
              />
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                  {configName ? (
                    <h1 className="text-xl font-semibold text-foreground">
                      {configName}
                    </h1>
                  ) : (
                    <Skeleton className="h-6 w-40" />
                  )}
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Session List Skeleton */}
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-4">
          {/* Stats skeleton */}
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-20 w-40 rounded-lg" />
            <Skeleton className="h-20 w-40 rounded-lg" />
          </div>

          {/* Session cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
);
SessionListSkeleton.displayName = "SessionListSkeleton";
