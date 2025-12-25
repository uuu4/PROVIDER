import { Tenant } from './tenant.model';

export type LicensePlan = 'basic' | 'pro' | 'enterprise';
export type LicenseStatus = 'active' | 'suspended' | 'expired' | 'revoked';

export interface License {
    id: string;
    tenant_id: string;
    license_key: string;
    plan: LicensePlan;
    status: LicenseStatus;
    max_users: number;
    max_products?: number;
    starts_at: string;
    expires_at: string;
    notes?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
    tenant?: Tenant;
}

export interface LicenseCreateRequest {
    tenant_id: string;
    plan: LicensePlan;
    max_users?: number;
    max_products?: number;
    starts_at: string;
    expires_at: string;
    notes?: string;
}

export const PLAN_LABELS: Record<LicensePlan, string> = {
    basic: 'Basic',
    pro: 'Professional',
    enterprise: 'Enterprise',
};

export const STATUS_COLORS: Record<LicenseStatus, string> = {
    active: 'badge-success',
    suspended: 'badge-warning',
    expired: 'badge-danger',
    revoked: 'badge-danger',
};
