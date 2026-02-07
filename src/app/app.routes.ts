import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';

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


    { path: '**', redirectTo: '' }

];
