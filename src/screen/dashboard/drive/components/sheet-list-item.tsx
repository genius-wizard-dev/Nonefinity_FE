import { Button } from "@/components/ui/button";
import { FileSpreadsheet, ExternalLink } from "lucide-react";
import type { GoogleSheet } from "../types";

interface SheetListItemProps {
  sheet: GoogleSheet;
  isSelected: boolean;
  onSelect: () => void;
  onOpen?: (sheet: GoogleSheet) => void;
}

export function SheetListItem({
  sheet,
  isSelected,
  onSelect,
  onOpen,
}: SheetListItemProps) {
  const handleOpen = () => {
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
    <tr
      className={`border-b hover:bg-muted/50 transition-colors ${
        isSelected ? "bg-muted/30" : ""
      }`}
    >
      <td className="px-4 py-3 overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
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
              className={`h-5 w-5 ${
                isSelected ? "text-green-600 dark:text-green-400" : "text-green-500 dark:text-green-400"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3
              className="font-medium text-sm truncate block"
              title={sheet.name}
            >
              {sheet.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              Google Sheet
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground">Spreadsheet</span>
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

