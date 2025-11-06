import { Skeleton } from "@/components/ui/skeleton";
import type { GooglePDF, ViewMode } from "../types";
import { PDFCard } from "./pdf-card";
import { PDFListItem } from "./pdf-list-item";

interface PDFGridProps {
  pdfs: GooglePDF[];
  viewMode: ViewMode;
  selectedPDFs: string[];
  onSelectionChange: (selected: string[]) => void;
  onOpen?: (pdf: GooglePDF) => void;
  isLoading?: boolean;
}

export function PDFGrid({
  pdfs,
  viewMode,
  selectedPDFs,
  onSelectionChange,
  onOpen,
  isLoading,
}: PDFGridProps) {
  const handleSelect = (pdfId: string) => {
    if (selectedPDFs.includes(pdfId)) {
      onSelectionChange(selectedPDFs.filter((id) => id !== pdfId));
    } else {
      onSelectionChange([...selectedPDFs, pdfId]);
    }
  };

  if (isLoading) {
    if (viewMode === "list") {
      return (
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl px-6 py-6">
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-6 w-6 rounded" />
                            <div className="space-y-1 w-1/2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-8 w-16 ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pdfs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">No PDFs found</p>
          <p className="text-sm text-muted-foreground mt-2">
            {selectedPDFs.length > 0
              ? "Try a different search"
              : "Connect your Google account to see your PDFs"}
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full table-fixed">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[60%]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[15%]">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground w-[25%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pdfs.map((pdf) => (
                  <PDFListItem
                    key={pdf.id}
                    pdf={pdf}
                    isSelected={selectedPDFs.includes(pdf.id)}
                    onSelect={() => handleSelect(pdf.id)}
                    onOpen={onOpen}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {pdfs.map((pdf) => (
            <PDFCard
              key={pdf.id}
              pdf={pdf}
              isSelected={selectedPDFs.includes(pdf.id)}
              onSelect={() => handleSelect(pdf.id)}
              onOpen={onOpen}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

