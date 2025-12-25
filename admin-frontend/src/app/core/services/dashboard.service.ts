import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private readonly apiUrl = `${environment.apiUrl}/admin/dashboard`;

    constructor(private http: HttpClient) { }

    getStats(): Observable<DashboardResponse> {
        return this.http.get<DashboardResponse>(this.apiUrl);
    }
}
