import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900">
      <div class="card max-w-md w-full mx-4">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">🏢 SaaS Provider</h1>
          <p class="text-gray-500 mt-2">Admin Panel Login</p>
        </div>

        <!-- Error Message -->
        @if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {{ error() }}
          </div>
        }

        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="label">Email</label>
            <input type="email" 
                   [(ngModel)]="email" 
                   name="email"
                   class="input"
                   placeholder="admin@provider.com"
                   required>
          </div>

          <div>
            <label class="label">Password</label>
            <input type="password" 
                   [(ngModel)]="password" 
                   name="password"
                   class="input"
                   placeholder="••••••••"
                   required>
          </div>

          <button type="submit" 
                  [disabled]="loading()"
                  class="w-full btn-primary py-3 text-lg">
            @if (loading()) {
              <span>Signing in...</span>
            } @else {
              <span>Sign In</span>
            }
          </button>
        </form>

        <!-- Demo Credentials -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <p class="text-xs text-gray-500 text-center">
            Demo: admin&#64;provider.com / password123
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    email = '';
    password = '';
    loading = signal(false);
    error = signal<string | null>(null);

    async onSubmit(): Promise<void> {
        if (!this.email || !this.password) {
            this.error.set('Please enter email and password');
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        try {
            await this.authService.login(this.email, this.password);
            this.router.navigate(['/dashboard']);
        } catch (err: any) {
            this.error.set(err?.error?.message || 'Login failed. Please try again.');
        } finally {
            this.loading.set(false);
        }
    }
}
