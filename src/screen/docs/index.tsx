import { DocsLayout } from "./components/DocsLayout";
import { MarkdownRenderer } from "./components/MarkdownRenderer";
import { docsContent } from "./content";

export default function DocsPage() {
  return (
    <DocsLayout content={docsContent}>
      <MarkdownRenderer content={docsContent} />
    </DocsLayout>
  );
}

