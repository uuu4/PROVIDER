import { Routes } from '@angular/router';
import { authGuard } from './core/guards';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard],
    },
    {
        path: 'tenants',
        loadComponent: () => import('./features/tenants/tenants.component').then(m => m.TenantsComponent),
        canActivate: [authGuard],
    },
    {
        path: 'licenses',
        loadComponent: () => import('./features/licenses/licenses.component').then(m => m.LicensesComponent),
        canActivate: [authGuard],
    },
    {
        path: 'versions',
        loadComponent: () => import('./features/versions/versions.component').then(m => m.VersionsComponent),
        canActivate: [authGuard],
    },
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: '**',
        redirectTo: 'dashboard',
    },
];
