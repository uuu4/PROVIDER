import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Tenant, TenantCreateRequest, PaginatedResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class TenantService {
    private readonly apiUrl = `${environment.apiUrl}/admin/tenants`;

    tenants = signal<Tenant[]>([]);
    loading = signal(false);
    totalCount = signal(0);

    constructor(private http: HttpClient) { }

    getAll(params?: { search?: string; status?: string; page?: number; per_page?: number }): Observable<PaginatedResponse<Tenant>> {
        this.loading.set(true);

        let httpParams = new HttpParams();
        if (params?.search) httpParams = httpParams.set('search', params.search);
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.page) httpParams = httpParams.set('page', params.page.toString());
        if (params?.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());

        return this.http.get<PaginatedResponse<Tenant>>(this.apiUrl, { params: httpParams }).pipe(
            tap(response => {
                this.tenants.set(response.data);
                this.totalCount.set(response.total);
                this.loading.set(false);
            })
        );
    }

    getById(id: string): Observable<{ tenant: Tenant; active_license: any; licenses_count: number }> {
        return this.http.get<{ tenant: Tenant; active_license: any; licenses_count: number }>(`${this.apiUrl}/${id}`);
    }

    create(data: TenantCreateRequest): Observable<{ message: string; tenant: Tenant }> {
        return this.http.post<{ message: string; tenant: Tenant }>(this.apiUrl, data);
    }

    update(id: string, data: Partial<TenantCreateRequest>): Observable<{ message: string; tenant: Tenant }> {
        return this.http.put<{ message: string; tenant: Tenant }>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
    }
}
