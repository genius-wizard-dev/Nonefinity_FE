import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Check, Database, Edit2, X } from "lucide-react";
import { useState } from "react";
import type { Dataset } from "../types";

interface DatasetDetailsProps {
  dataset: Dataset;
  onUpdateDataset: (datasetId: string, updates: Partial<Dataset>) => void;
}

export function DatasetDetails({
  dataset,
  onUpdateDataset,
}: DatasetDetailsProps) {
  const [editingDatasetName, setEditingDatasetName] = useState(false);
  const [datasetName, setDatasetName] = useState(dataset.name);
  const [editingDatasetDesc, setEditingDatasetDesc] = useState(false);
  const [datasetDesc, setDatasetDesc] = useState(dataset.description);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [columnDesc, setColumnDesc] = useState("");

  const handleSaveDatasetName = () => {
    if (datasetName.trim() && datasetName !== dataset.name) {
      onUpdateDataset(dataset.id, { name: datasetName.trim() });
    }
    setEditingDatasetName(false);
  };

  const handleCancelDatasetName = () => {
    setDatasetName(dataset.name);
    setEditingDatasetName(false);
  };

  const handleSaveDatasetDesc = () => {
    onUpdateDataset(dataset.id, { description: datasetDesc });
    setEditingDatasetDesc(false);
  };

  const handleCancelDatasetDesc = () => {
    setDatasetDesc(dataset.description);
    setEditingDatasetDesc(false);
  };

  const handleEditColumn = (columnName: string, currentDesc: string) => {
    setEditingColumn(columnName);
    setColumnDesc(currentDesc);
  };

  const handleSaveColumnDesc = (columnName: string) => {
    // Update column description in dataset schema
    const updatedSchema = dataset.data_schema.map((col) =>
      col.column_name === columnName ? { ...col, desc: columnDesc } : col
    );
    onUpdateDataset(dataset.id, { data_schema: updatedSchema });
    setEditingColumn(null);
  };

  const handleCancelColumnDesc = () => {
    setEditingColumn(null);
    setColumnDesc("");
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {editingDatasetName ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    className="font-mono text-xl font-semibold h-9"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveDatasetName();
                      if (e.key === "Escape") handleCancelDatasetName();
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveDatasetName}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelDatasetName}
                    className="h-8 w-8 p-0 bg-transparent"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <h2
                    className="text-xl font-semibold text-foreground font-mono cursor-pointer hover:text-primary transition-colors group flex items-center gap-2"
                    onClick={() => setEditingDatasetName(true)}
                  >
                    {dataset.name}
                    <Edit2 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground">
                    {dataset.rowCount?.toLocaleString() || 0} rows
                  </span>
                </>
              )}
            </div>

            <div className="mt-2">
              {editingDatasetDesc ? (
                <div className="flex items-start gap-2">
                  <Textarea
                    value={datasetDesc}
                    onChange={(e) => setDatasetDesc(e.target.value)}
                    placeholder="Add dataset description..."
                    className="flex-1 text-sm min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.metaKey)
                        handleSaveDatasetDesc();
                      if (e.key === "Escape") handleCancelDatasetDesc();
                    }}
                  />
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      onClick={handleSaveDatasetDesc}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelDatasetDesc}
                      className="h-8 w-8 p-0 bg-transparent"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setEditingDatasetDesc(true)}
                  className="flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer group p-2 rounded hover:bg-secondary/50 transition-colors"
                >
                  <p className="flex-1">
                    {dataset.description || "Click to add description..."}
                  </p>
                  <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full max-h-[calc(100vh-200px)]">
          <div className="p-6 pb-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Columns</h3>
              <span className="text-xs text-muted-foreground">
                {dataset.data_schema.length} total
              </span>
            </div>
            <div className="space-y-3">
              {dataset.data_schema.map((column) => (
                <div
                  key={column.column_name}
                  className="border border-border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {column.column_name}
                      </span>
                      {/* Note: Primary key detection would need to be implemented based on your schema */}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                      {column.column_type}
                    </span>
                  </div>

                  {editingColumn === column.column_name ? (
                    <div className="flex items-start gap-2 mt-3">
                      <Textarea
                        value={columnDesc}
                        onChange={(e) => setColumnDesc(e.target.value)}
                        placeholder="Add column description..."
                        className="flex-1 text-xs min-h-[50px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.metaKey)
                            handleSaveColumnDesc(column.column_name);
                          if (e.key === "Escape") handleCancelColumnDesc();
                        }}
                      />
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleSaveColumnDesc(column.column_name)
                          }
                          className="h-7 w-7 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelColumnDesc}
                          className="h-7 w-7 p-0 bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() =>
                        handleEditColumn(column.column_name, column.desc || "")
                      }
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer group flex items-start gap-2 mt-2 p-2 rounded hover:bg-secondary/50 transition-colors"
                    >
                      <p className="flex-1">
                        {column.desc || "Click to add description..."}
                      </p>
                      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border">
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                      Column Type: {column.column_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
