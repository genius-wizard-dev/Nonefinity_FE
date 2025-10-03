import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  FileVideo,
} from "lucide-react";

interface FileIconProps {
  fileName: string;
  fileExt?: string;
  className?: string;
}

export function FileIcon({
  fileName,
  fileExt,
  className = "h-5 w-5",
}: FileIconProps) {
  const extension = fileExt
    ? fileExt.replace(/^\./, "").toLowerCase()
    : fileName.split(".").pop()?.toLowerCase();

  const getIcon = () => {
    // Use extension directly for simple mapping
    switch (extension) {
      case "pdf":
        return <FileText className={`${className} text-red-500`} />;
      case "doc":
      case "docx":
      case "txt":
        return <FileText className={`${className} text-blue-500`} />;
      case "xls":
      case "xlsx":
      case "csv":
        return <FileSpreadsheet className={`${className} text-green-500`} />;
      case "ppt":
      case "pptx":
        return <FileType className={`${className} text-orange-500`} />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
      case "webp":
        return <FileImage className={`${className} text-purple-500`} />;
      case "mp4":
      case "mov":
      case "avi":
      case "mkv":
        return <FileVideo className={`${className} text-pink-500`} />;
      case "mp3":
      case "wav":
      case "flac":
      case "m4a":
        return <FileAudio className={`${className} text-cyan-500`} />;
      case "zip":
      case "rar":
      case "7z":
      case "tar":
      case "gz":
        return <FileArchive className={`${className} text-yellow-500`} />;
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "html":
      case "css":
      case "json":
      case "xml":
        return <FileCode className={`${className} text-emerald-500`} />;
      default:
        return <File className={`${className} text-muted-foreground`} />;
    }
  };

  return getIcon();
}
