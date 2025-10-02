import {
  AppstoreOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useAuth } from "@clerk/clerk-react";
import {
  Button,
  Card,
  Col,
  Input,
  Layout,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FileGrid, FileStats, FileUpload } from "./components";
import { useFileStore } from "./store";
import type { FileItem } from "./types";
import { getFileExtensionFromFile } from "./utils";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const FileManagement: React.FC = () => {
  const { getToken } = useAuth();
  const {
    files,
    isLoading,
    error,
    stats,
    fetchFiles,
    fetchStats,
    deleteFile,
    deleteFiles,
    renameFile,
    downloadFile,
    clearError,
  } = useFileStore();

  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Load files on component mount
  useEffect(() => {
    const loadFiles = async () => {
      const token = await getToken();
      if (token) {
        await fetchFiles(token);
        await fetchStats(token);
      }
    };
    loadFiles();
  }, [getToken, fetchFiles, fetchStats]);

  // Handle file selection
  const handleFileSelect = (file: FileItem) => {
    console.log("Selected file:", file);
    // You can add file preview logic here
  };

  // Handle file deletion
  const handleFileDelete = async (fileId: string): Promise<void> => {
    console.log("🗑️ Main: Starting delete for file:", fileId);
    const token = await getToken();
    if (!token) {
      console.log("❌ Main: No token available");
      toast.error("Authentication required");
      return;
    }

    try {
      console.log("🗑️ Main: Calling deleteFile with token");
      const success = await deleteFile(fileId, token);
      console.log("🗑️ Main: Delete result:", success);

      if (success) {
        // Remove from selected files if it was selected
        setSelectedFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
        console.log("✅ Main: File deleted successfully");
        toast.success("File deleted successfully");
      } else {
        console.log("❌ Main: Delete failed");
        toast.error("Failed to delete file");
      }
    } catch (error) {
      console.error("❌ Main: Delete error:", error);
      toast.error("Failed to delete file");
    }
  };

  // Handle batch deletion
  const handleBatchDelete = useCallback(async () => {
    if (selectedFiles.size === 0) return;

    const token = await getToken();
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    Modal.confirm({
      title: "Delete Multiple Files",
      content: (
        <div>
          <p>
            Are you sure you want to delete {selectedFiles.size} file
            {selectedFiles.size > 1 ? "s" : ""}?
          </p>
          <p style={{ fontSize: "12px", color: "#8c8c8c" }}>
            This action cannot be undone.
          </p>
        </div>
      ),
      okText: "Delete All",
      okType: "danger",
      cancelText: "Cancel",
      width: 400,
      onOk: async () => {
        try {
          const success = await deleteFiles(Array.from(selectedFiles), token);
          if (success) {
            setSelectedFiles(new Set());
            toast.success("Files deleted successfully");
          } else {
            toast.error("Failed to delete files");
          }
        } catch (error) {
          console.error("Batch delete error:", error);
          toast.error("Failed to delete files");
        }
      },
    });
  }, [selectedFiles, getToken, deleteFiles]);

  // Handle file rename
  const handleFileRename = async (fileId: string, newName: string) => {
    const token = await getToken();
    if (!token) return;

    try {
      const success = await renameFile(fileId, newName, token);
      if (success) {
        toast.success("File renamed successfully");
      } else {
        toast.error("Failed to rename file");
      }
    } catch {
      toast.error("Failed to rename file");
    }
  };

  // Handle file download
  const handleFileDownload = async (file: FileItem) => {
    const token = await getToken();
    if (!token) return;

    try {
      const success = await downloadFile(file.id, token);
      if (success) {
        toast.success("File downloaded successfully");
      } else {
        toast.error("Failed to download file");
      }
    } catch {
      toast.error("Failed to download file");
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    const token = await getToken();
    if (token) {
      await fetchFiles(token, true);
      await fetchStats(token);
    }
  };

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Select All: Cmd+A (macOS) or Ctrl+A (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        const allFileIds = new Set(files.map((file) => file.id));
        setSelectedFiles(allFileIds);
        return;
      }

      // Delete selected files
      if (e.key === "Delete" && selectedFiles.size > 0) {
        e.preventDefault();
        handleBatchDelete();
        return;
      }

      // Clear selection
      if (e.key === "Escape") {
        setSelectedFiles(new Set());
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedFiles, handleBatchDelete, files]);

  // Filter files based on search and type
  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      searchQuery === "" ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Get file extension for filtering
    const fileExtension = getFileExtensionFromFile(file);
    const matchesType = filterType === "all" || fileExtension === filterType;

    return matchesSearch && matchesType;
  });

  // Get unique file types for filter based on actual file extensions
  const fileTypes = Array.from(
    new Set(
      files
        .map((file) => getFileExtensionFromFile(file))
        .filter((ext) => ext !== "unknown")
    )
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              File Management
            </Title>
            <Text type="secondary">Manage your files like Google Drive</Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => setShowUpload(true)}
              >
                Upload Files
              </Button>
            </Space>
          </Col>
        </Row>
      </Header>

      <Content style={{ padding: "24px" }}>
        {/* File Statistics */}
        <FileStats stats={stats} files={files} loading={isLoading} />

        {/* Search and Filter Bar */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Search
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Col>
            <Col>
              <Select
                value={filterType}
                onChange={setFilterType}
                style={{ width: 120 }}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">All Types</Option>
                {fileTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type.toUpperCase()}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Space>
                <Tooltip title="Grid View">
                  <Button
                    type={viewMode === "grid" ? "primary" : "default"}
                    icon={<AppstoreOutlined />}
                    onClick={() => setViewMode("grid")}
                  />
                </Tooltip>
                <Tooltip title="List View">
                  <Button
                    type={viewMode === "list" ? "primary" : "default"}
                    icon={<UnorderedListOutlined />}
                    onClick={() => setViewMode("list")}
                  />
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Selection Info */}
        {selectedFiles.size > 0 && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 16px",
              background: "#e6f7ff",
              border: "1px solid #91d5ff",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space>
              <Text strong style={{ color: "#1890ff" }}>
                {selectedFiles.size} file{selectedFiles.size > 1 ? "s" : ""}{" "}
                selected
              </Text>
              <Text type="secondary">
                Press{" "}
                <kbd
                  style={{
                    background: "#f5f5f5",
                    border: "1px solid #d9d9d9",
                    borderRadius: "3px",
                    padding: "2px 6px",
                    fontSize: "12px",
                  }}
                >
                  Delete
                </kbd>{" "}
                to delete,{" "}
                <kbd
                  style={{
                    background: "#f5f5f5",
                    border: "1px solid #d9d9d9",
                    borderRadius: "3px",
                    padding: "2px 6px",
                    fontSize: "12px",
                  }}
                >
                  Esc
                </kbd>{" "}
                to clear, or{" "}
                <kbd
                  style={{
                    background: "#f5f5f5",
                    border: "1px solid #d9d9d9",
                    borderRadius: "3px",
                    padding: "2px 6px",
                    fontSize: "12px",
                  }}
                >
                  {navigator.platform.toLowerCase().includes("mac")
                    ? "Cmd+A"
                    : "Ctrl+A"}
                </kbd>{" "}
                to select all
              </Text>
            </Space>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
            >
              Delete Selected
            </Button>
          </div>
        )}

        {/* File Display */}
        <Card>
          <FileGrid
            files={filteredFiles}
            selectedFiles={selectedFiles}
            onSelectionChange={setSelectedFiles}
            onFileSelect={handleFileSelect}
            onFileDelete={handleFileDelete}
            onFileRename={handleFileRename}
            onFileDownload={handleFileDownload}
          />
        </Card>

        {/* Upload Modal */}
        <FileUpload
          visible={showUpload}
          onClose={() => setShowUpload(false)}
          onUploadComplete={(files) => {
            toast.success(`${files.length} files uploaded successfully`);
            setShowUpload(false);
            // Refresh files list
            const refreshFiles = async () => {
              const token = await getToken();
              if (token) {
                await fetchFiles(token, true);
                await fetchStats(token);
              }
            };
            refreshFiles();
          }}
          onUploadError={(error) => {
            toast.error(error);
          }}
        />
      </Content>
    </Layout>
  );
};

export default FileManagement;
