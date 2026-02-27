import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { UsersService } from '../../../core/services/users.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { RoutinesService } from '../../../core/services/routines.service';

@Component({
  selector: 'app-employee-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './employee-users.component.html',
  styleUrl: './employee-users.component.scss'
})
export class EmployeeUsersComponent implements OnInit {

  loading = true;

  clients: any[] = [];
  visitors: any[] = [];
  routines: any[] = [];

  activeTabIndex = 0;
  expandedUserId: string | null = null;
  searchTerm = '';

  plans: any[] = []; // si luego cargas planes

  constructor(
    private usersService: UsersService,
    private paymentsService: PaymentsService,
    private routinesService: RoutinesService,
    private auth: Auth
  ) { }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {

    this.loading = true;

    const allUsers = await this.usersService.getAllUsers();

    this.clients = allUsers.filter((u: any) => u.role === 'client');
    this.visitors = allUsers.filter((u: any) => u.role === 'visitor');

    // 🔥 Rutinas activas creadas en admin
    this.routines = await this.routinesService.getActiveRoutines();

    this.loading = false;
  }

  // ==============================
  // 🔽 UI Helpers
  // ==============================

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

  // ==============================
  // 💪 RUTINAS
  // ==============================

  async assignRoutine(user: any) {

    if (!user.selectedRoutine) return;

    await this.usersService.updateUser(user.uid, {
      assignedRoutineId: user.selectedRoutine
    });

    alert('Rutina asignada correctamente');
  }

  // ==============================
  // 💳 PLANES
  // ==============================

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

    await this.loadData();
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

    await this.loadData();
  }

  getPlanName(planId: string): string {
    const plan = this.plans?.find(p => p.id === planId);
    return plan ? plan.name : 'Sin plan';
  }

  async viewPayments(user: any) {
    console.log('Ver historial de:', user.name);
  }

  // ==============================
  // 🔄 VISITOR → CLIENT
  // ==============================

  async convertToClient(user: any) {

    await this.usersService.updateUser(user.uid, {
      role: 'client',
      membershipStatus: 'none'
    });

    await this.loadData();
  }
}