import { Routes } from '@angular/router';

export const routes: Routes = [
    // Público
    {
        path: '',
        loadComponent: () =>
            import('./public/landing/landing.component')
                .then(m => m.LandingComponent)
    },
    {
        path: 'login', loadComponent: () =>
            import('./auth/login/login.component')
                .then(m => m.LoginComponent)
    },

    { path: '**', redirectTo: '' }

];
