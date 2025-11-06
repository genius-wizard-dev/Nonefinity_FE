import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";
import type { GooglePDF } from "../types";

interface PDFListItemProps {
  pdf: GooglePDF;
  isSelected: boolean;
  onSelect: () => void;
  onOpen?: (pdf: GooglePDF) => void;
}

export function PDFListItem({
  pdf,
  isSelected,
  onSelect,
  onOpen,
}: PDFListItemProps) {
  const handleOpen = () => {
    if (onOpen) {
      onOpen(pdf);
    } else {
      // Open PDF in Google Drive viewer
      window.open(
        `https://drive.google.com/file/d/${pdf.id}/view`,
        "_blank"
      );
    }
  };

  return (
    <tr
      className={`border-b hover:bg-muted/50 transition-colors ${
        isSelected ? "bg-muted/30" : ""
      }`}
    >
      <td className="px-4 py-3 overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex-shrink-0 p-2 rounded-lg ${
              isSelected ? "bg-red-100 dark:bg-red-900/30" : "bg-red-50 dark:bg-red-950/30"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <FileText
              className={`h-5 w-5 ${
                isSelected ? "text-red-600 dark:text-red-400" : "text-red-500 dark:text-red-400"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3
              className="font-medium text-sm truncate block"
              title={pdf.name}
            >
              {pdf.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              PDF Document
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground">PDF</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpen}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </Button>
        </div>
      </td>
    </tr>
  );
}

