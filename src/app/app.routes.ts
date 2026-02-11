import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { clientGuard } from './core/guards/cliente.guard';
import { employeeGuard } from './core/guards/employee.guard';
import { visitorGuard } from './core/guards/visitor.guard';
import { PrivateLayoutComponent } from './shared/layouts/private-layout/private-layout.component';

export const routes: Routes = [

    // ===============================
    // 🌍 PÚBLICO
    // ===============================
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

    // ===============================
    // 🔐 PRIVADO (UN SOLO LAYOUT)
    // ===============================
    {
        path: '',
        component: PrivateLayoutComponent,
        canMatch: [authGuard],
        children: [

            {
                path: 'admin',
                canMatch: [adminGuard],
                loadComponent: () =>
                    import('./features/admin/dashboard/dashboard.component')
                        .then(m => m.DashboardComponent)
            },

            {
                path: 'client',
                canMatch: [clientGuard],
                loadComponent: () =>
                    import('./features/cliente/dashboard/dashboard.component')
                        .then(m => m.DashboardComponent)
            },

            {
                path: 'employee',
                canMatch: [employeeGuard],
                loadComponent: () =>
                    import('./features/empleado/dashboard/dashboard.component')
                        .then(m => m.DashboardComponent)
            },

            {
                path: 'visitor',
                canMatch: [visitorGuard],
                loadComponent: () =>
                    import('./features/visitor/dashboard/dashboard.component')
                        .then(m => m.DashboardComponent)
            }

        ]
    },

    // ===============================
    // ❌ FALLBACK
    // ===============================
    { path: '**', redirectTo: '' }

];