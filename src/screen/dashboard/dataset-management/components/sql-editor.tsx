"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Loader2, Play } from "lucide-react";
import { useState } from "react";

interface SqlEditorProps {
  onExecute: (query: string) => void;
  isExecuting: boolean;
  selectedTable?: string | null;
}

export function SqlEditor({ onExecute, isExecuting }: SqlEditorProps) {
  const [query, setQuery] = useState("");

  const handleExecute = () => {
    if (query.trim() && !isExecuting) {
      onExecute(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleExecute();
    }
  };

  return (
    <div className="bg-card flex flex-col h-[300px] border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-foreground">SQL Editor</h2>
          <span className="text-xs text-muted-foreground">
            Press ⌘+Enter to execute
          </span>
        </div>
        <Button
          onClick={handleExecute}
          disabled={isExecuting || !query.trim()}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isExecuting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Execute Query
            </>
          )}
        </Button>
      </div>
      <div className="relative flex-1 min-h-0">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-full p-4 bg-background text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 border-0"
          placeholder="Enter your SQL query here..."
          spellCheck={false}
        />
        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          {query.length} characters
        </div>
      </div>
    </div>
  );
}
