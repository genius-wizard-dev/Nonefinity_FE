import {
  CsvIcon,
  DocsIcon,
  ExcelIcon,
  PdfIcon,
  TxtIcon,
} from "@/components/icons";
import React from "react";
import type { FileItem } from "../types";

interface FileIconProps {
  file: FileItem;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({
  file,
  size = "md",
  className = "",
}) => {
  const getFileIcon = () => {
    const fileType = file.type?.toLowerCase() || file.ext?.toLowerCase() || "";

    // Check by file extension first
    if (file.ext) {
      switch (file.ext.toLowerCase()) {
        case "pdf":
          return <PdfIcon className={className} />;
        case "csv":
          return <CsvIcon className={className} />;
        case "xlsx":
        case "xls":
          return <ExcelIcon className={className} />;
        case "txt":
          return <TxtIcon className={className} />;
        case "doc":
        case "docx":
          return <DocsIcon className={className} />;
      }
    }

    // Check by MIME type
    switch (fileType) {
      case "application/pdf":
        return <PdfIcon className={className} />;
      case "text/csv":
        return <CsvIcon className={className} />;
      case "application/vnd.ms-excel":
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return <ExcelIcon className={className} />;
      case "text/plain":
        return <TxtIcon className={className} />;
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return <DocsIcon className={className} />;
      default:
        // Default file icon for unknown types
        return (
          <div
            className={`flex items-center justify-center bg-gray-200 rounded-lg border border-gray-400 ${className}`}
          >
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        );
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center`}>
      {getFileIcon()}
    </div>
  );
};
