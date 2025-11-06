import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet } from "lucide-react";
import type { GoogleSheet } from "../types";

interface SheetCardProps {
  sheet: GoogleSheet;
  isSelected: boolean;
  onSelect: () => void;
  onOpen?: (sheet: GoogleSheet) => void;
}

export function SheetCard({
  sheet,
  isSelected,
  onSelect,
  onOpen,
}: SheetCardProps) {
  const handleClick = () => {
    if (onOpen) {
      onOpen(sheet);
    } else {
      // Open in Google Sheets
      window.open(
        `https://docs.google.com/spreadsheets/d/${sheet.id}`,
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
              isSelected ? "bg-green-100 dark:bg-green-900/30" : "bg-green-50 dark:bg-green-950/30"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <FileSpreadsheet
              className={`h-6 w-6 ${
                isSelected ? "text-green-600 dark:text-green-400" : "text-green-500 dark:text-green-400"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3
              className="font-medium text-sm truncate"
              title={sheet.name}
            >
              {sheet.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Google Sheet
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

