import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import type { GooglePDF } from "../types";

interface PDFCardProps {
  pdf: GooglePDF;
  isSelected: boolean;
  onSelect: () => void;
  onOpen?: (pdf: GooglePDF) => void;
}

export function PDFCard({
  pdf,
  isSelected,
  onSelect,
  onOpen,
}: PDFCardProps) {
  const handleClick = () => {
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
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
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
              className={`h-6 w-6 ${
                isSelected ? "text-red-600 dark:text-red-400" : "text-red-500 dark:text-red-400"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3
              className="font-medium text-sm truncate"
              title={pdf.name}
            >
              {pdf.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">PDF Document</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

