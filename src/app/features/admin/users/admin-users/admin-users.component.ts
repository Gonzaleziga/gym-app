import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../../core/services/users.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { Auth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { PaymentHistoryModalComponent }
  from '../payment-history-modal/payment-history-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    FormsModule
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
  expandedUserId: string | null = null;
  searchTerm: string = '';
  activeTabIndex: number = 0;

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private auth: Auth,
    private dialog: MatDialog
  ) { }

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;

    this.users = await this.usersService.getAllUsers();

    const today = new Date();

    // 🔥 Verificar vencimiento automático
    for (const user of this.users) {
      if (user.membershipEnd) {

        const endDate = user.membershipEnd.toDate
          ? user.membershipEnd.toDate()
          : new Date(user.membershipEnd);

        if (endDate < today && user.membershipStatus === 'active') {

          await this.usersService.updateUser(user.uid, {
            membershipStatus: 'expired'
          });

          user.membershipStatus = 'expired';
        }
      }
    }

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

    const newStatus =
      user.status === 'active' ? 'inactive' : 'active';

    await this.usersService.updateUser(user.uid, {
      status: newStatus
    });

    // 🔥 ACTUALIZA SOLO EL OBJETO EN MEMORIA
    user.status = newStatus;
  }

  async forceLogout(uid: string) {
    await this.usersService.updateUser(uid, { forceLogout: true });
    await this.loadUsers();
  }

  async resetPassword(user: any) {
    await this.authService.resetPassword(user.email);
    alert('Correo de recuperación enviado a ' + user.email);
  }

  async activateMembership(user: any) {
    await this.usersService.activateMembership(user.uid, 1);
    await this.loadUsers();
  }

  async registerMonthlyPayment(user: any) {
    const adminUid = this.auth.currentUser?.uid;
    if (!adminUid) return;

    await this.usersService.registerPayment(
      user,
      1,
      500,
      adminUid
    );

    await this.loadUsers();
  }

  // ✅ ÚNICO MÉTODO CORRECTO
  viewPayments(user: any) {
    this.dialog.open(PaymentHistoryModalComponent, {
      data: {
        uid: user.uid,
        name: user.name
      },
      width: '650px'
    });
  }

  toggleDetails(uid: string) {
    this.expandedUserId =
      this.expandedUserId === uid ? null : uid;
  }

  getFilteredUsers(list: any[]) {

    if (!this.searchTerm) return list;

    const term = this.searchTerm.toLowerCase();

    return list.filter(user =>
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    );
  }

}