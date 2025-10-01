import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen, Upload } from "lucide-react";
import React from "react";
import { FileList, FileUpload, type FileItem } from "./index";

interface FileManagementTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  allowUpload?: boolean;
  onFileSelect: (file: FileItem) => void;
  onUploadComplete: (file: unknown) => void;
  onUploadError: (error: string) => void;
  onAfterDelete: () => void;
  refreshTrigger: number;
}

export const FileManagementTabs: React.FC<FileManagementTabsProps> = ({
  activeTab,
  onTabChange,
  allowUpload = true,
  onFileSelect,
  onUploadComplete,
  onUploadError,
  onAfterDelete,
  refreshTrigger,
}) => {
  type TabDef = {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    component: React.ReactNode;
  };

  const tabs: TabDef[] = [
    {
      id: "files",
      label: "Files",
      icon: FolderOpen,
      component: (
        <div className="space-y-6">
          <FileList
            key={refreshTrigger}
            onFileSelect={onFileSelect}
            onAfterDelete={onAfterDelete}
            selectable={true}
            multiSelect={true}
            showActions={true}
            pageSize={20}
          />
        </div>
      ),
    },
  ];

  // Conditionally add Upload tab
  if (allowUpload) {
    tabs.push({
      id: "upload",
      label: "Upload",
      icon: Upload,
      component: (
        <Card id="upload-tab">
          <CardContent className="p-4">
            <FileUpload
              onUploadComplete={onUploadComplete}
              onUploadError={onUploadError}
              multiple={true}
              maxFileSize={100}
            />
          </CardContent>
        </Card>
      ),
    });
  }

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center justify-center gap-2 w-full"
            >
              <IconComponent className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="space-y-6">
          {tab.component}
        </TabsContent>
      ))}
    </Tabs>
  );
};
