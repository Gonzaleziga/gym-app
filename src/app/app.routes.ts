import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { clientGuard } from './core/guards/cliente.guard';
import { employeeGuard } from './core/guards/employee.guard';
import { visitorGuard } from './core/guards/visitor.guard';

export const routes: Routes = [
    // Público
    {
        path: '',
        loadComponent: () =>
            import('./public/landing/landing.component')
                .then(m => m.LandingComponent)
    },
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/login/login.component')
                .then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () =>
            import('./features/auth/register/register.component')
                .then(m => m.RegisterComponent)
    },

    // Privado
    {
        path: 'admin',
        loadComponent: () =>
            import('./features/admin/dashboard/dashboard.component')
                .then(m => m.DashboardComponent),
        canMatch: [authGuard, adminGuard]
    },

    {
        path: 'client',
        loadComponent: () =>
            import('./features/cliente/dashboard/dashboard.component')
                .then(m => m.DashboardComponent),
        canMatch: [authGuard, clientGuard]
    },
    {
        path: 'employee',
        loadComponent: () =>
            import('./features/empleado/dashboard/dashboard.component')
                .then(m => m.DashboardComponent),
        canMatch: [authGuard, employeeGuard]
    },
    {
        path: 'visitor',
        loadComponent: () =>
            import('./features/visitor/dashboard/dashboard.component')
                .then(m => m.DashboardComponent),
        canMatch: [authGuard, visitorGuard]
    },

    { path: '**', redirectTo: '' }

];
