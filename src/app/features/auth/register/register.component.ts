import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../core/services/auth.service';
import { last } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModalComponent }
  from '../../shared/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  form!: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      lastNameFather: ['', Validators.required],
      lastNameMother: ['', Validators.required],
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{10}$/)
        ]
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      membershipId: [''],
      forceLogout: [false]
    });
  }



  register() {
    if (this.form.invalid || this.loading) return;

    const {
      name,
      lastNameFather,
      lastNameMother,
      phoneNumber,
      email,
      password,
      confirmPassword
    } = this.form.value;

    if (password !== confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.error = null;

    // 🔥 ORDEN CORRECTO DE PARÁMETROS
    this.authService.register(
      email,
      password,
      name,
      lastNameFather,
      lastNameMother,
      phoneNumber
    )
      .then(() => {
        // quitamos el alert y ponemos el dialog
        // alert('Cuenta creada correctamente');
        const dialogRef = this.dialog.open(ConfirmModalComponent, {
          width: '350px',
          data: {
            title: 'Registro Exitoso',
            message: 'Tu cuenta fue creada correctamente.',
            confirmText: 'Continuar',
            hideCancel: true
          }
        });

        dialogRef.afterClosed().subscribe(() => {
          this.router.navigate(['/login']);
        });

        // aqui termina el dialog 
        this.router.navigateByUrl('/login');
      })
      .catch(err => {
        this.error = err.message;
      })
      .finally(() => {
        this.loading = false;
      });
  }
}