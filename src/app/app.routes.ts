import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { PasswordUpdateGuard } from './core/guards/password-update.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/login/login').then(m => m.Login)
    },
    {
        path: 'force-change-password',
        loadComponent: () => import('./features/force-change-password/force-change-password').then(m => m.ForceChangePassword),
        canActivate: [AuthGuard, PasswordUpdateGuard] // Both guards
    },
    {
        path: '',
        loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/profile/profile').then(m => m.Profile)
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];