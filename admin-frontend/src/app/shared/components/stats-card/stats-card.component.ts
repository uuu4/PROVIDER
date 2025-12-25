import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-stats-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="card hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 font-medium">{{ title }}</p>
          <p class="text-3xl font-bold mt-1" [class]="valueClass">{{ value }}</p>
          @if (subtitle) {
            <p class="text-xs text-gray-400 mt-1">{{ subtitle }}</p>
          }
        </div>
        <div class="text-4xl opacity-20">{{ icon }}</div>
      </div>
    </div>
  `
})
export class StatsCardComponent {
    @Input() title = '';
    @Input() value: string | number = 0;
    @Input() icon = '📊';
    @Input() subtitle?: string;
    @Input() valueClass = 'text-gray-900';
}
