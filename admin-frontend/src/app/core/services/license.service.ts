import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { License, LicenseCreateRequest, PaginatedResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class LicenseService {
    private readonly apiUrl = `${environment.apiUrl}/admin/licenses`;

    licenses = signal<License[]>([]);
    loading = signal(false);
    totalCount = signal(0);

    constructor(private http: HttpClient) { }

    getAll(params?: { search?: string; status?: string; plan?: string; tenant_id?: string; page?: number }): Observable<PaginatedResponse<License>> {
        this.loading.set(true);

        let httpParams = new HttpParams();
        if (params?.search) httpParams = httpParams.set('search', params.search);
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.plan) httpParams = httpParams.set('plan', params.plan);
        if (params?.tenant_id) httpParams = httpParams.set('tenant_id', params.tenant_id);
        if (params?.page) httpParams = httpParams.set('page', params.page.toString());

        return this.http.get<PaginatedResponse<License>>(this.apiUrl, { params: httpParams }).pipe(
            tap(response => {
                this.licenses.set(response.data);
                this.totalCount.set(response.total);
                this.loading.set(false);
            })
        );
    }

    getById(id: string): Observable<{ license: License; validation_count: number; success_rate: number }> {
        return this.http.get<{ license: License; validation_count: number; success_rate: number }>(`${this.apiUrl}/${id}`);
    }

    create(data: LicenseCreateRequest): Observable<{ message: string; license: License }> {
        return this.http.post<{ message: string; license: License }>(this.apiUrl, data);
    }

    update(id: string, data: Partial<License>): Observable<{ message: string; license: License }> {
        return this.http.put<{ message: string; license: License }>(`${this.apiUrl}/${id}`, data);
    }

    extend(id: string, days: number): Observable<{ message: string; license: License }> {
        return this.http.post<{ message: string; license: License }>(`${this.apiUrl}/${id}/extend`, { days });
    }

    revoke(id: string): Observable<{ message: string; license: License }> {
        return this.http.post<{ message: string; license: License }>(`${this.apiUrl}/${id}/revoke`, {});
    }

    generateKey(): Observable<{ license_key: string }> {
        return this.http.get<{ license_key: string }>(`${this.apiUrl}/generate-key`);
    }
}
