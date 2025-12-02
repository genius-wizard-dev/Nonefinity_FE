import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

// Helper function to generate ID from heading text (same as in MarkdownRenderer)
const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Parse markdown content to extract headings
const parseHeadings = (content: string): Heading[] => {
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = generateId(text);
    headings.push({ id, text, level });
  }

  return headings;
};

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  content,
  className,
}) => {
  const [activeId, setActiveId] = useState<string>("");
  const headings = useMemo(() => parseHeadings(content), [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    // Set first heading as active initially
    setActiveId(headings[0].id);

    // Create intersection observer to track which heading is in view
    const observerOptions = {
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    // Observe all headings
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveId(id);
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="sticky top-20">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Mục Lục
          </h3>
          <div className="h-px bg-border" />
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <nav className="space-y-1">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-start gap-2",
                  activeId === heading.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                style={{ paddingLeft: `${(heading.level - 1) * 12 + 12}px` }}
              >
                {heading.level > 1 && (
                  <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-50 mt-0.5" />
                )}
                <span className="truncate">{heading.text}</span>
              </button>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
};
