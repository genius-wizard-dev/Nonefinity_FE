export interface FileItem {
  id: string
  name: string
  type: "image" | "pdf" | "document" | "spreadsheet" | "presentation" | "figma" | string
  size: number
  modified: Date
  thumbnail: string
}

export type ViewMode = "grid" | "list"
