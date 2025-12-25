export type ValidationStatus = 'success' | 'failed' | 'expired' | 'revoked' | 'invalid';

export interface LicenseValidation {
    id: string;
    license_id?: string;
    license_key?: string;
    tenant?: string;
    ip_address: string;
    user_agent?: string;
    domain?: string;
    app_version?: string;
    php_version?: string;
    status: ValidationStatus;
    error_message?: string;
    validated_at: string;
}

export const VALIDATION_STATUS_COLORS: Record<ValidationStatus, string> = {
    success: 'badge-success',
    failed: 'badge-danger',
    expired: 'badge-warning',
    revoked: 'badge-danger',
    invalid: 'badge-danger',
};
