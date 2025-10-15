// Knowledge Store Types
export interface KnowledgeStore {
  id: string;
  name: string;
  description?: string;
  collection_name: string;
  dimension: number;
  distance: "Cosine" | "Dot" | "Euclid";
  status: "green" | "yellow" | "red";
  created_at: string;
  updated_at?: string;
  points_count: number;
}

export interface KnowledgeStoreCreateRequest {
  name: string;
  description?: string;
  dimension: number;
  distance: "Cosine" | "Dot" | "Euclid";
}

export interface KnowledgeStoreUpdateRequest {
  name?: string;
  description?: string;
}

export interface KnowledgeStoreListResponse {
  knowledge_stores: KnowledgeStore[];
  total: number;
  limit: number;
  skip: number;
}

export interface KnowledgeStoreCheckNameResponse {
  name: string;
  available: boolean;
}

export interface KnowledgeStoreInfoResponse {
  status: string;
  vectors_count: number;
  indexed_vectors_count: number;
  points_count: number;
  segments_count: number;
  config: {
    params: {
      vectors: {
        size: number;
        distance: string;
      };
    };
  };
}

// Dimension options
export const DIMENSION_OPTIONS = [
  { value: 384, label: "384" },
  { value: 768, label: "768" },
  { value: 1024, label: "1024" },
  { value: 1536, label: "1536" },
  { value: 3072, label: "3072" },
] as const;

// Distance options
export const DISTANCE_OPTIONS = [
  { value: "Cosine", label: "Cosine" },
  { value: "Dot", label: "Dot" },
  { value: "Euclid", label: "Euclid" },
] as const;

// Status options
export const STATUS_OPTIONS = [
  { value: "green", label: "Green", color: "text-green-500" },
  { value: "yellow", label: "Yellow", color: "text-yellow-500" },
  { value: "red", label: "Red", color: "text-red-500" },
] as const;

// Filter options
export interface KnowledgeStoreFilters {
  status?: string;
  search?: string;
}

// Pagination options
export interface KnowledgeStorePagination {
  skip: number;
  limit: number;
}

// Scroll Data Types
export interface ScrollDataPoint {
  id: string;
  vector: number[];
  text: string;
  score?: number;
}

export interface ScrollDataResponse {
  points: ScrollDataPoint[];
  scroll_id: string | null;
  has_more: boolean;
  total_scrolled: number;
}

export interface ScrollDataRequest {
  limit?: number;
  scroll_id?: string | null;
}
