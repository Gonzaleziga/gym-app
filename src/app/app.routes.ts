import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { clienteGuard } from './core/guards/cliente.guard';
import { empleadoGuard } from './core/guards/empleado.guard';

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
        path: 'cliente',
        loadComponent: () =>
            import('./features/cliente/dashboard/dashboard.component')
                .then(m => m.DashboardComponent),
        canMatch: [authGuard, clienteGuard]
    },
    {
        path: 'empleado',
        loadComponent: () =>
            import('./features/empleado/dashboard/dashboard.component')
                .then(m => m.DashboardComponent),
        canMatch: [authGuard, empleadoGuard]
    },

    { path: '**', redirectTo: '' }

];
