import React from "react";
import { useSearchParams } from "react-router-dom";
import DatasetManagementPage from "./DatasetManagementPage";

const DatasetManagementWrapper: React.FC = () => {
    const [searchParams] = useSearchParams();
    const preselectedFileId = searchParams.get("fileId") || undefined;
    const initialTab = searchParams.get("tab") || "list";

    return (
        <DatasetManagementPage
            preselectedFileId={preselectedFileId}
            initialTab={initialTab}
        />
    );
};

export default DatasetManagementWrapper;
