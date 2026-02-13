import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loading = false;
  error: string | null = null;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    // ✅ Leer TODO el form correctamente
    const { email, password } = this.form.value;

    console.log('EMAIL:', email);
    console.log('PASSWORD:', password);

    if (!email || !password) {
      this.error = 'Email y contraseña son obligatorios';
      this.loading = false;
      return;
    }

    this.authService.login(email.trim(), password)
      .then(() => {
        console.log('✅ Login correcto');
        return this.authService.redirectByRole();
      })
      .catch(err => {
        console.error('❌ Login error:', err);
        this.error = err.message;
      })
      .finally(() => {
        this.loading = false;
      });
  }
  async loginGoogle() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigateByUrl('/');
    } catch (err: any) {
      console.error(err);
      this.error = err?.message ?? 'Error al iniciar sesión';
    }
  }
}