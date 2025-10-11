import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Loader2, Play, Upload } from "lucide-react";
import type { Model } from "../../models/type";

interface File {
  id: string;
  name: string;
  size?: number;
}

interface EmbeddingForm {
  file_id: string;
  model_id: string;
  metadata: Record<string, any>;
}

interface CreateEmbeddingFormProps {
  embeddingForm: EmbeddingForm;
  setEmbeddingForm: (form: EmbeddingForm) => void;
  models: Model[];
  allowExtractFiles: File[];
  filesLoading: boolean;
  loading: boolean;
  isCreating: boolean;
  onCreateEmbedding: () => void;
}

export function CreateEmbeddingForm({
  embeddingForm,
  setEmbeddingForm,
  models,
  allowExtractFiles,
  filesLoading,
  loading,
  isCreating,
  onCreateEmbedding,
}: CreateEmbeddingFormProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            Create File Embedding
          </CardTitle>
          <CardDescription className="text-base">
            Generate embeddings from your uploaded files to enable semantic
            search and AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="embedding-file" className="text-base font-semibold">
              Select File *
            </Label>
            {filesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading files...
                </div>
              </div>
            ) : (
              <Select
                value={embeddingForm.file_id}
                onValueChange={(value) =>
                  setEmbeddingForm({ ...embeddingForm, file_id: value })
                }
                disabled={isCreating}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Choose a file to embed..." />
                </SelectTrigger>
                <SelectContent>
                  {allowExtractFiles.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      No files available for embedding
                    </div>
                  ) : (
                    allowExtractFiles.map((file) => (
                      <SelectItem key={file.id} value={file.id}>
                        <div className="flex items-center gap-3 py-1">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="font-medium">{file.name}</span>
                          <Badge variant="outline" className="ml-auto">
                            {file.size
                              ? `${(file.size / 1024).toFixed(1)}KB`
                              : "Unknown"}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="embedding-model"
              className="text-base font-semibold"
            >
              Model (Optional)
            </Label>
            <Select
              value={embeddingForm.model_id}
              onValueChange={(value) =>
                setEmbeddingForm({ ...embeddingForm, model_id: value })
              }
              disabled={isCreating}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select a model (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">
                  <div className="flex items-center gap-2 py-1">
                    <span className="font-medium text-muted-foreground">
                      Use Default Model
                    </span>
                    <Badge variant="outline" className="ml-2">
                      Auto
                    </Badge>
                  </div>
                </SelectItem>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between w-full py-1">
                      <span className="font-medium">{model.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {model.model}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button
              onClick={onCreateEmbedding}
              disabled={loading || !embeddingForm.file_id || isCreating}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {loading ? "Processing..." : "Creating Embedding..."}
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Create Embedding
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
