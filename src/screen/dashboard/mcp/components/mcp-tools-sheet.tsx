import { LogoSpinner } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import "highlight.js/styles/github-dark.css";
import "highlight.js/styles/github.css";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import type { MCPTool } from "../mcp-service";

interface MCPToolsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mcpName: string;
  tools: MCPTool[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

// Helper function to parse and format JSON schema
const formatJsonSchema = (schemaStr: string): string => {
  try {
    // Replace single quotes with double quotes for valid JSON
    const jsonStr = schemaStr
      .replace(/'/g, '"')
      .replace(/False/g, "false")
      .replace(/True/g, "true");
    const parsed = JSON.parse(jsonStr);
    return JSON.stringify(parsed, null, 2);
  } catch {
    // If parsing fails, try to format as-is
    try {
      const parsed = JSON.parse(schemaStr);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return schemaStr;
    }
  }
};

export function MCPToolsSheet({
  isOpen,
  onOpenChange,
  mcpName,
  tools,
  isLoading,
  searchQuery,
  onSearchChange,
}: MCPToolsSheetProps) {
  const [expandedSchemas, setExpandedSchemas] = useState<Set<number>>(
    new Set()
  );
  const [expandedTools, setExpandedTools] = useState<Set<number>>(new Set());

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSchema = (index: number) => {
    const newExpanded = new Set(expandedSchemas);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSchemas(newExpanded);
  };

  const toggleTool = (index: number) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTools(newExpanded);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl flex flex-col h-full p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
            <SheetTitle className="text-xl font-bold">
              {mcpName} - Tools
            </SheetTitle>
            <SheetDescription className="text-sm">
              List of available tools from this MCP server
            </SheetDescription>
          </SheetHeader>

          <div className="flex-shrink-0 px-6 py-4 border-b space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>

            {!isLoading && (
              <div className="text-sm font-medium text-muted-foreground">
                {filteredTools.length} tool
                {filteredTools.length !== 1 ? "s" : ""} available
              </div>
            )}
          </div>

          <ScrollArea className="flex-1 min-h-0 px-6">
            <div className="py-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <LogoSpinner size="lg" />
                </div>
              ) : filteredTools.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-muted-foreground">
                    {searchQuery ? (
                      <>
                        <p className="text-sm font-medium mb-1">
                          No tools found
                        </p>
                        <p className="text-xs">
                          Try adjusting your search query
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium mb-1">
                          No tools available
                        </p>
                        <p className="text-xs">
                          This MCP server doesn't have any tools configured
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTools.map((tool, index) => {
                    const isExpanded = expandedTools.has(index);
                    return (
                      <div
                        key={index}
                        className="rounded-lg border bg-card hover:border-primary/50 hover:shadow-md transition-all overflow-hidden"
                      >
                        <button
                          onClick={() => toggleTool(index)}
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-accent/50 transition-colors"
                        >
                          <h3 className="text-base font-semibold text-foreground">
                            {tool.name}
                          </h3>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-4 border-t">
                            {tool.description && (
                              <div className="text-sm text-muted-foreground leading-relaxed pt-4 prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm, remarkBreaks]}
                                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                                  components={{
                                    h1: ({ children }) => (
                                      <h1 className="text-base font-semibold mt-4 mb-2 text-foreground">
                                        {children}
                                      </h1>
                                    ),
                                    h2: ({ children }) => (
                                      <h2 className="text-sm font-semibold mt-3 mb-2 text-foreground">
                                        {children}
                                      </h2>
                                    ),
                                    h3: ({ children }) => (
                                      <h3 className="text-sm font-semibold mt-2 mb-1 text-foreground">
                                        {children}
                                      </h3>
                                    ),
                                    p: ({ children }) => (
                                      <p className="mb-3 leading-relaxed whitespace-pre-wrap">
                                        {children}
                                      </p>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="list-decimal list-inside mb-3 space-y-1 ml-2">
                                        {children}
                                      </ol>
                                    ),
                                    li: ({ children }) => (
                                      <li className="ml-1">{children}</li>
                                    ),
                                    code: ({ children, className }) => {
                                      const isInline = !className;
                                      if (isInline) {
                                        return (
                                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">
                                            {children}
                                          </code>
                                        );
                                      }
                                      // For code blocks, the className will be like "language-json"
                                      return (
                                        <code className={className}>
                                          {children}
                                        </code>
                                      );
                                    },
                                    pre: ({ children }) => (
                                      <pre className="bg-muted p-4 rounded-md text-xs font-mono text-foreground overflow-x-auto mb-4 border dark:bg-muted/50">
                                        {children}
                                      </pre>
                                    ),
                                    strong: ({ children }) => (
                                      <strong className="font-semibold text-foreground">
                                        {children}
                                      </strong>
                                    ),
                                    em: ({ children }) => (
                                      <em className="italic">{children}</em>
                                    ),
                                    table: ({ children }) => (
                                      <div className="overflow-x-auto mb-4 border rounded-lg shadow-sm">
                                        <table className="min-w-full text-xs border-collapse bg-card">
                                          {children}
                                        </table>
                                      </div>
                                    ),
                                    thead: ({ children }) => (
                                      <thead className="bg-muted/50">
                                        {children}
                                      </thead>
                                    ),
                                    tbody: ({ children }) => (
                                      <tbody className="divide-y divide-border">
                                        {children}
                                      </tbody>
                                    ),
                                    tr: ({ children }) => (
                                      <tr className="border-b border-border hover:bg-muted/30 transition-colors">
                                        {children}
                                      </tr>
                                    ),
                                    th: ({ children }) => (
                                      <th className="border-r border-border px-4 py-3 bg-muted/50 font-semibold text-left text-foreground first:border-l-0">
                                        {children}
                                      </th>
                                    ),
                                    td: ({ children }) => (
                                      <td className="border-r border-border px-4 py-3 text-muted-foreground first:border-l-0">
                                        {children}
                                      </td>
                                    ),
                                  }}
                                >
                                  {tool.description}
                                </ReactMarkdown>
                              </div>
                            )}

                            {tool.args_schema && (
                              <div className="pt-4 border-t">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSchema(index);
                                  }}
                                  className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors w-full text-left mb-3"
                                >
                                  {expandedSchemas.has(index) ? (
                                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                  )}
                                  <span>Args Schema</span>
                                </button>
                                {expandedSchemas.has(index) && (
                                  <div className="bg-muted/50 border rounded-lg overflow-hidden">
                                    <ScrollArea className="h-[400px]">
                                      <div className="p-4">
                                        <ReactMarkdown
                                          remarkPlugins={[
                                            remarkGfm,
                                            remarkBreaks,
                                          ]}
                                          rehypePlugins={[
                                            rehypeHighlight,
                                            rehypeRaw,
                                          ]}
                                          components={{
                                            pre: ({ children }) => (
                                              <pre className="p-0 m-0 text-xs font-mono text-foreground overflow-x-auto">
                                                {children}
                                              </pre>
                                            ),
                                            code: ({ children, className }) => {
                                              const isInline = !className;
                                              if (isInline) {
                                                return (
                                                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">
                                                    {children}
                                                  </code>
                                                );
                                              }
                                              return (
                                                <code className={className}>
                                                  {children}
                                                </code>
                                              );
                                            },
                                          }}
                                        >
                                          {`\`\`\`json\n${formatJsonSchema(
                                            tool.args_schema
                                          )}\n\`\`\``}
                                        </ReactMarkdown>
                                      </div>
                                    </ScrollArea>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
