import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../../core/services/users.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {

  users: any[] = [];
  loading = true;

  admins: any[] = [];
  employees: any[] = [];
  clients: any[] = [];
  visitors: any[] = [];

  roles = ['admin', 'employee', 'client', 'visitor'];

  constructor(
    private usersService: UsersService,
    private authService: AuthService   // 🔥 AQUÍ ESTÁ EL CAMBIO
  ) { }

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;

    this.users = await this.usersService.getAllUsers();

    this.admins = this.users.filter(u => u.role === 'admin');
    this.employees = this.users.filter(u => u.role === 'employee');
    this.clients = this.users.filter(u => u.role === 'client');
    this.visitors = this.users.filter(u => u.role === 'visitor');

    this.loading = false;
  }

  async changeRole(uid: string, role: string) {
    await this.usersService.updateUser(uid, { role });
    await this.loadUsers();
  }

  async toggleStatus(user: any) {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';

    await this.usersService.updateUser(user.uid, {
      status: newStatus
    });

    await this.loadUsers();
  }

  async forceLogout(uid: string) {
    await this.usersService.updateUser(uid, {
      forceLogout: true
    });

    await this.loadUsers();
  }

  // 🔥 AHORA SÍ FUNCIONA
  async resetPassword(user: any) {
    await this.authService.resetPassword(user.email);
    alert('Correo de recuperación enviado a ' + user.email);
  }
}