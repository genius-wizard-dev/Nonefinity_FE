// FileItem interface represents a file object in the app, mapped from the server's snake_case fields
export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  url?: string;
  owner?: string;
  bucket?: string;
  path?: string;
  ext?: string;
  tags?: string[];
}

// mapFileItem maps a raw server file object (snake_case) to FileItem (camelCase)
export const mapFileItem = (item: any): FileItem => {
  return {
    id: item.id,
    name: item.file_name,
    type: item.file_type,
    size: item.file_size,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    url: item.url,
    owner: item.owner_id,
    bucket: item.bucket,
    path: item.file_path,
    ext: item.file_ext,
    tags: item.tags,
  };
};
