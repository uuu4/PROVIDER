import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { TenantService } from '../../core/services';
import { Tenant } from '../../core/models';

@Component({
    selector: 'app-tenants',
    standalone: true,
    imports: [CommonModule, FormsModule, SidebarComponent],
    template: `
    <div class="flex min-h-screen">
      <app-sidebar></app-sidebar>
      
      <main class="flex-1 p-8">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Tenant Management</h1>
          <button (click)="showModal.set(true)" class="btn-primary">
            + Add Tenant
          </button>
        </div>

        <!-- Search -->
        <div class="card mb-6">
          <div class="flex gap-4">
            <input type="text" 
                   [(ngModel)]="searchQuery"
                   (ngModelChange)="onSearch()"
                   class="input flex-1"
                   placeholder="Search by company name, domain, or email...">
            <select [(ngModel)]="statusFilter" (ngModelChange)="onSearch()" class="input w-40">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <!-- Tenants Table -->
        <div class="card overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="table-header">Company</th>
                <th class="table-header">Domain</th>
                <th class="table-header">Contact</th>
                <th class="table-header">Status</th>
                <th class="table-header">Licenses</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (tenant of tenantService.tenants(); track tenant.id) {
                <tr class="hover:bg-gray-50">
                  <td class="table-cell font-medium">{{ tenant.company_name }}</td>
                  <td class="table-cell text-gray-500">{{ tenant.domain }}</td>
                  <td class="table-cell">
                    <div>{{ tenant.contact_name }}</div>
                    <div class="text-xs text-gray-400">{{ tenant.contact_email }}</div>
                  </td>
                  <td class="table-cell">
                    <span class="badge" [class]="tenant.is_active ? 'badge-success' : 'badge-danger'">
                      {{ tenant.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="table-cell">{{ tenant.licenses_count || 0 }}</td>
                  <td class="table-cell">
                    <button (click)="editTenant(tenant)" class="text-primary-600 hover:text-primary-800 mr-2">
                      Edit
                    </button>
                    <button (click)="deleteTenant(tenant)" class="text-red-600 hover:text-red-800">
                      Delete
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="table-cell text-center text-gray-500">
                    No tenants found
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Add/Edit Modal -->
        @if (showModal()) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
              <h2 class="text-xl font-bold mb-6">{{ editingTenant() ? 'Edit Tenant' : 'Add New Tenant' }}</h2>
              
              <form (ngSubmit)="saveTenant()" class="space-y-4">
                <div>
                  <label class="label">Company Name *</label>
                  <input type="text" [(ngModel)]="formData.company_name" name="company_name" class="input" required>
                </div>
                <div>
                  <label class="label">Domain *</label>
                  <input type="text" [(ngModel)]="formData.domain" name="domain" class="input" required>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label">Contact Name *</label>
                    <input type="text" [(ngModel)]="formData.contact_name" name="contact_name" class="input" required>
                  </div>
                  <div>
                    <label class="label">Contact Email *</label>
                    <input type="email" [(ngModel)]="formData.contact_email" name="contact_email" class="input" required>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label">Phone</label>
                    <input type="text" [(ngModel)]="formData.contact_phone" name="contact_phone" class="input">
                  </div>
                  <div>
                    <label class="label">Status</label>
                    <select [(ngModel)]="formData.is_active" name="is_active" class="input">
                      <option [ngValue]="true">Active</option>
                      <option [ngValue]="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="label">Address</label>
                  <textarea [(ngModel)]="formData.address" name="address" class="input" rows="2"></textarea>
                </div>

                <div class="flex justify-end gap-3 pt-4">
                  <button type="button" (click)="closeModal()" class="btn-secondary">Cancel</button>
                  <button type="submit" class="btn-primary">{{ editingTenant() ? 'Update' : 'Create' }}</button>
                </div>
              </form>
            </div>
          </div>
        }
      </main>
    </div>
  `
})
export class TenantsComponent implements OnInit {
    tenantService = inject(TenantService);

    searchQuery = '';
    statusFilter = '';
    showModal = signal(false);
    editingTenant = signal<Tenant | null>(null);

    formData = {
        company_name: '',
        domain: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        is_active: true,
    };

    ngOnInit(): void {
        this.loadTenants();
    }

    loadTenants(): void {
        this.tenantService.getAll({
            search: this.searchQuery,
            status: this.statusFilter,
        }).subscribe();
    }

    onSearch(): void {
        this.loadTenants();
    }

    editTenant(tenant: Tenant): void {
        this.editingTenant.set(tenant);
        this.formData = {
            company_name: tenant.company_name,
            domain: tenant.domain,
            contact_name: tenant.contact_name,
            contact_email: tenant.contact_email,
            contact_phone: tenant.contact_phone || '',
            address: tenant.address || '',
            is_active: tenant.is_active,
        };
        this.showModal.set(true);
    }

    saveTenant(): void {
        const editing = this.editingTenant();
        if (editing) {
            this.tenantService.update(editing.id, this.formData).subscribe({
                next: () => {
                    this.closeModal();
                    this.loadTenants();
                }
            });
        } else {
            this.tenantService.create(this.formData).subscribe({
                next: () => {
                    this.closeModal();
                    this.loadTenants();
                }
            });
        }
    }

    deleteTenant(tenant: Tenant): void {
        if (confirm(`Delete tenant "${tenant.company_name}"?`)) {
            this.tenantService.delete(tenant.id).subscribe({
                next: () => this.loadTenants()
            });
        }
    }

    closeModal(): void {
        this.showModal.set(false);
        this.editingTenant.set(null);
        this.formData = {
            company_name: '',
            domain: '',
            contact_name: '',
            contact_email: '',
            contact_phone: '',
            address: '',
            is_active: true,
        };
    }
}
