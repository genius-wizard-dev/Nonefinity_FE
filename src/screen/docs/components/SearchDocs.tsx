import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SearchResult {
  text: string;
  context: string;
  headingId?: string;
  headingText?: string;
}

interface SearchDocsProps {
  content: string;
  onResultClick?: (headingId: string) => void;
  className?: string;
}

// Helper function to generate ID from heading text
const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Extract text content from markdown (remove markdown syntax)
const extractText = (markdown: string): string => {
  return markdown
    .replace(/#{1,6}\s+/g, "") // Remove headings
    .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.+?)\*/g, "$1") // Remove italic
    .replace(/`(.+?)`/g, "$1") // Remove inline code
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/---/g, "") // Remove horizontal rules
    .replace(/>\s+/g, "") // Remove blockquotes
    .trim();
};

// Find the nearest heading before a match
const findNearestHeading = (
  content: string,
  matchIndex: number
): { id: string; text: string } | null => {
  const beforeMatch = content.substring(0, matchIndex);
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  let lastMatch: { id: string; text: string } | null = null;
  let match;

  while ((match = headingRegex.exec(beforeMatch)) !== null) {
    const text = match[2].trim();
    const id = generateId(text);
    lastMatch = { id, text };
  }

  return lastMatch;
};

export const SearchDocs: React.FC<SearchDocsProps> = ({
  content,
  onResultClick,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];
    const lines = content.split("\n");

    lines.forEach((line, lineIndex) => {
      const text = extractText(line);
      if (text.toLowerCase().includes(query)) {
        const matchIndex = content.indexOf(line);
        const heading = findNearestHeading(content, matchIndex);

        // Get context (previous and next lines)
        const contextStart = Math.max(0, lineIndex - 1);
        const contextEnd = Math.min(lines.length, lineIndex + 2);
        const context = lines
          .slice(contextStart, contextEnd)
          .map((l) => extractText(l))
          .join(" ")
          .substring(0, 150);

        results.push({
          text: text.substring(0, 200),
          context,
          headingId: heading?.id,
          headingText: heading?.text,
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }, [content, searchQuery]);

  const handleResultClick = (result: SearchResult) => {
    if (result.headingId) {
      const element = document.getElementById(result.headingId);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        if (onResultClick) {
          onResultClick(result.headingId);
        }
      }
    }
    setIsOpen(false);
    setSearchQuery("");
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm trong tài liệu..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={() => {
              setSearchQuery("");
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && searchQuery && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <ScrollArea className="max-h-96">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b mb-2">
                {searchResults.length} kết quả
              </div>
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-3 rounded-md hover:bg-muted/50 transition-colors space-y-1"
                >
                  {result.headingText && (
                    <div className="text-xs font-semibold text-primary">
                      {result.headingText}
                    </div>
                  )}
                  <div className="text-sm text-foreground">
                    {highlightText(result.text, searchQuery)}
                  </div>
                  {result.context && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {highlightText(result.context, searchQuery)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {isOpen && searchQuery && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg z-50 p-4 text-center">
          <div className="text-sm text-muted-foreground">
            Không tìm thấy kết quả cho "{searchQuery}"
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

