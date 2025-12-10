import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Download, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import * as XLSX from "xlsx";
import type { FileItem } from "../types";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: FileItem | null;
  url: string | null;
  onDownload: (fileId: string) => void;
  onDelete?: (fileId: string) => void | Promise<void>;
}

export function FilePreviewModal({
  open,
  onOpenChange,
  file,
  url,
  onDownload,
  onDelete,
}: FilePreviewModalProps) {
  const [content, setContent] = useState<string | any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !url || !file) {
      setContent(null);
      setError(null);
      setNumPages(null);
      setIsDeleting(false);
      return;
    }

    const loadContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fileExt = (file.ext || "").toLowerCase();

        if (fileExt === ".pdf") {
          // PDF handled by react-pdf which takes URL directly
          setIsLoading(false);
          return;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch file content");

        if (fileExt === ".md" || fileExt === ".txt") {
          const text = await response.text();
          setContent(text);
        } else if (
          fileExt === ".csv" ||
          fileExt === ".xlsx" ||
          fileExt === ".xls"
        ) {
          const arrayBuffer = await response.arrayBuffer();
          // Read with UTF-8 encoding for proper character display
          const workbook = XLSX.read(arrayBuffer, {
            type: "array",
            codepage: 65001, // UTF-8 codepage
            raw: false,
          });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            defval: "",
          });
          setContent(jsonData);
        } else {
          // For other files, we can't preview, but we shouldn't really be here due to parent logic.
          // But just in case:
          setError("Preview not supported for this file type");
        }
      } catch (err: any) {
        console.error("Preview error:", err);
        setError("Failed to load preview");
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [open, url, file]);

  const renderContent = () => {
    if (!file) return null;

    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-lg font-medium">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onDownload(file.id)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download File
            </Button>
          </div>
        </div>
      );
    }

    const fileExt = (file.ext || "").toLowerCase();

    if (fileExt === ".pdf") {
      return (
        <div className="flex min-h-full justify-center bg-gray-100 p-4 dark:bg-gray-800">
          <Document
            file={url}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(err) =>
              setError(`Failed to load PDF: ${err.message}`)
            }
            loading={
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            }
          >
            {Array.from(new Array(numPages || 0), (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                className="mb-4 shadow-lg"
                width={Math.min(window.innerWidth * 0.8, 800)}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>
        </div>
      );
    }

    if (fileExt === ".md") {
      return (
        <div className="prose prose-sm max-w-none p-6 dark:prose-invert">
          <ReactMarkdown>{content as string}</ReactMarkdown>
        </div>
      );
    }

    if (fileExt === ".txt") {
      return (
        <pre className="whitespace-pre-wrap p-4 font-mono text-sm">
          {content as string}
        </pre>
      );
    }

    if (fileExt === ".csv" || fileExt === ".xlsx" || fileExt === ".xls") {
      const data = content as any[][];
      if (!data || data.length === 0) return <p className="p-4">Empty file</p>;

      return (
        <div className="h-full w-full overflow-auto">
          <table className="border-collapse text-sm w-full min-w-max table-auto">
            <thead className="sticky top-0 z-10 bg-muted">
              {data.length > 0 && (
                <tr className="border-b-2 border-border">
                  {data[0].map((cell: any, cellIndex: number) => (
                    <th
                      key={cellIndex}
                      className="border-r border-border px-4 py-3 text-left font-semibold last:border-r-0 whitespace-nowrap"
                      title={String(cell ?? "")}
                    >
                      {String(cell ?? "")}
                    </th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {data.slice(1).map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-border hover:bg-muted/50"
                >
                  {row.map((cell: any, cellIndex: number) => (
                    <td
                      key={cellIndex}
                      className="border-r border-border px-4 py-2 last:border-r-0 whitespace-normal break-words"
                      title={String(cell ?? "")}
                    >
                      {String(cell ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="flex h-full items-center justify-center">
        <p>Preview not available</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] w-[70vw] max-w-none flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <div className="flex items-center justify-between gap-4 pr-8">
            <DialogTitle className="flex-1 truncate text-left">
              {file?.name}
              <span className="ml-2 font-normal text-muted-foreground">
                ({file?.ext})
              </span>
            </DialogTitle>
            {file && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(file.id)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                    onClick={async () => {
                      setIsDeleting(true);
                      try {
                        await onDelete(file.id);
                        onOpenChange(false);
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-auto">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
