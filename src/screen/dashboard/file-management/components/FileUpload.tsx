import { getClerkToken } from "@/consts/endpoint";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  List,
  Modal,
  Progress,
  Space,
  Typography,
  Upload,
} from "antd";
import React, { useState } from "react";
import { toast } from "sonner";
import { useFileStore } from "../store";
import type { UploadFile } from "../types";
// Utility function
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const { Dragger } = Upload;
const { Text } = Typography;

interface FileUploadProps {
  onUploadComplete?: (files: UploadFile[]) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  multiple?: boolean;
  visible: boolean;
  onClose: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  acceptedTypes = [],
  maxFileSize = 100, // 100MB default
  multiple = true,
  visible,
  onClose,
}) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      toast.error(
        `File "${file.name}" is too large. Maximum size is ${maxFileSize}MB.`
      );
      return false;
    }

    // Check file type
    if (acceptedTypes.length > 0) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const mimeType = file.type;
      const isAccepted = acceptedTypes.some(
        (type) => type.includes(fileExtension || "") || type.includes(mimeType)
      );

      if (!isAccepted) {
        toast.error(`File type "${file.type}" is not allowed.`);
        return false;
      }
    }

    const uploadFile: UploadFile = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "pending",
    };

    setUploadFiles((prev) => [...prev, uploadFile]);
    return false; // Prevent default upload
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const { uploadFile } = useFileStore();

  const realUpload = async (uploadFileItem: UploadFile, token: string) => {
    try {
      // Update status to uploading
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFileItem.id
            ? { ...f, status: "uploading", progress: 0 }
            : f
        )
      );

      // Call real upload API
      const result = await uploadFile(uploadFileItem.file, token);

      if (result) {
        // Update status to completed
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFileItem.id
              ? { ...f, status: "completed", progress: 100 }
              : f
          )
        );
        return true;
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      // Update status to error
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFileItem.id
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );
      return false;
    }
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      toast.warning("Please select files to upload");
      return;
    }

    setUploading(true);

    try {
      // Get auth token
      const token = await getClerkToken();
      if (!token) {
        toast.error("Authentication required");
        onUploadError?.("Authentication required");
        return;
      }

      // Upload each file
      const uploadPromises = uploadFiles.map((file) => realUpload(file, token));
      const results = await Promise.all(uploadPromises);

      const successCount = results.filter(Boolean).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} file(s) uploaded successfully`);
        onUploadComplete?.(uploadFiles);
      }

      if (failCount > 0) {
        toast.error(`${failCount} file(s) failed to upload`);
        onUploadError?.(`${failCount} file(s) failed to upload`);
      }

      // Reset state
      setUploadFiles([]);
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed");
      onUploadError?.("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setUploadFiles([]);
    onClose();
  };

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "error":
        return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <FileOutlined />;
    }
  };

  const getStatusColor = (status: UploadFile["status"]) => {
    switch (status) {
      case "completed":
        return "#52c41a";
      case "error":
        return "#ff4d4f";
      case "uploading":
        return "#1890ff";
      default:
        return "#8c8c8c";
    }
  };

  return (
    <Modal
      title="Upload Files"
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="upload"
          type="primary"
          loading={uploading}
          onClick={handleUpload}
          disabled={uploadFiles.length === 0}
        >
          Upload {uploadFiles.length} file{uploadFiles.length !== 1 ? "s" : ""}
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        {/* Drag & Drop Area */}
        <Dragger
          multiple={multiple}
          beforeUpload={handleFileSelect}
          showUploadList={false}
          accept={acceptedTypes.join(",")}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
          </p>
          <p className="ant-upload-text">
            Click or drag files to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support single or bulk upload. Maximum file size: {maxFileSize}MB
            {acceptedTypes.length > 0 && (
              <span>. Accepted types: {acceptedTypes.join(", ")}</span>
            )}
          </p>
        </Dragger>

        {/* File List */}
        {uploadFiles.length > 0 && (
          <Card title="Selected Files" size="small">
            <List
              dataSource={uploadFiles}
              renderItem={(uploadFile) => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveFile(uploadFile.id)}
                      disabled={uploadFile.status === "uploading"}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={getStatusIcon(uploadFile.status)}
                    title={
                      <Space>
                        <Text>{uploadFile.file.name}</Text>
                        <Text type="secondary">
                          ({formatBytes(uploadFile.file.size)})
                        </Text>
                      </Space>
                    }
                    description={
                      uploadFile.status === "uploading" ? (
                        <Progress
                          percent={uploadFile.progress}
                          size="small"
                          status="active"
                        />
                      ) : (
                        <Text
                          style={{ color: getStatusColor(uploadFile.status) }}
                        >
                          {uploadFile.status.charAt(0).toUpperCase() +
                            uploadFile.status.slice(1)}
                        </Text>
                      )
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        )}
      </Space>
    </Modal>
  );
};

export default FileUpload;
