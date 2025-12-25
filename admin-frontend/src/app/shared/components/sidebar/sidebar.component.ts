import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    template: `
    <aside class="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <!-- Logo -->
      <div class="p-6 border-b border-gray-800">
        <h1 class="text-xl font-bold text-primary-400">🏢 SaaS Provider</h1>
        <p class="text-xs text-gray-400 mt-1">Admin Panel</p>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4">
        <ul class="space-y-2">
          <li>
            <a routerLink="/dashboard" routerLinkActive="bg-primary-600"
               class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <span class="text-xl">📊</span>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/tenants" routerLinkActive="bg-primary-600"
               class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <span class="text-xl">🏭</span>
              <span>Tenants</span>
            </a>
          </li>
          <li>
            <a routerLink="/licenses" routerLinkActive="bg-primary-600"
               class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <span class="text-xl">🔑</span>
              <span>Licenses</span>
            </a>
          </li>
          <li>
            <a routerLink="/validations" routerLinkActive="bg-primary-600"
               class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <span class="text-xl">📋</span>
              <span>Validation Logs</span>
            </a>
          </li>
          <li>
            <a routerLink="/versions" routerLinkActive="bg-primary-600"
               class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <span class="text-xl">📦</span>
              <span>Versions</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- User Info -->
      <div class="p-4 border-t border-gray-800">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
            {{ admin()?.name?.charAt(0) || 'A' }}
          </div>
          <div>
            <p class="font-medium text-sm">{{ admin()?.name }}</p>
            <p class="text-xs text-gray-400">{{ admin()?.email }}</p>
          </div>
        </div>
        <button (click)="logout()" 
                class="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
          🚪 Logout
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
    private authService = inject(AuthService);

    admin = this.authService.admin;

    logout(): void {
        this.authService.logout();
    }
}
