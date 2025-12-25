import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppVersion, VersionCreateRequest } from '../models';

export interface VersionsResponse {
    data: AppVersion[];
    meta?: {
        current_page: number;
        last_page: number;
        total: number;
    };
}

@Injectable({ providedIn: 'root' })
export class VersionService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin/versions`;

    versions = signal<AppVersion[]>([]);
    loading = signal(false);

    getAll(): Observable<VersionsResponse> {
        this.loading.set(true);
        return this.http.get<VersionsResponse>(this.apiUrl).pipe(
            tap({
                next: (response) => {
                    this.versions.set(response.data);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false),
            })
        );
    }

    create(data: VersionCreateRequest): Observable<{ message: string; version: AppVersion }> {
        return this.http.post<{ message: string; version: AppVersion }>(this.apiUrl, data);
    }

    update(id: string, data: Partial<VersionCreateRequest>): Observable<{ message: string; version: AppVersion }> {
        return this.http.put<{ message: string; version: AppVersion }>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
    }

    publish(id: string): Observable<{ message: string; version: AppVersion }> {
        return this.http.post<{ message: string; version: AppVersion }>(`${this.apiUrl}/${id}/publish`, {});
    }
}
