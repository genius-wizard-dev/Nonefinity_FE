import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileUp, List, Settings } from "lucide-react";
import React, { useState } from "react";
import DatasetConverter from "./DatasetConverter";
import DatasetDataViewer from "./DatasetDataViewer";
import DatasetDetails from "./DatasetDetails";
import DatasetList from "./DatasetList";

export interface DatasetManagementPageProps {
  className?: string;
  preselectedFileId?: string;
  initialTab?: string;
}

const DatasetManage: React.FC<DatasetManagementPageProps> = ({
  className,
  preselectedFileId,
  initialTab = "list",
}) => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleDatasetSelect = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    setActiveTab("details");
  };

  const handleViewData = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    setActiveTab("data");
  };

  return (
    <div className={`container mx-auto p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dataset Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage, convert, and analyze your datasets
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Database className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <List className="h-4 w-4" />
            <span>Datasets</span>
          </TabsTrigger>
          <TabsTrigger value="convert" className="flex items-center space-x-2">
            <FileUp className="h-4 w-4" />
            <span>Convert</span>
          </TabsTrigger>
          <TabsTrigger
            value="details"
            disabled={!selectedDatasetId}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Details</span>
          </TabsTrigger>
          <TabsTrigger
            value="data"
            disabled={!selectedDatasetId}
            className="flex items-center space-x-2"
          >
            <Database className="h-4 w-4" />
            <span>Data</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Datasets</CardTitle>
              <CardDescription>
                Browse and manage all your available datasets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatasetList
                onDatasetSelect={handleDatasetSelect}
                onViewData={handleViewData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="convert" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Conversion</CardTitle>
              <CardDescription>
                Convert datasets between different formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatasetConverter preselectedFileId={preselectedFileId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedDatasetId && (
            <Card>
              <CardHeader>
                <CardTitle>Dataset Details</CardTitle>
                <CardDescription>
                  View and manage dataset information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DatasetDetails
                  datasetId={selectedDatasetId}
                  onDatasetDeleted={() => {
                    setSelectedDatasetId(null);
                    setActiveTab("list");
                  }}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          {selectedDatasetId && (
            <Card>
              <CardHeader>
                <CardTitle>Dataset Data</CardTitle>
                <CardDescription>
                  View and explore dataset contents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DatasetDataViewer datasetId={selectedDatasetId} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatasetManage;
