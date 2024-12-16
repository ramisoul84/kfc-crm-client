import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { MainLayout } from './features/main-layout/main-layout';
import { Dashboard } from './features/dashboard/dashboard';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: Login
    },
    {
        path: '',
        component: MainLayout,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'dashboard',
                component: Dashboard
            },
        ]
    }
];
