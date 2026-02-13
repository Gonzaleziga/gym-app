import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../../core/services/users.service';
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

  // 🔥 ROLES DISPONIBLES (dinámico)
  roles = ['admin', 'employee', 'client', 'visitor'];

  constructor(private usersService: UsersService) { }

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;

    this.users = await this.usersService.getAllUsers();

    // 🔥 separar por rol
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

}