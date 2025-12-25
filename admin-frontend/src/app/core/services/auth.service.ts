import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Admin, AuthResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl = environment.apiUrl;

    private adminSignal = signal<Admin | null>(null);
    private tokenSignal = signal<string | null>(null);

    admin = this.adminSignal.asReadonly();
    token = this.tokenSignal.asReadonly();
    isAuthenticated = computed(() => !!this.tokenSignal());

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        const token = localStorage.getItem('admin_token');
        const adminStr = localStorage.getItem('admin');

        if (token && adminStr) {
            this.tokenSignal.set(token);
            this.adminSignal.set(JSON.parse(adminStr));
        }
    }

    login(email: string, password: string): Promise<AuthResponse> {
        return new Promise((resolve, reject) => {
            this.http.post<AuthResponse>(`${this.apiUrl}/admin/auth/login`, { email, password })
                .subscribe({
                    next: (response) => {
                        this.tokenSignal.set(response.token);
                        this.adminSignal.set(response.admin);
                        localStorage.setItem('admin_token', response.token);
                        localStorage.setItem('admin', JSON.stringify(response.admin));
                        resolve(response);
                    },
                    error: (err) => reject(err)
                });
        });
    }

    logout(): void {
        const token = this.tokenSignal();
        if (token) {
            this.http.post(`${this.apiUrl}/admin/auth/logout`, {}).subscribe();
        }

        this.tokenSignal.set(null);
        this.adminSignal.set(null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin');
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return this.tokenSignal();
    }
}
