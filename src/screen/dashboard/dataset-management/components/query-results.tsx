import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  Database,
  Download,
  Maximize2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface QueryResultsProps {
  results: {
    columns: string[];
    rows: any[];
    rowCount: number;
    executionTime: string;
    error?: string;
  } | null;
}

export function QueryResults({ results }: QueryResultsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!results) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            Execute a query to see results
          </p>
        </div>
      </div>
    );
  }

  const hasError = results.error;
  const hasData = results.rows && results.rows.length > 0;

  const exportToCSV = () => {
    try {
      // Create CSV content
      const csvContent = [
        // Header row
        results.columns.join(","),
        // Data rows
        ...results.rows.map((row) =>
          results.columns
            .map((col) => {
              const value = row[col];
              // Handle null/undefined
              if (value === null || value === undefined) return "";
              // Escape quotes and wrap in quotes if contains comma
              const stringValue = String(value);
              if (stringValue.includes(",") || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            })
            .join(",")
        ),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `query_results_${Date.now()}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error("Failed to export CSV", {
        description:
          error instanceof Error ? error.message : "Failed to export CSV",
        duration: 5000,
      });
    }
  };

  const ResultsTable = ({ fullScreen = false }: { fullScreen?: boolean }) => (
    <div
      className={
        fullScreen
          ? "w-full h-full overflow-hidden"
          : "flex-1 overflow-hidden min-h-0"
      }
    >
      <ScrollArea className="h-full w-full">
        <div className="min-w-max">
          <table className="w-full caption-bottom text-sm min-w-full">
            <TableHeader className="sticky top-0 z-10 bg-card backdrop-blur-sm">
              <TableRow className="border-b border-border">
                {results.columns.map((column) => (
                  <TableHead
                    key={column}
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 text-left whitespace-nowrap"
                  >
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.rows.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="hover:bg-muted/30 transition-colors border-b border-border/50"
                >
                  {results.columns.map((column) => (
                    <TableCell
                      key={column}
                      className="font-mono text-sm px-6 py-4 whitespace-nowrap"
                    >
                      {row[column] !== null && row[column] !== undefined ? (
                        <span className="text-foreground">
                          {String(row[column])}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">
                          null
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background rounded-lg border border-border shadow-sm">
      {/* Header with status */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0 rounded-t-lg">
        <div className="flex items-center gap-3">
          {hasError ? (
            <div className="p-1 rounded-full bg-destructive/10">
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
          ) : (
            <div className="p-1 rounded-full bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          )}
          <span className="text-sm font-medium text-foreground">
            {hasError
              ? "Query execution failed"
              : "Query executed successfully"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!hasError && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              <span className="font-medium">{results.rowCount} rows</span>
              <span>{results.executionTime}</span>
            </div>
          )}
          {hasData && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2"
            >
              <Maximize2 className="h-4 w-4" />
              Expand
            </Button>
          )}
        </div>
      </div>

      {/* Error display */}
      {hasError && (
        <div className="p-4 border-b border-border bg-destructive/5">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="font-mono text-sm">
              {results.error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Data table */}
      {hasData && <ResultsTable />}

      {/* No data message when no error but no data */}
      {!hasError && !hasData && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Database className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No data returned</p>
          </div>
        </div>
      )}

      {/* Expanded View Dialog */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent
          className="max-w-[98vw] sm:!max-w-[98vw] w-[98vw] max-h-[95vh] h-[95vh] flex flex-col p-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-6 py-5 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between w-full gap-6 pr-12">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-1.5 rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-lg font-semibold mb-1.5">
                    Query Results
                  </DialogTitle>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-medium">{results.rowCount} rows</span>
                    <span className="text-muted-foreground/50">•</span>
                    <span>{results.executionTime}</span>
                    <span className="text-muted-foreground/50">•</span>
                    <span>{results.columns.length} columns</span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="default"
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 mr-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-hidden px-6 pb-6 pt-4">
            {hasData && <ResultsTable fullScreen />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
