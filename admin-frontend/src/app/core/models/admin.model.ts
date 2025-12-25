export interface Admin {
    id: string;
    name: string;
    email: string;
    last_login_at?: string;
}

export interface AuthResponse {
    admin: Admin;
    token: string;
}
