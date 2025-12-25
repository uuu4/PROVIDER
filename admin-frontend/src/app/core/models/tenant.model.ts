export interface Tenant {
    id: string;
    company_name: string;
    domain: string;
    contact_name: string;
    contact_email: string;
    contact_phone?: string;
    address?: string;
    timezone: string;
    is_active: boolean;
    settings?: Record<string, any>;
    licenses_count?: number;
    created_at: string;
    updated_at: string;
}

export interface TenantCreateRequest {
    company_name: string;
    domain: string;
    contact_name: string;
    contact_email: string;
    contact_phone?: string;
    address?: string;
    timezone?: string;
    is_active?: boolean;
}
