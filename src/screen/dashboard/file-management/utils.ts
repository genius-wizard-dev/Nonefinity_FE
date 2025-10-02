export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatDate = (dateString: string): string => {
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

export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

import type { FileItem } from "./types";

export const getFileExtensionFromFile = (file: FileItem): string => {
  // First try to get from file.ext (remove dot if present)
  if (file.ext) {
    const ext = file.ext.toLowerCase();
    return ext.startsWith(".") ? ext.slice(1) : ext;
  }

  // Fallback to filename extension
  const filenameExt = file.name.split(".").pop()?.toLowerCase();
  return filenameExt || "unknown";
};

export const getFileTypeFromExtension = (extension: string): string => {
  const typeMap: Record<string, string> = {
    pdf: "PDF Document",
    doc: "Word Document",
    docx: "Word Document",
    xls: "Excel Spreadsheet",
    xlsx: "Excel Spreadsheet",
    ppt: "PowerPoint Presentation",
    pptx: "PowerPoint Presentation",
    jpg: "JPEG Image",
    jpeg: "JPEG Image",
    png: "PNG Image",
    gif: "GIF Image",
    bmp: "Bitmap Image",
    webp: "WebP Image",
    txt: "Text File",
    md: "Markdown File",
    zip: "ZIP Archive",
    rar: "RAR Archive",
    "7z": "7-Zip Archive",
  };

  return typeMap[extension] || "Unknown File Type";
};
