import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Copy,
  Database,
  Edit,
  Loader2,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface ModelTableProps {
  models: any[];
  loading: boolean;
  credentials: any[];
  togglingStatus: string | null;
  deletingModelId: string | null;
  onEdit: (model: any) => void;
  onDelete: (modelId: string) => void;
  onToggleStatus: (modelId: string, currentStatus: boolean) => void;
}

export function ModelTable({
  models,
  loading,
  credentials,
  togglingStatus,
  deletingModelId,
  onEdit,
  onDelete,
  onToggleStatus,
}: ModelTableProps) {
  const getCredentialById = (credentialId: string) => {
    return credentials.find((c) => c.id === credentialId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-card shadow-sm rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50">
            <TableHead className="font-semibold text-foreground pl-6">
              Name
            </TableHead>
            <TableHead className="font-semibold text-foreground pl-4">
              Model ID
            </TableHead>
            <TableHead className="font-semibold text-foreground pl-4">
              Type
            </TableHead>
            <TableHead className="font-semibold text-foreground pl-4">
              Credential
            </TableHead>
            <TableHead className="font-semibold text-foreground pl-4">
              Status
            </TableHead>
            <TableHead className="font-semibold text-foreground pl-4">
              Created
            </TableHead>
            <TableHead className="w-[120px] font-semibold text-foreground pl-4 pr-6">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="overflow-x-auto">
          {loading && models.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="border-border/50">
                <TableCell className="font-medium text-foreground pl-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </TableCell>
                <TableCell className="pl-4">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="pl-4">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="pl-4">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-10 rounded-full" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                  </div>
                </TableCell>
                <TableCell className="pl-4">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="pl-4 pr-6">
                  <div className="flex gap-2 justify-start">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : models.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-8 text-muted-foreground"
              >
                No models found. Add your first model to get started.
              </TableCell>
            </TableRow>
          ) : (
            models.map((model) => (
              <TableRow
                key={model.id}
                className="border-border/50 hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium text-foreground pl-6">
                  <div>
                    <p>{model.name}</p>
                    {model.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {model.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono">{model.model}</code>
                    <button
                      type="button"
                      className="ml-1 p-1 rounded hover:bg-muted transition"
                      title="Copy to clipboard"
                      onClick={() => {
                        navigator.clipboard.writeText(model.model);
                        toast.success("Copied to clipboard");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-2 group relative">
                    {model.type === "chat" ? (
                      <span>
                        <MessageSquare className="h-4 w-4 transition-transform duration-150 " />
                      </span>
                    ) : (
                      <span>
                        <Database className="h-4 w-4 transition-transform duration-150 " />
                      </span>
                    )}
                    <div className="flex flex-col">
                      {model.type === "chat" && (
                        <span className="text-sm font-medium">
                          {model.type}
                        </span>
                      )}
                      {model.type === "embedding" && model.dimension && (
                        <span className="text-sm font-medium">
                          {model.dimension}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground pl-4">
                  {getCredentialById(model.credential_id)?.name || "N/A"}
                </TableCell>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={model.is_active}
                      onCheckedChange={() =>
                        onToggleStatus(model.id, model.is_active)
                      }
                      disabled={togglingStatus === model.id}
                    />
                    {togglingStatus === model.id && (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-muted-foreground pl-4">
                  {formatDate(model.created_at)}
                </TableCell>
                <TableCell className="pl-4 pr-6">
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => onEdit(model)}
                      aria-label="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-600"
                      onClick={() => onDelete(model.id)}
                      aria-label="Delete"
                      disabled={deletingModelId === model.id}
                    >
                      {deletingModelId === model.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
