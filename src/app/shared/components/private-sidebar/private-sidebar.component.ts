import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, Router } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { UserSessionService } from '../../../core/services/user-session.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatSelectModule } from '@angular/material/select';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}
@Component({
  selector: 'app-private-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSelectModule

  ],
  templateUrl: './private-sidebar.component.html',
  styleUrl: './private-sidebar.component.scss'
})
export class PrivateSidebarComponent {
  // 🔹 CONTROL DEL SIDEBAR (PASO 1)
  isOpen = false;

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  closeSidebar() {
    this.isOpen = false;
  }

  // ✅ ahora NO se usa antes del constructor
  role = computed(() => this.userSession.role());

  menuItems = computed<MenuItem[]>(() => {
    switch (this.role()) {
      case 'admin':
        return [
          { label: 'Mi panel', route: '/admin', icon: 'dashboard' },
          { label: 'Usuarios', route: '/admin/users', icon: 'group' },
          { label: 'Planes', route: '/admin/plans', icon: 'workspace_premium' },
          { label: 'Ejercicios', route: '/admin/exercises', icon: 'fitness_center' },
          { label: 'Rutinas', route: '/routines', icon: 'fitness_center' }
        ];

      case 'client':
        return [
          { label: 'Mi panel', route: '/client', icon: 'dashboard' },
          { label: 'Pagos', route: '/client/payments', icon: 'payments' },
          { label: 'Mi Rutina', route: '/client/routine', icon: 'fitness_center' },
        ];

      case 'employee':
        return [
          { label: 'Mi panel', route: '/employee', icon: 'dashboard' },
          { label: 'Usuarios', route: '/employee/users', icon: 'group' },
          { label: 'Rutinas', route: '/routines', icon: 'fitness_center' }
        ];

      case 'visitor':
        return [
          { label: 'Mi panel', route: '/visitor', icon: 'dashboard' }
        ];

      default:
        return [];
    }
  });

  constructor(
    private userSession: UserSessionService,
    private authService: AuthService,
    private router: Router
  ) { }

  // 🔥 LOGOUT GLOBAL
  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/');
  }

}