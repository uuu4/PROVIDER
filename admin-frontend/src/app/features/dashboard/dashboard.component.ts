import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { DashboardService } from '../../core/services';
import { DashboardResponse } from '../../core/models';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, SidebarComponent, StatsCardComponent],
    template: `
    <div class="flex min-h-screen">
      <app-sidebar></app-sidebar>
      
      <main class="flex-1 p-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

        @if (loading()) {
          <div class="flex items-center justify-center h-64">
            <div class="text-gray-500">Loading...</div>
          </div>
        } @else if (data()) {
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <app-stats-card
              title="Total Tenants"
              [value]="data()!.stats.total_tenants"
              icon="🏭">
            </app-stats-card>
            <app-stats-card
              title="Active Licenses"
              [value]="data()!.stats.active_licenses"
              icon="🔑"
              valueClass="text-green-600">
            </app-stats-card>
            <app-stats-card
              title="Expiring Soon"
              [value]="data()!.stats.expiring_soon"
              icon="⏰"
              [valueClass]="data()!.stats.expiring_soon > 0 ? 'text-yellow-600' : 'text-gray-900'">
            </app-stats-card>
            <app-stats-card
              title="Validations Today"
              [value]="data()!.stats.validations_today"
              icon="✅"
              [subtitle]="data()!.stats.failed_validations_today + ' failed'">
            </app-stats-card>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Recent Validations -->
            <div class="card">
              <h2 class="text-lg font-semibold mb-4">Recent Validations</h2>
              <div class="space-y-3">
                @for (v of data()!.recent_validations; track v.id) {
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p class="font-medium text-sm">{{ v.tenant || 'Unknown' }}</p>
                      <p class="text-xs text-gray-500">{{ v.ip_address }}</p>
                    </div>
                    <div class="text-right">
                      <span class="badge" [class]="v.status === 'success' ? 'badge-success' : 'badge-danger'">
                        {{ v.status }}
                      </span>
                      <p class="text-xs text-gray-400 mt-1">{{ formatTime(v.validated_at) }}</p>
                    </div>
                  </div>
                } @empty {
                  <p class="text-gray-500 text-sm">No recent validations</p>
                }
              </div>
            </div>

            <!-- Expiring Licenses -->
            <div class="card">
              <h2 class="text-lg font-semibold mb-4">Expiring Licenses</h2>
              <div class="space-y-3">
                @for (l of data()!.expiring_licenses; track l.id) {
                  <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p class="font-medium text-sm">{{ l.tenant }}</p>
                      <p class="text-xs text-gray-500">{{ l.license_key }}</p>
                    </div>
                    <div class="text-right">
                      <span class="badge badge-warning">{{ l.days_remaining }} days</span>
                      <p class="text-xs text-gray-400 mt-1">{{ l.expires_at }}</p>
                    </div>
                  </div>
                } @empty {
                  <p class="text-gray-500 text-sm">No licenses expiring soon</p>
                }
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
    private dashboardService = inject(DashboardService);

    data = signal<DashboardResponse | null>(null);
    loading = signal(true);

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.dashboardService.getStats().subscribe({
            next: (response) => {
                this.data.set(response);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    formatTime(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
}
