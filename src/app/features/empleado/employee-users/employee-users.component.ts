import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UsersService } from '../../../core/services/users.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatOption } from '@angular/material/select';


@Component({
  selector: 'app-employee-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatFormField,
    MatLabel,
    MatOption
  ],
  templateUrl: './employee-users.component.html',
  styleUrl: './employee-users.component.scss'
})
export class EmployeeUsersComponent implements OnInit {

  loading = true;

  clients: any[] = [];
  visitors: any[] = [];
  activeTabIndex = 0;
  expandedUserId: string | null = null;
  searchTerm = '';
  plans: any[] = [];
  routines: any[] = [];

  constructor(
    private usersService: UsersService,
    private paymentsService: PaymentsService,
    private auth: Auth
  ) { }

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {

    this.loading = true;

    const allUsers = await this.usersService.getAllUsers();

    this.clients = allUsers.filter((u: any) => u.role === 'client');
    this.visitors = allUsers.filter((u: any) => u.role === 'visitor');

    this.loading = false;
  }



  // 💪 Asignar rutina
  assignRoutine(user: any) {
    console.log('Asignar rutina a:', user.name);
  }


  toggleDetails(uid: string) {
    this.expandedUserId =
      this.expandedUserId === uid ? null : uid;
  }
  getFilteredUsers(list: any[]) {
    if (!this.searchTerm) return list;

    const term = this.searchTerm.toLowerCase();

    return list.filter(user =>
      `${user.name} ${user.lastNameFather} ${user.email}`
        .toLowerCase()
        .includes(term)
    );
  }
  async convertToClient(user: any) {

    await this.usersService.updateUser(user.uid, {
      role: 'client',
      membershipStatus: 'none'
    });

    await this.loadUsers();
  }
  async assignPlan(user: any) {

    if (!user.selectedPlan) return;

    const plan = this.plans.find(p => p.id === user.selectedPlan);
    if (!plan) return;

    const today = new Date();
    const endDate = new Date(
      today.getFullYear(),
      today.getMonth() + plan.durationMonths,
      today.getDate()
    );

    await this.usersService.updateUser(user.uid, {
      planId: plan.id,
      membershipStart: today,
      membershipEnd: endDate,
      membershipStatus: 'active'
    });

    await this.loadUsers();
  }
  async registerPayment(user: any) {

    if (!user.planId) return;

    const plan = this.plans.find(p => p.id === user.planId);
    if (!plan) return;

    const employeeUid = this.auth.currentUser?.uid;
    if (!employeeUid) return;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    await this.paymentsService.registerPayment({
      userId: user.uid,
      amount: plan.price,
      months: plan.durationMonths,
      startDate,
      endDate,
      createdAt: new Date(),
      createdBy: employeeUid
    });

    await this.usersService.updateUser(user.uid, {
      membershipStatus: 'active',
      membershipStart: startDate,
      membershipEnd: endDate
    });

    await this.loadUsers();
  }
  getPlanName(planId: string): string {
    const plan = this.plans?.find(p => p.id === planId);
    return plan ? plan.name : 'Sin plan';
  }
  async viewPayments(user: any) {
    console.log('Ver historial de:', user.name);

    // Si ya tienes modal de pagos en admin,
    // aquí después lo conectamos.
  }
}