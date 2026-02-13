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
    MatDividerModule
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

  menuItems = computed(() => {
    switch (this.role()) {
      case 'admin':
        return [
          { label: 'Dashboard', route: '/admin' },
          { label: 'Usuarios', route: '/admin/users' },
          { label: 'Configuración', route: '/admin/settings' }
        ];

      case 'client':
        return [
          { label: 'Mi panel', route: '/client' },
          { label: 'Pagos', route: '/client/payments' }
        ];

      case 'employee':
        return [
          { label: 'Dashboard', route: '/employee' },
          { label: 'Mis grupos', route: '/employee/groups' }
        ];

      case 'visitor':
        return [
          { label: 'Inicio', route: '/visitor' }
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