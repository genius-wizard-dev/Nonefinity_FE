import React from "react";
import { useSearchParams } from "react-router-dom";
import DatasetManage from "./components/DatasetManage";

const DatasetManagementWrapper: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedFileId = searchParams.get("fileId") || undefined;
  const initialTab = searchParams.get("tab") || "list";

  return (
    <DatasetManage
      preselectedFileId={preselectedFileId}
      initialTab={initialTab}
    />
  );
};

export default DatasetManagementWrapper;
