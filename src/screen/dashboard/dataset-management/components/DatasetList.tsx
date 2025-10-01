import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { AlertCircle, Calendar, Database, Eye, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { DatasetService, type Dataset } from "../services";

export interface DatasetListProps {
  onDatasetSelect: (datasetId: string) => void;
  onViewData: (datasetId: string) => void;
}

const DatasetList: React.FC<DatasetListProps> = ({
  onDatasetSelect,
  onViewData,
}) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const loadDatasets = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await DatasetService.getDatasets(pageNum, limit);
      setDatasets(response.datasets);
      setTotal(response.total);
      setPage(pageNum);
    } catch (err: any) {
      // Handle both old and new API error response formats
      const errorMessage =
        err.response?.data?.message || // New format
        err.response?.data?.error || // Alternative error field
        err.message || // Network/client error
        "Failed to load datasets"; // Default fallback
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  const handleRefresh = () => {
    loadDatasets(page);
  };

  if (loading && datasets.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading datasets...</span>
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
          onClick={handleRefresh}
          className="ml-4"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {total > 0
            ? `Showing ${datasets.length} of ${total} datasets`
            : "No datasets found"}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {datasets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No datasets found
            </h3>
            <p className="text-gray-600">
              You don't have any datasets yet. Create or upload some datasets to
              get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Schema</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasets.map((dataset) => (
                <TableRow key={dataset.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">
                        {dataset.name}
                      </div>
                      {dataset.description && (
                        <div className="text-sm text-gray-600 truncate max-w-xs">
                          {dataset.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Database className="h-4 w-4 mr-1 text-gray-400" />
                      {dataset.data_schema?.length || 0} columns
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {dataset.description || "No description"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(dataset.created_at), "MMM dd, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDatasetSelect(dataset.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewData(dataset.id)}
                      >
                        <Database className="h-4 w-4 mr-1" />
                        Data
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={page === 1 || loading}
            onClick={() => loadDatasets(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <Button
            variant="outline"
            disabled={page >= Math.ceil(total / limit) || loading}
            onClick={() => loadDatasets(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default DatasetList;
