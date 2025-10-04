import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Database } from "lucide-react";

interface QueryResultsProps {
  results: {
    columns: string[];
    rows: any[];
    rowCount: number;
    executionTime: string;
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

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span className="text-sm text-foreground">
            Query executed successfully
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{results.rowCount} rows</span>
          <span>{results.executionTime}</span>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-card sticky top-0">
              <tr>
                {results.columns.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-card/50 transition-colors"
                >
                  {results.columns.map((column) => (
                    <td
                      key={column}
                      className="px-4 py-3 text-sm text-foreground font-mono whitespace-nowrap"
                    >
                      {row[column] !== null && row[column] !== undefined ? (
                        String(row[column])
                      ) : (
                        <span className="text-muted-foreground italic">
                          null
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
}
