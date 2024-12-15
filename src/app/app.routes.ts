import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { MainLayout } from './features/main-layout/main-layout';
import { Dashboard } from './features/dashboard/dashboard';

export const routes: Routes = [
    {
        path: 'login',
        component: Login
    },
    {
        path: '',
        component: MainLayout,
        children: [
            {
                path: 'dashboard',
                component: Dashboard
            },
        ]
    }
];
