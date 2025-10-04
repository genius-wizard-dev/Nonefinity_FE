import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Database, XCircle } from "lucide-react";

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
        {!hasError && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            <span className="font-medium">{results.rowCount} rows</span>
            <span>{results.executionTime}</span>
          </div>
        )}
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
      {hasData && (
        <div className="flex-1 overflow-auto min-h-0">
          <div className="relative w-full h-full">
            <table className="w-full caption-bottom text-sm">
              <TableHeader className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm">
                <TableRow className="border-b border-border">
                  {results.columns.map((column) => (
                    <TableHead
                      key={column}
                      className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 text-left"
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
                        className="font-mono text-sm px-6 py-4"
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
        </div>
      )}

      {/* No data message when no error but no data */}
      {!hasError && !hasData && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Database className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No data returned</p>
          </div>
        </div>
      )}
    </div>
  );
}
