import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FileZipOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  Modal,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React, { useState } from "react";
import { toast } from "sonner";
import type { FileItem } from "../types";
import { getFileExtensionFromFile } from "../utils";

// Utility functions
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const { Text } = Typography;

interface FileGridProps {
  files: FileItem[];
  selectedFiles: Set<string>;
  onSelectionChange: (selectedFiles: Set<string>) => void;
  onFileSelect: (file: FileItem) => void;
  onFileDelete: (fileId: string) => Promise<void> | void;
  onFileRename: (fileId: string, newName: string) => void;
  onFileDownload: (file: FileItem) => void;
}

const FileGrid: React.FC<FileGridProps> = ({
  files,
  selectedFiles,
  onSelectionChange,
  onFileSelect,
  onFileDelete,
  onFileRename,
  onFileDownload,
}) => {
  console.log("🔍 FileGrid: Props received:", {
    filesCount: files.length,
    onFileDelete: typeof onFileDelete,
    onFileRename: typeof onFileRename,
    onFileDownload: typeof onFileDownload,
  });
  const [renameModal, setRenameModal] = useState<{
    visible: boolean;
    file: FileItem | null;
    newName: string;
  }>({
    visible: false,
    file: null,
    newName: "",
  });

  const getFileIcon = (file: FileItem) => {
    const extension = getFileExtensionFromFile(file);

    switch (extension) {
      case "pdf":
        return (
          <FilePdfOutlined style={{ color: "#ff4d4f", fontSize: "24px" }} />
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "webp":
        return (
          <FileImageOutlined style={{ color: "#52c41a", fontSize: "24px" }} />
        );
      case "doc":
      case "docx":
        return (
          <FileWordOutlined style={{ color: "#1890ff", fontSize: "24px" }} />
        );
      case "xls":
      case "xlsx":
        return (
          <FileExcelOutlined style={{ color: "#52c41a", fontSize: "24px" }} />
        );
      case "ppt":
      case "pptx":
        return (
          <FilePptOutlined style={{ color: "#fa8c16", fontSize: "24px" }} />
        );
      case "zip":
      case "rar":
      case "7z":
        return (
          <FileZipOutlined style={{ color: "#722ed1", fontSize: "24px" }} />
        );
      case "txt":
      case "md":
        return (
          <FileTextOutlined style={{ color: "#8c8c8c", fontSize: "24px" }} />
        );
      case "csv":
        return (
          <FileExcelOutlined style={{ color: "#52c41a", fontSize: "24px" }} />
        );
      default:
        return <FileOutlined style={{ color: "#8c8c8c", fontSize: "24px" }} />;
    }
  };

  const handleSelectFile = (file: FileItem, checked: boolean) => {
    const newSelectedFiles = new Set(selectedFiles);
    if (checked) {
      newSelectedFiles.add(file.id);
    } else {
      newSelectedFiles.delete(file.id);
    }
    onSelectionChange(newSelectedFiles);
  };

  const handleRename = () => {
    if (renameModal.file && renameModal.newName.trim()) {
      onFileRename(renameModal.file.id, renameModal.newName.trim());
      setRenameModal({ visible: false, file: null, newName: "" });
      toast.success("File renamed successfully");
    }
  };

  const handleDelete = (file: FileItem, event?: React.MouseEvent) => {
    event?.stopPropagation();
    console.log(
      "🗑️ FileGrid: Delete button clicked for file:",
      file.id,
      file.name
    );

    // First try direct delete like download
    console.log("🗑️ FileGrid: Calling onFileDelete directly");
    onFileDelete(file.id);
  };

  const handleDownload = (file: FileItem, event?: React.MouseEvent) => {
    event?.stopPropagation();
    onFileDownload(file);
  };

  const handleRenameClick = (file: FileItem, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setRenameModal({ visible: true, file, newName: file.name });
  };

  return (
    <>
      <Row gutter={[16, 16]}>
        {files.map((file) => (
          <Col key={file.id} xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              style={{ height: "100%" }}
              onClick={() => {
                console.log("🔍 FileGrid: Card clicked for file:", file.id);
                onFileSelect(file);
              }}
              cover={
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    background: "#f5f5f5",
                    position: "relative",
                    minHeight: "120px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedFiles.has(file.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectFile(file, e.target.checked);
                    }}
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      zIndex: 1,
                    }}
                  />
                  <div style={{ fontSize: "48px" }}>{getFileIcon(file)}</div>
                </div>
              }
              actions={[
                <Tooltip title="Download" key="download">
                  <Button
                    type="text"
                    icon={<DownloadOutlined />}
                    size="small"
                    onClick={(e) => handleDownload(file, e)}
                  />
                </Tooltip>,
                <Tooltip title="Rename" key="rename">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={(e) => handleRenameClick(file, e)}
                  />
                </Tooltip>,
                <Tooltip title="Delete" key="delete">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={(e) => {
                      console.log(
                        "🔴 Delete button clicked for file:",
                        file.id
                      );
                      handleDelete(file, e);
                    }}
                  />
                </Tooltip>,
              ]}
            >
              <Card.Meta
                title={
                  <Tooltip title={file.name}>
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "14px",
                      }}
                    >
                      {file.name}
                    </div>
                  </Tooltip>
                }
                description={
                  <Space
                    direction="vertical"
                    size={4}
                    style={{ width: "100%" }}
                  >
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {formatBytes(file.size)}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {formatDate(file.updatedAt)}
                    </Text>
                    {(() => {
                      const extension = getFileExtensionFromFile(file);
                      return (
                        extension !== "unknown" && (
                          <Tag color="blue" style={{ fontSize: "10px" }}>
                            {extension.toUpperCase()}
                          </Tag>
                        )
                      );
                    })()}
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Rename Modal */}
      <Modal
        title="Rename File"
        open={renameModal.visible}
        onOk={handleRename}
        onCancel={() =>
          setRenameModal({ visible: false, file: null, newName: "" })
        }
        okText="Rename"
        cancelText="Cancel"
      >
        <Input
          value={renameModal.newName}
          onChange={(e) =>
            setRenameModal((prev) => ({ ...prev, newName: e.target.value }))
          }
          placeholder="Enter new file name"
          onPressEnter={handleRename}
        />
      </Modal>
    </>
  );
};

export default FileGrid;
