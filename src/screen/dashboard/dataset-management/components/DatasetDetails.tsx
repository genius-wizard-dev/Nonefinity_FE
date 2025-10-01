import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  Database,
  FileText,
  RefreshCw,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { DatasetService, type Dataset } from "../services";

export interface DatasetDetailsProps {
  datasetId: string;
  onDatasetDeleted: () => void;
}

const DatasetDetails: React.FC<DatasetDetailsProps> = ({
  datasetId,
  onDatasetDeleted,
}) => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadDataset = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DatasetService.getDataset(datasetId);
      setDataset(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dataset details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (datasetId) {
      loadDataset();
    }
  }, [datasetId]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await DatasetService.deleteDataset(datasetId);
      setDeleteDialogOpen(false);
      onDatasetDeleted();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete dataset");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading dataset details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <AlertCircle className="h-6 w-6 mr-2" />
        <span>{error}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={loadDataset}
          className="ml-4"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-600">
        <AlertCircle className="h-6 w-6 mr-2" />
        <span>Dataset not found</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{dataset.name}</h2>
          {dataset.description && (
            <p className="text-gray-600 mt-1">{dataset.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Dataset</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{dataset.name}"? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium">
              <Database className="h-4 w-4 mr-2" />
              Dataset ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-mono text-gray-900">{dataset.id}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium">
              <Database className="h-4 w-4 mr-2" />
              Schema Columns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-900">
              {dataset.data_schema?.length || 0} columns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium">
              <FileText className="h-4 w-4 mr-2" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-900">
              {dataset.description || "No description provided"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium">
              <Calendar className="h-4 w-4 mr-2" />
              Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-900">
              {format(new Date(dataset.created_at), "PPP")}
            </p>
            <p className="text-sm text-gray-600">
              {format(new Date(dataset.created_at), "p")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schema Details */}
      {dataset.data_schema && dataset.data_schema.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Data Schema ({dataset.data_schema.length} columns)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dataset.data_schema.map((col, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <p className="font-medium text-gray-900">{col.column_name}</p>
                  <p className="text-sm text-gray-600">{col.column_type}</p>
                  {col.desc && (
                    <p className="text-xs text-gray-500 mt-1">{col.desc}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={loadDataset} disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetDetails;
