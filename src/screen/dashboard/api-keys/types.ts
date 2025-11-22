/**
 * API Key Types
 */

export interface APIKey {
    id: string;
    name: string;
    key_prefix: string;
    is_active: boolean;
    last_used_at: string | null;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface APIKeyCreate {
    name: string;
    expires_in_days?: number;
}

export interface APIKeyCreateResponse extends APIKey {
    api_key: string; // Only shown once!
}

export interface APIKeyUpdate {
    name?: string;
    is_active?: boolean;
}

export interface APIKeyListResponse {
    api_keys: APIKey[];
    total: number;
    skip: number;
    limit: number;
}
