export interface AppVersion {
    id: string;
    version: string;
    git_tag?: string;
    release_notes?: string;
    changelog?: string;
    download_url?: string;
    checksum?: string;
    is_stable: boolean;
    is_critical: boolean;
    min_php_version?: string;
    released_at?: string;
    released_by?: string;
    created_at: string;
    updated_at: string;
}

export interface VersionCreateRequest {
    version: string;
    git_tag?: string;
    release_notes?: string;
    changelog?: string;
    download_url?: string;
    is_stable?: boolean;
    is_critical?: boolean;
    min_php_version?: string;
    publish_now?: boolean;
}
