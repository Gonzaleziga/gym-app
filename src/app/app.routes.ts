import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { clientGuard } from './core/guards/cliente.guard';
import { employeeGuard } from './core/guards/employee.guard';
import { visitorGuard } from './core/guards/visitor.guard';
import { PrivateLayoutComponent } from './shared/layouts/private-layout/private-layout.component';
import { membershipGuard } from './core/guards/membership.guard';
import { adminOrEmployeeGuard } from './core/guards/admin-or-employee.guard';

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

            // ================= ADMIN =================
            {
                path: 'admin',
                canMatch: [adminGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import('./features/admin/dashboard/dashboard.component')
                                .then(m => m.DashboardComponent)
                    },
                    {
                        path: 'users',
                        loadComponent: () =>
                            import('./features/admin/users/admin-users/admin-users.component')
                                .then(m => m.AdminUsersComponent)
                    },
                    {
                        path: 'plans',
                        loadComponent: () =>
                            import('./features/admin/plans/admin-plans/admin-plans.component')
                                .then(m => m.AdminPlansComponent)
                    },
                    {
                        path: 'exercises',
                        loadComponent: () =>
                            import('./features/admin/exercises/admin-exercises/admin-exercises.component')
                                .then(m => m.AdminExercisesComponent)
                    }
                ]
            },

            // ================= RUTINAS (ADMIN + EMPLOYEE) =================
            {
                path: 'routines',
                canMatch: [adminOrEmployeeGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import('./features/admin/routines/admin-routines/admin-routines.component')
                                .then(m => m.AdminRoutinesComponent)
                    },
                    {
                        path: ':id',
                        loadComponent: () =>
                            import('./features/admin/routines/routine-detail/routine-detail.component')
                                .then(m => m.RoutineDetailComponent)
                    }
                ]
            },

            // ================= PERFIL =================
            {
                path: 'profile',
                loadComponent: () =>
                    import('./features/profile/profile/profile.component')
                        .then(m => m.ProfileComponent)
            },
            {
                path: 'profile/:uid',
                loadComponent: () =>
                    import('./features/profile/profile/profile.component')
                        .then(m => m.ProfileComponent)
            },

            // ================= CLIENT =================
            {
                path: 'client',
                canMatch: [clientGuard, membershipGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import('./features/cliente/dashboard/dashboard.component')
                                .then(m => m.DashboardComponent)
                    },
                    {
                        path: 'routine',
                        loadComponent: () =>
                            import('./features/cliente/routine/client-routine/client-routine.component')
                                .then(m => m.ClientRoutineComponent)
                    },
                    {
                        path: 'payments',
                        loadComponent: () =>
                            import('./features/cliente/payments/client-payments/client-payments.component')
                                .then(m => m.ClientPaymentsComponent)
                    }
                ]
            },

            // ================= EMPLOYEE =================
            {
                path: 'employee',
                canMatch: [employeeGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import('./features/empleado/dashboard/dashboard.component')
                                .then(m => m.DashboardComponent)
                    },
                    {
                        path: 'users',
                        loadComponent: () =>
                            import('./features/empleado/employee-users/employee-users.component')
                                .then(m => m.EmployeeUsersComponent)
                    }
                ]
            },

            // ================= VISITOR =================
            {
                path: 'visitor',
                canMatch: [visitorGuard],
                loadComponent: () =>
                    import('./features/visitor/dashboard/dashboard.component')
                        .then(m => m.DashboardComponent)
            },

            {
                path: 'comunidad',
                loadComponent: () =>
                    import('./features/public-profile/public-profile/public-profile.component')
                        .then(m => m.PublicProfileComponent)
            }

        ]
    },

    // ===============================
    // ❌ FALLBACK
    // ===============================
    { path: '**', redirectTo: '' }

];