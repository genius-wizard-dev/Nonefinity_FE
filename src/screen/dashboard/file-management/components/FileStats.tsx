import {
  DatabaseOutlined,
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
  Card,
  Col,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import React from "react";
import type { FileItem, FileStats as FileStatsType } from "../types";
import { formatBytes, getFileExtensionFromFile } from "../utils";

const { Title, Text } = Typography;

interface FileStatsProps {
  stats: FileStatsType | null;
  files: FileItem[];
  loading?: boolean;
}

const FileStats: React.FC<FileStatsProps> = ({
  stats,
  files,
  loading = false,
}) => {
  if (!stats && files.length === 0) {
    return null;
  }

  const totalFiles = stats?.total_files || files.length;
  const totalSize =
    stats?.total_size_mb ||
    files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024);

  // Always calculate file types from actual files, ignore stats.file_types
  const fileTypes = files.reduce((acc, file) => {
    // Get file extension using utility function
    const extension = getFileExtensionFromFile(file);
    acc[extension] = (acc[extension] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topFileTypes = Object.entries(fileTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div style={{ marginBottom: 24 }}>
      <Title level={4} style={{ marginBottom: 16 }}>
        Storage Overview
      </Title>

      <Row gutter={[16, 16]}>
        {/* Total Files */}
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Files"
              value={totalFiles}
              prefix={<FileOutlined />}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Total Size */}
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Size"
              value={totalSize}
              precision={2}
              suffix="MB"
              prefix={<DatabaseOutlined />}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Storage Usage */}
        {stats?.storageUsage && (
          <Col xs={12} sm={6}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Text strong>Storage Usage</Text>
                <Progress
                  type="circle"
                  percent={stats.storageUsage.percentage}
                  format={(percent) => `${percent}%`}
                  size={80}
                  style={{ marginTop: 8 }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    {formatBytes(stats.storageUsage.used * 1024 * 1024)} /{" "}
                    {formatBytes(stats.storageUsage.available * 1024 * 1024)}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        )}

        {/* Recent Activity */}
        {stats?.recentActivity && (
          <Col xs={12} sm={6}>
            <Card>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong>Recent Activity</Text>
                <div>
                  <Text type="secondary">Today: </Text>
                  <Tag color="green">
                    {stats.recentActivity.uploadsToday} uploads
                  </Tag>
                  <Tag color="red">
                    {stats.recentActivity.deletesToday} deletes
                  </Tag>
                </div>
                <div>
                  <Text type="secondary">This week: </Text>
                  <Tag color="blue">
                    {stats.recentActivity.uploadsThisWeek} uploads
                  </Tag>
                  <Tag color="orange">
                    {stats.recentActivity.deletesThisWeek} deletes
                  </Tag>
                </div>
              </Space>
            </Card>
          </Col>
        )}
      </Row>

      {/* File Types Breakdown */}
      {topFileTypes.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            File Types
          </Title>
          <Row gutter={[16, 8]}>
            {topFileTypes.map(([type, count]) => (
              <Col xs={12} sm={8} md={6} key={type}>
                <div style={{ textAlign: "center", padding: "8px" }}>
                  <div style={{ fontSize: "24px", marginBottom: "4px" }}>
                    {getFileTypeIcon(type)}
                  </div>
                  <Text strong>{type.toUpperCase()}</Text>
                  <div>
                    <Text type="secondary">{count} files</Text>
                  </div>
                  <Progress
                    percent={Math.round((count / totalFiles) * 100)}
                    size="small"
                    showInfo={false}
                    style={{ marginTop: "4px" }}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Additional Stats */}
      {(stats?.averageFileSize || stats?.oldestFile || stats?.newestFile) && (
        <Card style={{ marginTop: 16 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            Additional Information
          </Title>
          <Row gutter={[16, 8]}>
            {stats.averageFileSize && (
              <Col xs={12} sm={6}>
                <div>
                  <Text strong>Average File Size</Text>
                  <div>
                    <Text type="secondary">
                      {formatBytes(stats.averageFileSize)}
                    </Text>
                  </div>
                </div>
              </Col>
            )}
            {stats.oldestFile && (
              <Col xs={12} sm={6}>
                <div>
                  <Text strong>Oldest File</Text>
                  <div>
                    <Text
                      type="secondary"
                      ellipsis={{ tooltip: stats.oldestFile.name }}
                    >
                      {stats.oldestFile.name}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {new Date(
                        stats.oldestFile.createdAt
                      ).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              </Col>
            )}
            {stats.newestFile && (
              <Col xs={12} sm={6}>
                <div>
                  <Text strong>Newest File</Text>
                  <div>
                    <Text
                      type="secondary"
                      ellipsis={{ tooltip: stats.newestFile.name }}
                    >
                      {stats.newestFile.name}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {new Date(
                        stats.newestFile.createdAt
                      ).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </Card>
      )}
    </div>
  );
};

const getFileTypeIcon = (type: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    pdf: <FilePdfOutlined style={{ color: "#ff4d4f", fontSize: "24px" }} />,
    doc: <FileWordOutlined style={{ color: "#1890ff", fontSize: "24px" }} />,
    docx: <FileWordOutlined style={{ color: "#1890ff", fontSize: "24px" }} />,
    xls: <FileExcelOutlined style={{ color: "#52c41a", fontSize: "24px" }} />,
    xlsx: <FileExcelOutlined style={{ color: "#52c41a", fontSize: "24px" }} />,
    ppt: <FilePptOutlined style={{ color: "#fa8c16", fontSize: "24px" }} />,
    pptx: <FilePptOutlined style={{ color: "#fa8c16", fontSize: "24px" }} />,
    jpg: <FileImageOutlined style={{ color: "#52c41a", fontSize: "24px" }} />,
    jpeg: <FileImageOutlined style={{ color: "#52c41a", fontSize: "24px" }} />,
    png: <FileImageOutlined style={{ color: "#52c41a", fontSize: "24px" }} />,
    gif: <FileImageOutlined style={{ color: "#52c41a", fontSize: "24px" }} />,
    bmp: <FileImageOutlined style={{ color: "#52c41a", fontSize: "24px" }} />,
    webp: <FileImageOutlined style={{ color: "#52c41a", fontSize: "24px" }} />,
    zip: <FileZipOutlined style={{ color: "#722ed1", fontSize: "24px" }} />,
    rar: <FileZipOutlined style={{ color: "#722ed1", fontSize: "24px" }} />,
    "7z": <FileZipOutlined style={{ color: "#722ed1", fontSize: "24px" }} />,
    txt: <FileTextOutlined style={{ color: "#8c8c8c", fontSize: "24px" }} />,
    md: <FileTextOutlined style={{ color: "#8c8c8c", fontSize: "24px" }} />,
    csv: <FileExcelOutlined style={{ color: "#52c41a", fontSize: "24px" }} />,
  };

  return (
    iconMap[type.toLowerCase()] || (
      <FileOutlined style={{ color: "#8c8c8c", fontSize: "24px" }} />
    )
  );
};

export default FileStats;
