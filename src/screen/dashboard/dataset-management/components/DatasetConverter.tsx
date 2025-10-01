import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Database,
  FileText,
  RefreshCw,
  Settings,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { FileService } from "../../file-management/services";
import { type FileItem } from "../../file-management/types";
import { DatasetService } from "../services";
import {
  type ConvertDatasetRequest,
  type ConvertDatasetResponse,
} from "../types";

export interface DatasetConverterProps {
  preselectedFileId?: string;
}

const DatasetConverter: React.FC<DatasetConverterProps> = ({
  preselectedFileId,
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>(
    preselectedFileId || ""
  );
  const [datasetName, setDatasetName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastConversionResult, setLastConversionResult] =
    useState<ConvertDatasetResponse | null>(null);

  const loadFiles = async () => {
    try {
      setLoadingFiles(true);
      const response = await FileService.getFiles(1, 100);
      setFiles(response.files);
    } catch (error: unknown) {
      console.error("Failed to load files:", error);
      setError("Failed to load files");
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (preselectedFileId) {
      setSelectedFileId(preselectedFileId);
      const selectedFile = files.find((f) => f.id === preselectedFileId);
      if (selectedFile && !datasetName) {
        // Auto-generate dataset name from file name
        const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, "");
        setDatasetName(`${nameWithoutExtension}_dataset`);
      }
    }
  }, [preselectedFileId, files, datasetName]);

  const handleConvert = async () => {
    if (!selectedFileId) {
      setError("Please select a file to convert");
      return;
    }

    if (!datasetName.trim()) {
      setError("Please enter a dataset name");
      return;
    }

    // Additional validation
    if (datasetName.trim().length < 3) {
      setError("Dataset name must be at least 3 characters long");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(datasetName.trim())) {
      setError(
        "Dataset name can only contain letters, numbers, underscores, and hyphens"
      );
      return;
    }

    // Validate file ID exists and has the right format
    const selectedFile = files.find((f) => f.id === selectedFileId);
    if (!selectedFile) {
      setError("Selected file not found. Please refresh and try again.");
      return;
    }

    // Check if file ID looks like a valid MongoDB ObjectId (24 hex characters)
    if (!/^[a-fA-F0-9]{24}$/.test(selectedFileId)) {
      console.warn(
        "File ID doesn't match MongoDB ObjectId format:",
        selectedFileId
      );
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setLastConversionResult(null);

      const request: ConvertDatasetRequest = {
        file_id: selectedFileId,
        dataset_name: datasetName.trim(),
        description: description.trim() || "",
      };

      console.log("Converting dataset with request:", request);
      const response = await DatasetService.convertDataset(request);

      // Store the conversion result for detailed display
      setLastConversionResult(response);

      const schemaInfo = response.data_schema
        ? `with ${response.data_schema.length} columns`
        : "";

      setSuccess(
        `Dataset "${response.name}" created successfully! ${schemaInfo}`
      );

      // Reset form
      setSelectedFileId("");
      setDatasetName("");
      setDescription("");

      // Reload files
      await loadFiles();
    } catch (error: unknown) {
      console.error("Dataset conversion failed:", error);

      let errorMessage = "Failed to convert file to dataset";

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as {
          response?: {
            data?: { message?: string; error?: string; detail?: string };
          };
        };
        const errorData = errorResponse.response?.data;
        if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }

        // If it's a validation error, provide more context
        if (errorMessage.toLowerCase().includes("validation")) {
          errorMessage +=
            ". Please check that the file ID is valid and the dataset name follows the naming rules (3+ characters, alphanumeric, underscores, and hyphens only).";
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingFiles) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading files...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Detailed Conversion Result */}
      {lastConversionResult && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Database className="h-5 w-5 mr-2" />
              Dataset Created Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Dataset Name
                </p>
                <p className="text-sm text-gray-900">
                  {lastConversionResult.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Dataset ID</p>
                <p className="text-sm text-gray-900 font-mono">
                  {lastConversionResult.id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Description</p>
                <p className="text-sm text-gray-900">
                  {lastConversionResult.description || "No description"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Created At</p>
                <p className="text-sm text-gray-900">
                  {new Date(lastConversionResult.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {lastConversionResult.data_schema &&
              lastConversionResult.data_schema.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Data Schema ({lastConversionResult.data_schema.length}{" "}
                    columns)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {lastConversionResult.data_schema.map(
                      (
                        col: {
                          column_name: string;
                          column_type: string;
                          desc: string | null;
                        },
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="bg-white border rounded p-2"
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {col.column_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {col.column_type}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Select File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose File to Convert *
              </label>
              <select
                value={selectedFileId}
                onChange={(e) => {
                  setSelectedFileId(e.target.value);
                  if (e.target.value && !datasetName) {
                    const selectedFile = files.find(
                      (f) => f.id === e.target.value
                    );
                    if (selectedFile) {
                      const nameWithoutExtension = selectedFile.name.replace(
                        /\.[^/.]+$/,
                        ""
                      );
                      setDatasetName(`${nameWithoutExtension}_dataset`);
                    }
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a file...</option>
                {files.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.name} ({file.type}) -{" "}
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </option>
                ))}
              </select>
            </div>

            {selectedFileId && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong>{" "}
                  {files.find((f) => f.id === selectedFileId)?.name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dataset Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Dataset Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dataset Name *
              </label>
              <Input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="Enter dataset name..."
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter dataset description..."
                className="w-full"
              />
            </div>

            {/* Conversion Preview */}
            {selectedFileId && datasetName && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center text-green-800">
                  <FileText className="h-5 w-5 mr-2" />
                  <span className="font-medium">
                    {files.find((f) => f.id === selectedFileId)?.name}
                  </span>
                  <ArrowRight className="h-5 w-5 mx-3" />
                  <Database className="h-5 w-5 mr-2" />
                  <span className="font-medium">{datasetName}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Convert Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleConvert}
          disabled={loading || !selectedFileId || !datasetName.trim()}
          size="lg"
          className="min-w-48"
        >
          {loading ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <ArrowRight className="h-5 w-5 mr-2" />
              Create Dataset
            </>
          )}
        </Button>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Select a file from your uploaded files</li>
            <li>Enter a name for your new dataset</li>
            <li>Optionally add a description</li>
            <li>Click "Create Dataset" to convert the file into a dataset</li>
            <li>
              The new dataset will appear in your dataset list once processing
              is complete
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetConverter;
