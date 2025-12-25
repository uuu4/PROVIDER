import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { VersionService } from '../../core/services';
import { AppVersion, VersionCreateRequest } from '../../core/models';

@Component({
    selector: 'app-versions',
    standalone: true,
    imports: [CommonModule, FormsModule, SidebarComponent],
    template: `
    <div class="flex min-h-screen">
      <app-sidebar></app-sidebar>
      
      <main class="flex-1 p-8">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Version Management</h1>
          <button (click)="openCreateModal()" class="btn-primary">
            + New Version
          </button>
        </div>

        <!-- Versions Table -->
        <div class="card overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="table-header">Version</th>
                <th class="table-header">Git Tag</th>
                <th class="table-header">Status</th>
                <th class="table-header">Min PHP</th>
                <th class="table-header">Released</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (version of versionService.versions(); track version.id) {
                <tr class="hover:bg-gray-50">
                  <td class="table-cell font-mono font-bold">
                    v{{ version.version }}
                    @if (version.is_critical) {
                      <span class="badge badge-error ml-2">Critical</span>
                    }
                  </td>
                  <td class="table-cell font-mono text-sm text-gray-500">
                    {{ version.git_tag || '-' }}
                  </td>
                  <td class="table-cell">
                    @if (version.released_at) {
                      <span class="badge badge-success">Published</span>
                    } @else {
                      <span class="badge badge-warning">Draft</span>
                    }
                    @if (version.is_stable) {
                      <span class="badge badge-info ml-1">Stable</span>
                    }
                  </td>
                  <td class="table-cell text-gray-500">
                    {{ version.min_php_version || 'Any' }}
                  </td>
                  <td class="table-cell">
                    @if (version.released_at) {
                      {{ version.released_at | date:'mediumDate' }}
                    } @else {
                      <span class="text-gray-400">Not released</span>
                    }
                  </td>
                  <td class="table-cell">
                    @if (!version.released_at) {
                      <button (click)="publishVersion(version)" 
                              class="text-green-600 hover:text-green-800 mr-3">
                        Publish
                      </button>
                    }
                    <button (click)="editVersion(version)" 
                            class="text-primary-600 hover:text-primary-800 mr-3">
                      Edit
                    </button>
                    <button (click)="deleteVersion(version)" 
                            class="text-red-600 hover:text-red-800">
                      Delete
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="table-cell text-center text-gray-500">
                    @if (versionService.loading()) {
                      Loading versions...
                    } @else {
                      No versions found. Create your first version!
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Create/Edit Modal -->
        @if (showModal()) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <h2 class="text-xl font-bold mb-6">
                {{ editingVersion() ? 'Edit Version' : 'Create New Version' }}
              </h2>
              
              <form (ngSubmit)="saveVersion()" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label">Version Number *</label>
                    <input type="text" [(ngModel)]="formData.version" name="version" 
                           class="input" placeholder="1.0.0" required>
                  </div>
                  <div>
                    <label class="label">Git Tag</label>
                    <input type="text" [(ngModel)]="formData.git_tag" name="git_tag" 
                           class="input" placeholder="v1.0.0">
                  </div>
                </div>
                <div>
                  <label class="label">Release Notes</label>
                  <textarea [(ngModel)]="formData.release_notes" name="release_notes" 
                            class="input" rows="3" placeholder="What's new..."></textarea>
                </div>
                <div>
                  <label class="label">Changelog</label>
                  <textarea [(ngModel)]="formData.changelog" name="changelog" 
                            class="input" rows="4" placeholder="- Fixed bug..."></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label">Download URL</label>
                    <input type="url" [(ngModel)]="formData.download_url" name="download_url" 
                           class="input" placeholder="https://...">
                  </div>
                  <div>
                    <label class="label">Min PHP Version</label>
                    <input type="text" [(ngModel)]="formData.min_php_version" name="min_php_version" 
                           class="input" placeholder="8.1">
                  </div>
                </div>
                <div class="flex gap-6">
                  <label class="flex items-center gap-2">
                    <input type="checkbox" [(ngModel)]="formData.is_stable" name="is_stable" 
                           class="w-4 h-4 rounded border-gray-300">
                    <span>Stable Release</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input type="checkbox" [(ngModel)]="formData.is_critical" name="is_critical" 
                           class="w-4 h-4 rounded border-gray-300">
                    <span class="text-red-600">Critical Update</span>
                  </label>
                </div>
                @if (!editingVersion()) {
                  <label class="flex items-center gap-2">
                    <input type="checkbox" [(ngModel)]="formData.publish_now" name="publish_now" 
                           class="w-4 h-4 rounded border-gray-300">
                    <span>Publish immediately</span>
                  </label>
                }

                <div class="flex justify-end gap-3 pt-4">
                  <button type="button" (click)="closeModal()" class="btn-secondary">Cancel</button>
                  <button type="submit" class="btn-primary">
                    {{ editingVersion() ? 'Update' : 'Create' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </main>
    </div>
  `
})
export class VersionsComponent implements OnInit {
    versionService = inject(VersionService);

    showModal = signal(false);
    editingVersion = signal<AppVersion | null>(null);

    formData: VersionCreateRequest & { is_critical?: boolean } = {
        version: '',
        git_tag: '',
        release_notes: '',
        changelog: '',
        download_url: '',
        is_stable: true,
        is_critical: false,
        min_php_version: '8.1',
        publish_now: false,
    };

    ngOnInit(): void {
        this.loadVersions();
    }

    loadVersions(): void {
        this.versionService.getAll().subscribe();
    }

    openCreateModal(): void {
        this.editingVersion.set(null);
        this.formData = {
            version: '',
            git_tag: '',
            release_notes: '',
            changelog: '',
            download_url: '',
            is_stable: true,
            is_critical: false,
            min_php_version: '8.1',
            publish_now: false,
        };
        this.showModal.set(true);
    }

    editVersion(version: AppVersion): void {
        this.editingVersion.set(version);
        this.formData = {
            version: version.version,
            git_tag: version.git_tag || '',
            release_notes: version.release_notes || '',
            changelog: version.changelog || '',
            download_url: version.download_url || '',
            is_stable: version.is_stable,
            is_critical: version.is_critical,
            min_php_version: version.min_php_version || '',
        };
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.editingVersion.set(null);
    }

    saveVersion(): void {
        const editing = this.editingVersion();
        if (editing) {
            this.versionService.update(editing.id, this.formData).subscribe({
                next: () => {
                    this.closeModal();
                    this.loadVersions();
                }
            });
        } else {
            this.versionService.create(this.formData).subscribe({
                next: () => {
                    this.closeModal();
                    this.loadVersions();
                }
            });
        }
    }

    publishVersion(version: AppVersion): void {
        if (confirm(`Publish version ${version.version}? This will make it available to all tenants.`)) {
            this.versionService.publish(version.id).subscribe({
                next: () => this.loadVersions()
            });
        }
    }

    deleteVersion(version: AppVersion): void {
        if (confirm(`Delete version ${version.version}?`)) {
            this.versionService.delete(version.id).subscribe({
                next: () => this.loadVersions()
            });
        }
    }
}
