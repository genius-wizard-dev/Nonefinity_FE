import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
  Download,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  RotateCcw,
  Search,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { DatasetService } from "../services";
import { type DatasetData } from "../types";

export interface DatasetDataViewerProps {
  datasetId: string;
}

const DatasetDataViewer: React.FC<DatasetDataViewerProps> = ({ datasetId }) => {
  const [data, setData] = useState<DatasetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showColumnControls, setShowColumnControls] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);

  const loadData = useCallback(
    async (skip = 0, pageLimit = 50) => {
      try {
        setLoading(true);
        setError(null);
        const result = await DatasetService.getDatasetData(
          datasetId,
          skip,
          pageLimit
        );
        setData(result);
        setOffset(skip);
        setLimit(pageLimit);
      } catch (err: unknown) {
        const errorMessage =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message || "Failed to load dataset data"
            : "Failed to load dataset data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [datasetId]
  );

  useEffect(() => {
    if (datasetId) {
      loadData();
    }
  }, [datasetId, loadData]);

  const handleRefresh = () => {
    loadData(offset, limit);
  };

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * limit;
    loadData(newOffset, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    loadData(0, newLimit);
  };

  // Helper functions for new features
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const resetSort = () => {
    setSortColumn(null);
    setSortDirection("asc");
  };

  const toggleColumnVisibility = (column: string) => {
    const newHiddenColumns = new Set(hiddenColumns);
    if (newHiddenColumns.has(column)) {
      newHiddenColumns.delete(column);
    } else {
      newHiddenColumns.add(column);
    }
    setHiddenColumns(newHiddenColumns);
  };

  const toggleRowSelection = (rowIndex: number) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(rowIndex)) {
      newSelectedRows.delete(rowIndex);
    } else {
      newSelectedRows.add(rowIndex);
    }
    setSelectedRows(newSelectedRows);
  };

  const selectAllRows = () => {
    if (selectedRows.size === filteredRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredRows.map((_, index) => index)));
    }
  };

  const exportData = () => {
    if (!data?.data) return;

    const csvContent = [
      visibleColumns.join(","),
      ...filteredRows.map((row) =>
        visibleColumns.map((col) => `"${String(row[col] ?? "")}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dataset-${datasetId}-data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get columns from the first row of data
  const columns =
    data?.data && data.data.length > 0 ? Object.keys(data.data[0]) : [];

  // Filter visible columns
  const visibleColumns = columns.filter((col) => !hiddenColumns.has(col));

  // Calculate pagination info
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = data ? Math.ceil(data.total_rows / limit) : 1;

  let filteredRows =
    data?.data?.filter((row) => {
      if (!searchTerm) return true;
      return Object.values(row).some(
        (cell) =>
          cell &&
          cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }) || [];

  // Apply sorting
  if (sortColumn && filteredRows.length > 0) {
    filteredRows = [...filteredRows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDirection === "asc" ? 1 : -1;
      if (bVal == null) return sortDirection === "asc" ? -1 : 1;

      // Convert to strings for comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Calculate statistics
  const getColumnStats = (column: string) => {
    const values = filteredRows
      .map((row) => row[column])
      .filter((val) => val != null);
    const uniqueValues = new Set(values);
    const numericValues = values
      .filter((val) => !isNaN(Number(val)))
      .map(Number);

    return {
      total: values.length,
      unique: uniqueValues.size,
      nullCount: filteredRows.length - values.length,
      numeric:
        numericValues.length > 0
          ? {
              min: Math.min(...numericValues),
              max: Math.max(...numericValues),
              avg:
                numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
            }
          : null,
    };
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading dataset data...</span>
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

  if (!data || !data.data || !data.data.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No data found
          </h3>
          <p className="text-gray-600">
            This dataset appears to be empty or the data is not available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <select
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
            <option value={200}>200 rows</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {filteredRows.length} of {data.total_rows} rows
          </span>
          {sortColumn && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetSort}
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset Sort
            </Button>
          )}
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
      </div>

      {/* Enhanced Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column Controls */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Column Visibility
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowColumnControls(!showColumnControls)}
              >
                {showColumnControls ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {showColumnControls && (
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {columns.map((column, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`column-${index}`}
                      checked={!hiddenColumns.has(column)}
                      onChange={() => toggleColumnVisibility(column)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`column-${index}`}
                      className="text-sm text-gray-700 truncate flex-1"
                      title={column}
                    >
                      {column}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Row Selection & Export */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Row Selection & Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={
                    selectedRows.size === filteredRows.length &&
                    filteredRows.length > 0
                  }
                  onChange={selectAllRows}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="select-all" className="text-sm text-gray-700">
                  Select All ({selectedRows.size} selected)
                </label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
                disabled={selectedRows.size === 0}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Selected ({selectedRows.size})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Column Statistics
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStatistics(!showStatistics)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          {showStatistics && (
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {columns
                  .filter((col) => !hiddenColumns.has(col))
                  .map((column, index) => {
                    const stats = getColumnStats(column);
                    if (!stats) return null;

                    return (
                      <div
                        key={index}
                        className="border-b border-gray-100 pb-2 last:border-b-0"
                      >
                        <div
                          className="font-medium text-xs text-gray-800 truncate"
                          title={column}
                        >
                          {column}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          <div>Unique: {stats.unique}</div>
                          <div>Null: {stats.nullCount}</div>
                          {stats.numeric && (
                            <>
                              <div>Min: {stats.numeric.min}</div>
                              <div>Max: {stats.numeric.max}</div>
                              <div>Avg: {stats.numeric.avg.toFixed(2)}</div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === filteredRows.length &&
                      filteredRows.length > 0
                    }
                    onChange={selectAllRows}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead className="w-12">#</TableHead>
                {columns
                  .filter((col) => !hiddenColumns.has(col))
                  .map((column, index) => (
                    <TableHead key={index} className="min-w-32">
                      <button
                        onClick={() => handleSort(column)}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        <span className="truncate" title={column}>
                          {column}
                        </span>
                        <ArrowUpDown className="h-3 w-3 opacity-50" />
                        {sortColumn === column &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-blue-600" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-blue-600" />
                          ))}
                      </button>
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={selectedRows.has(rowIndex) ? "bg-blue-50" : ""}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={() => toggleRowSelection(rowIndex)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-gray-500">
                    {offset + rowIndex + 1}
                  </TableCell>
                  {columns
                    .filter((col) => !hiddenColumns.has(col))
                    .map((column, cellIndex) => (
                      <TableCell key={cellIndex} className="max-w-48">
                        <div
                          className="truncate"
                          title={row[column]?.toString()}
                        >
                          {row[column] !== null && row[column] !== undefined
                            ? row[column].toString()
                            : "-"}
                        </div>
                      </TableCell>
                    ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1 || loading || totalPages <= 1}
            onClick={() => handlePageChange(1)}
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            disabled={currentPage === 1 || loading || totalPages <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="text-xs text-gray-500">
              ({((currentPage - 1) * limit + 1).toLocaleString()}-
              {Math.min(currentPage * limit, data.total_rows).toLocaleString()}{" "}
              of {data.total_rows.toLocaleString()})
            </div>
          </div>
          {totalPages > 5 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Go to:</span>
              <Input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                  }
                }}
                className="w-16 h-8 text-center text-sm"
                disabled={loading}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage >= totalPages || loading || totalPages <= 1}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages || loading || totalPages <= 1}
            onClick={() => handlePageChange(totalPages)}
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dataset Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data.total_rows.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Columns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{columns.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{currentPage}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatasetDataViewer;
