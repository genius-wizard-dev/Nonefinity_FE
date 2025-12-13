import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClockIcon,
  Copy,
  FileTextIcon,
  WrenchIcon,
} from "lucide-react";
import React, { memo, useCallback, useMemo, useState } from "react";
import { useToolContent } from "../chat-streaming-store";

// Constants for truncation
const MAX_PREVIEW_LENGTH = 500;
const MAX_ITEMS_PREVIEW = 5;

interface ToolResultContentProps {
  content: unknown;
  isExpanded: boolean;
}

/**
 * Optimized component for rendering tool results
 * - Lazy renders full content only when expanded
 * - Auto-parses JSON strings for pretty formatting
 * - Fixed height with scroll for large content
 * - Memoized to prevent unnecessary re-renders
 */
const ToolResultContentInner: React.FC<ToolResultContentProps> = memo(
  ({ content, isExpanded }) => {
    const [copied, setCopied] = useState(false);

    // Try to parse content if it's a JSON string
    const parsedContent = useMemo(() => {
      if (typeof content === "string") {
        try {
          return JSON.parse(content);
        } catch {
          return content; // Not valid JSON, return as-is
        }
      }
      return content;
    }, [content]);

    const handleCopy = useCallback(async () => {
      const textContent =
        typeof parsedContent === "string"
          ? parsedContent
          : JSON.stringify(parsedContent, null, 2);
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, [parsedContent]);

    // Compute formatted preview
    const { preview, isTruncated, itemCount, isJson } = useMemo(() => {
      if (parsedContent === null || parsedContent === undefined) {
        return {
          preview: "null",
          isTruncated: false,
          itemCount: 0,
          isJson: false,
        };
      }

      // If it's a plain string (not parsed JSON)
      if (typeof parsedContent === "string") {
        if (parsedContent.length > MAX_PREVIEW_LENGTH && !isExpanded) {
          return {
            preview: parsedContent.slice(0, MAX_PREVIEW_LENGTH) + "...",
            isTruncated: true,
            itemCount: 0,
            isJson: false,
          };
        }
        return {
          preview: parsedContent,
          isTruncated: false,
          itemCount: 0,
          isJson: false,
        };
      }

      // For arrays
      if (Array.isArray(parsedContent)) {
        const itemCount = parsedContent.length;
        const formatted = JSON.stringify(
          isExpanded
            ? parsedContent
            : parsedContent.slice(0, MAX_ITEMS_PREVIEW),
          null,
          2
        );
        return {
          preview: formatted,
          isTruncated: !isExpanded && itemCount > MAX_ITEMS_PREVIEW,
          itemCount,
          isJson: true,
        };
      }

      // For objects
      if (typeof parsedContent === "object") {
        const formatted = JSON.stringify(parsedContent, null, 2);
        if (formatted.length > MAX_PREVIEW_LENGTH && !isExpanded) {
          return {
            preview: formatted.slice(0, MAX_PREVIEW_LENGTH) + "\n...",
            isTruncated: true,
            itemCount: 0,
            isJson: true,
          };
        }
        return {
          preview: formatted,
          isTruncated: false,
          itemCount: 0,
          isJson: true,
        };
      }

      return {
        preview: String(parsedContent),
        isTruncated: false,
        itemCount: 0,
        isJson: false,
      };
    }, [parsedContent, isExpanded]);

    return (
      <div className="space-y-2">
        {/* Header with copy button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Result
            </span>
            {isJson && (
              <Badge
                variant="outline"
                className="text-xs text-blue-600 border-blue-600/30"
              >
                JSON
              </Badge>
            )}
            {itemCount > 0 && (
              <Badge variant="secondary" className="text-xs font-mono">
                {itemCount} items
              </Badge>
            )}
            {isTruncated && (
              <Badge
                variant="outline"
                className="text-xs text-amber-600 border-amber-600/30"
              >
                Truncated
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            {copied ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="ml-1.5 text-xs">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>

        {/* Content with fixed height and scroll */}
        <div className="relative">
          <pre
            className={cn(
              "p-3 rounded-lg border",
              isJson
                ? "bg-slate-950/5 dark:bg-slate-50/5 border-border/50"
                : "bg-muted/50 border-border/50",
              "text-xs font-mono text-foreground",
              "whitespace-pre-wrap break-words",
              "h-[200px] overflow-auto", // Fixed height with scroll
              "scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent"
            )}
          >
            {preview}
          </pre>
          {/* Scroll hint gradient at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background/80 to-transparent pointer-events-none rounded-b-lg" />
        </div>
      </div>
    );
  }
);

ToolResultContentInner.displayName = "ToolResultContentInner";

// ============================================================================
// Document List Item - for array of documents
// ============================================================================

interface DocumentItemProps {
  item: Record<string, unknown>;
  index: number;
  keyName: string;
}

const DocumentItem: React.FC<DocumentItemProps> = memo(
  ({ item, index, keyName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentValue = item[keyName];
    const isLongContent =
      typeof contentValue === "string" && contentValue.length > 200;

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between gap-3 px-4 py-3 font-medium bg-secondary/50 hover:bg-secondary border border-border/50 rounded-lg transition-all duration-200 cursor-pointer select-none hover:border-primary/30 hover:shadow-sm">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold">
                {index + 1}
              </div>
              <FileTextIcon className="size-4 text-primary flex-shrink-0" />
            </div>
            <span className="text-sm text-foreground font-medium truncate">
              Document {index + 1}
            </span>
            {isLongContent && !isOpen && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                Click to expand
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isLongContent && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {(contentValue as string).length} chars
              </span>
            )}
            {isOpen ? (
              <ChevronUp className="size-4 text-muted-foreground transition-transform" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground transition-transform" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 ml-2 pl-6 border-l-2 border-primary/20 animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 bg-muted/30 rounded-md border border-border/30 text-sm text-foreground whitespace-pre-wrap break-words max-h-[300px] overflow-auto">
              {typeof contentValue === "string" ? (
                <pre className="font-sans whitespace-pre-wrap break-words">
                  {contentValue}
                </pre>
              ) : (
                <pre className="font-sans whitespace-pre-wrap break-words">
                  {JSON.stringify(contentValue, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }
);

DocumentItem.displayName = "DocumentItem";

// ============================================================================
// Main Tool Display Component
// ============================================================================

interface OptimizedToolDisplayProps {
  toolId: string;
  toolName: string;
  toolArgs?: Record<string, unknown>;
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  // For historical messages (already have content)
  staticContent?: unknown;
  // For streaming messages (use content ref)
  contentRef?: string;
  // Default collapsed state
  defaultCollapsed?: boolean;
}

const getStatusBadge = (
  status: OptimizedToolDisplayProps["state"]
): React.ReactNode => {
  const config = {
    "input-streaming": {
      label: "Pending",
      className: "bg-muted/80 text-muted-foreground border-transparent",
      icon: null,
    },
    "input-available": {
      label: "Running",
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      icon: <ClockIcon className="size-3.5 animate-pulse" />,
    },
    "output-available": {
      label: "Completed",
      className: "bg-green-500/10 text-green-600 border-green-500/20",
      icon: <CheckCircle2 className="size-3.5" />,
    },
    "output-error": {
      label: "Error",
      className: "bg-destructive/10 text-destructive border-destructive/20",
      icon: null,
    },
  };

  const { label, className, icon } = config[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 text-xs font-medium pointer-events-none select-none",
        className
      )}
    >
      {icon}
      {label}
    </Badge>
  );
};

export const OptimizedToolDisplay: React.FC<OptimizedToolDisplayProps> = memo(
  ({
    toolName,
    toolArgs,
    state,
    staticContent,
    contentRef,
    defaultCollapsed = true, // Default to collapsed!
  }) => {
    const [isOpen, setIsOpen] = useState(!defaultCollapsed);

    // Get content from store if contentRef provided, otherwise use static content
    const storedContent = useToolContent(contentRef);
    const content = staticContent ?? storedContent;

    const hasContent = content !== undefined && content !== null;
    const hasArgs = toolArgs && Object.keys(toolArgs).length > 0;

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full rounded-lg border border-border/50 bg-card overflow-hidden"
      >
        {/* Header */}
        <CollapsibleTrigger className="w-full flex items-center justify-between gap-4 p-3 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
              <WrenchIcon className="size-4 text-primary" />
            </div>
            <span className="font-medium text-sm truncate">{toolName}</span>
            {getStatusBadge(state)}
          </div>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200 flex-shrink-0",
              isOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>

        {/* Content - Only rendered when open (lazy) */}
        <CollapsibleContent>
          <div className="border-t border-border/50">
            {/* Arguments section */}
            {hasArgs && (
              <div className="p-3 border-b border-border/50">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Parameters
                </div>
                <pre className="p-2 rounded-md bg-muted/30 text-xs font-mono text-foreground whitespace-pre-wrap break-words max-h-[150px] overflow-auto">
                  {JSON.stringify(toolArgs, null, 2)}
                </pre>
              </div>
            )}

            {/* Result section */}
            {hasContent && (
              <div className="p-3">
                <ToolResultContentInner content={content} isExpanded={isOpen} />
              </div>
            )}

            {/* Loading state */}
            {state === "input-available" && !hasContent && (
              <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span>Executing tool...</span>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }
);

OptimizedToolDisplay.displayName = "OptimizedToolDisplay";

// ============================================================================
// Document List Display - Special case for array of documents
// ============================================================================

interface DocumentListDisplayProps {
  documents: Array<Record<string, unknown>>;
  keyName: string;
}

export const DocumentListDisplay: React.FC<DocumentListDisplayProps> = memo(
  ({ documents, keyName }) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Results
          </div>
          <Badge variant="secondary" className="text-xs font-mono">
            {documents.length}{" "}
            {documents.length === 1 ? "document" : "documents"}
          </Badge>
        </div>
        <div className="space-y-2">
          {documents.map((item, idx) => (
            <DocumentItem key={idx} item={item} index={idx} keyName={keyName} />
          ))}
        </div>
      </div>
    );
  }
);

DocumentListDisplay.displayName = "DocumentListDisplay";
