import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { TableOfContents } from "./TableOfContents";
import { SearchDocs } from "./SearchDocs";

interface DocsLayoutProps {
  content: string;
  children: React.ReactNode;
}

export const DocsLayout: React.FC<DocsLayoutProps> = ({ content, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Mục Lục</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <TableOfContents content={content} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Search bar - visible on all screens */}
            <div className="flex-1 max-w-2xl mx-4">
              <SearchDocs content={content} />
            </div>

            {/* Desktop TOC toggle - hidden on mobile */}
            <div className="hidden lg:block">
              <div className="w-64" />
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 py-8">
          {/* Desktop TOC Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <TableOfContents content={content} />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <article className="prose prose-lg dark:prose-invert max-w-none">
              {children}
            </article>
          </main>

          {/* Right spacer for larger screens */}
          <div className="hidden xl:block w-64 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

