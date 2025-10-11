import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Loader2, Trash2 } from "lucide-react";

interface ModelTableProps {
  models: any[];
  loading: boolean;
  credentials: any[];
  togglingStatus: string | null;
  settingDefault: string | null;
  deletingModelId: string | null;
  onEdit: (model: any) => void;
  onDelete: (modelId: string) => void;
  onToggleStatus: (modelId: string, currentStatus: boolean) => void;
  onSetDefault: (modelId: string, isDefault: boolean) => void;
}

export function ModelTable({
  models,
  loading,
  credentials,
  togglingStatus,
  settingDefault,
  deletingModelId,
  onEdit,
  onDelete,
  onToggleStatus,
  onSetDefault,
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
            <TableHead className="font-semibold text-foreground">
              Name
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Model ID
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Type
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Credential
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Status
            </TableHead>

            <TableHead className="font-semibold text-foreground">
              Created
            </TableHead>
            <TableHead className="w-[120px] font-semibold text-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && models.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading models...</span>
                </div>
              </TableCell>
            </TableRow>
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
                <TableCell className="font-medium text-foreground">
                  <div>
                    <p>{model.name}</p>
                    {model.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {model.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-sm font-mono">{model.model}</code>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={model.type === "chat" ? "default" : "secondary"}
                  >
                    {model.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getCredentialById(model.credential_id)?.name || "N/A"}
                </TableCell>
                <TableCell>
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

                <TableCell className="text-muted-foreground">
                  {formatDate(model.created_at)}
                </TableCell>
                <TableCell>
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
