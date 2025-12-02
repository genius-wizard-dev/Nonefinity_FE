import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css";
import "highlight.js/styles/github.css";

interface MarkdownRendererProps {
  content: string;
}

// Helper function to generate ID from heading text
const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-20">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          h1: ({ children }) => {
            const id = generateId(String(children));
            return (
              <h1
                id={id}
                className="text-4xl font-bold mt-8 mb-4 text-foreground scroll-mt-20"
              >
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const id = generateId(String(children));
            return (
              <h2
                id={id}
                className="text-3xl font-semibold mt-8 mb-3 text-foreground scroll-mt-20"
              >
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = generateId(String(children));
            return (
              <h3
                id={id}
                className="text-2xl font-semibold mt-6 mb-2 text-foreground scroll-mt-20"
              >
                {children}
              </h3>
            );
          },
          h4: ({ children }) => {
            const id = generateId(String(children));
            return (
              <h4
                id={id}
                className="text-xl font-semibold mt-4 mb-2 text-foreground scroll-mt-20"
              >
                {children}
              </h4>
            );
          },
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-foreground">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4 text-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 ml-4 text-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-2 text-foreground">{children}</li>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                  {children}
                </code>
              );
            }
            return <code className={className}>{children}</code>;
          },
          pre: ({ children }) => (
            <pre className="bg-muted p-4 rounded-lg text-sm font-mono text-foreground overflow-x-auto mb-4 border dark:bg-muted/50">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground bg-muted/50 rounded-r">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">{children}</em>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-primary hover:underline"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => {
            // Support both local images and external URLs
            const imageSrc = src?.startsWith("http")
              ? src
              : src?.startsWith("/")
              ? src
              : `/docs/images/${src}`;
            return (
              <img
                src={imageSrc}
                alt={alt}
                className="rounded-lg shadow-md my-6 max-w-full h-auto"
                loading="lazy"
              />
            );
          },
          hr: () => (
            <hr className="my-8 border-t border-border" />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-6 border rounded-lg shadow-sm">
              <table className="min-w-full text-sm border-collapse bg-card">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-muted/50 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-semibold text-foreground border-b">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-foreground border-b">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

