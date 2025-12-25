import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { LicenseService, TenantService } from '../../core/services';
import { License, Tenant, PLAN_LABELS, STATUS_COLORS } from '../../core/models';

@Component({
    selector: 'app-licenses',
    standalone: true,
    imports: [CommonModule, FormsModule, SidebarComponent],
    template: `
    <div class="flex min-h-screen">
      <app-sidebar></app-sidebar>
      
      <main class="flex-1 p-8">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-2xl font-bold text-gray-900">License Management</h1>
          <button (click)="openCreateModal()" class="btn-primary">
            + Create License
          </button>
        </div>

        <!-- Filters -->
        <div class="card mb-6">
          <div class="flex gap-4">
            <input type="text" 
                   [(ngModel)]="searchQuery"
                   (ngModelChange)="onSearch()"
                   class="input flex-1"
                   placeholder="Search by license key or tenant...">
            <select [(ngModel)]="statusFilter" (ngModelChange)="onSearch()" class="input w-40">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
            <select [(ngModel)]="planFilter" (ngModelChange)="onSearch()" class="input w-40">
              <option value="">All Plans</option>
              <option value="basic">Basic</option>
              <option value="pro">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        <!-- Licenses Table -->
        <div class="card overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="table-header">License Key</th>
                <th class="table-header">Tenant</th>
                <th class="table-header">Plan</th>
                <th class="table-header">Status</th>
                <th class="table-header">Expires</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (license of licenseService.licenses(); track license.id) {
                <tr class="hover:bg-gray-50">
                  <td class="table-cell font-mono text-sm">{{ license.license_key }}</td>
                  <td class="table-cell">{{ license.tenant?.company_name }}</td>
                  <td class="table-cell">
                    <span class="badge badge-info">{{ getPlanLabel(license.plan) }}</span>
                  </td>
                  <td class="table-cell">
                    <span class="badge" [class]="getStatusClass(license.status)">
                      {{ license.status }}
                    </span>
                  </td>
                  <td class="table-cell">
                    <div>{{ license.expires_at }}</div>
                    <div class="text-xs text-gray-400">{{ getDaysRemaining(license.expires_at) }} days</div>
                  </td>
                  <td class="table-cell">
                    <button (click)="extendLicense(license)" 
                            class="text-primary-600 hover:text-primary-800 mr-2"
                            [disabled]="license.status === 'revoked'">
                      Extend
                    </button>
                    @if (license.status !== 'revoked') {
                      <button (click)="revokeLicense(license)" class="text-red-600 hover:text-red-800">
                        Revoke
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="table-cell text-center text-gray-500">
                    No licenses found
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Create License Modal -->
        @if (showModal()) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
              <h2 class="text-xl font-bold mb-6">Create New License</h2>
              
              <form (ngSubmit)="createLicense()" class="space-y-4">
                <div>
                  <label class="label">Tenant *</label>
                  <select [(ngModel)]="formData.tenant_id" name="tenant_id" class="input" required>
                    <option value="">Select tenant...</option>
                    @for (t of tenants(); track t.id) {
                      <option [value]="t.id">{{ t.company_name }} ({{ t.domain }})</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="label">Plan *</label>
                  <select [(ngModel)]="formData.plan" name="plan" class="input" required>
                    <option value="basic">Basic</option>
                    <option value="pro">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label">Max Users</label>
                    <input type="number" [(ngModel)]="formData.max_users" name="max_users" class="input" min="1">
                  </div>
                  <div>
                    <label class="label">Max Products</label>
                    <input type="number" [(ngModel)]="formData.max_products" name="max_products" class="input" min="1">
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label">Start Date *</label>
                    <input type="date" [(ngModel)]="formData.starts_at" name="starts_at" class="input" required>
                  </div>
                  <div>
                    <label class="label">End Date *</label>
                    <input type="date" [(ngModel)]="formData.expires_at" name="expires_at" class="input" required>
                  </div>
                </div>
                <div>
                  <label class="label">Notes</label>
                  <textarea [(ngModel)]="formData.notes" name="notes" class="input" rows="2"></textarea>
                </div>

                <div class="flex justify-end gap-3 pt-4">
                  <button type="button" (click)="showModal.set(false)" class="btn-secondary">Cancel</button>
                  <button type="submit" class="btn-primary">Create License</button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- Extend Modal -->
        @if (showExtendModal()) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
              <h2 class="text-xl font-bold mb-6">Extend License</h2>
              <p class="text-gray-600 mb-4">{{ extendingLicense()?.license_key }}</p>
              
              <div class="mb-6">
                <label class="label">Extend by (days)</label>
                <input type="number" [(ngModel)]="extendDays" class="input" min="1" max="365">
              </div>

              <div class="flex justify-end gap-3">
                <button (click)="showExtendModal.set(false)" class="btn-secondary">Cancel</button>
                <button (click)="confirmExtend()" class="btn-success">Extend</button>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `
})
export class LicensesComponent implements OnInit {
    licenseService = inject(LicenseService);
    tenantService = inject(TenantService);

    searchQuery = '';
    statusFilter = '';
    planFilter = '';
    showModal = signal(false);
    showExtendModal = signal(false);
    extendingLicense = signal<License | null>(null);
    extendDays = 30;
    tenants = signal<Tenant[]>([]);

    formData = {
        tenant_id: '',
        plan: 'pro' as const,
        max_users: 10,
        max_products: 1000,
        starts_at: new Date().toISOString().split('T')[0],
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
    };

    ngOnInit(): void {
        this.loadLicenses();
        this.loadTenants();
    }

    loadLicenses(): void {
        this.licenseService.getAll({
            search: this.searchQuery,
            status: this.statusFilter,
            plan: this.planFilter,
        }).subscribe();
    }

    loadTenants(): void {
        this.tenantService.getAll({ per_page: 100 }).subscribe({
            next: (response) => this.tenants.set(response.data)
        });
    }

    onSearch(): void {
        this.loadLicenses();
    }

    openCreateModal(): void {
        this.showModal.set(true);
    }

    createLicense(): void {
        this.licenseService.create(this.formData).subscribe({
            next: () => {
                this.showModal.set(false);
                this.loadLicenses();
            }
        });
    }

    extendLicense(license: License): void {
        this.extendingLicense.set(license);
        this.extendDays = 30;
        this.showExtendModal.set(true);
    }

    confirmExtend(): void {
        const license = this.extendingLicense();
        if (license) {
            this.licenseService.extend(license.id, this.extendDays).subscribe({
                next: () => {
                    this.showExtendModal.set(false);
                    this.loadLicenses();
                }
            });
        }
    }

    revokeLicense(license: License): void {
        if (confirm(`Revoke license "${license.license_key}"?`)) {
            this.licenseService.revoke(license.id).subscribe({
                next: () => this.loadLicenses()
            });
        }
    }

    getPlanLabel(plan: string): string {
        return PLAN_LABELS[plan as keyof typeof PLAN_LABELS] || plan;
    }

    getStatusClass(status: string): string {
        return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'badge-info';
    }

    getDaysRemaining(expiresAt: string): number {
        const diff = new Date(expiresAt).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
}
