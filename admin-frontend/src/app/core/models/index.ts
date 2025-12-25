export * from './admin.model';
export * from './tenant.model';
export * from './license.model';
export * from './validation.model';
export * from './version.model';

export interface DashboardStats {
    total_tenants: number;
    active_tenants: number;
    total_licenses: number;
    active_licenses: number;
    expiring_soon: number;
    validations_today: number;
    failed_validations_today: number;
}

export interface DashboardResponse {
    stats: DashboardStats;
    recent_validations: Array<{
        id: string;
        license_key?: string;
        tenant?: string;
        status: string;
        ip_address: string;
        validated_at: string;
    }>;
    expiring_licenses: Array<{
        id: string;
        license_key: string;
        tenant: string;
        plan: string;
        expires_at: string;
        days_remaining: number;
    }>;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
