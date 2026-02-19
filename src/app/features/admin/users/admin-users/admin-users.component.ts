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
import { PlansService } from '../../../../core/services/plans.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, MatSelectModule } from '@angular/material/select';
import { PaymentsService } from '../../../../core/services/payments.service';
import { AssignedRoutinesService } from '../../../../core/services/assigned-routines.service';
import { RoutinesService } from '../../../../core/services/routines.service';
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    FormsModule,
    MatFormFieldModule,
    MatOption,
    MatSelectModule
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
  plans: any[] = [];
  routines: any[] = [];

  constructor(
    private usersService: UsersService,
    private plansService: PlansService,
    private routinesService: RoutinesService,
    private assignedRoutinesService: AssignedRoutinesService,
    private authService: AuthService,
    private auth: Auth,
    private dialog: MatDialog,
    private paymentsService: PaymentsService,
  ) { }

  async ngOnInit() {
    await this.loadUsers();
    this.plans = await this.plansService.getAllPlans();
    this.routines = await this.routinesService.getAllRoutines();

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
    // 🔥 Guardar tab actual
    const currentTab = this.activeTabIndex;
    await this.usersService.updateUser(uid, { role });
    await this.loadUsers();
    // 🔥 Restaurar tab
    this.activeTabIndex = currentTab;
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


  async registerPayment(user: any) {

    if (!user.planId) {
      alert('Primero debes asignar un plan');
      return;
    }

    const plan = this.plans.find(p => p.id === user.planId);
    if (!plan) return;

    const adminUid = this.auth.currentUser?.uid;
    if (!adminUid) return;

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
      createdBy: adminUid
    });

    await this.usersService.updateUser(user.uid, {
      membershipStatus: 'active',
      membershipStart: startDate,
      membershipEnd: endDate
    });

    await this.loadUsers();
  }

  // ✅ ÚNICO MÉTODO CORRECTO
  viewPayments(user: any) {
    this.dialog.open(PaymentHistoryModalComponent, {
      data: {
        uid: user.uid,
        name: user.name,
        lastNameFather: user.lastNameFather,
        lastNameMother: user.lastNameMother
      },
      width: '650px'
    });
  }

  async toggleDetails(uid: string) {

    if (this.expandedUserId === uid) {
      this.expandedUserId = null;
      return;
    }

    this.expandedUserId = uid;

    const user = this.users.find(u => u.uid === uid);

    if (user) {
      await this.loadLastPayment(user);
    }
  }

  getFilteredUsers(list: any[]) {

    if (!this.searchTerm) return list;

    const term = this.searchTerm.toLowerCase();

    return list.filter(user => {

      const fullName =
        (user.name || '') + ' ' +
        (user.lastNameFather || '') + ' ' +
        (user.lastNameMother || '');

      return (
        fullName.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );

    });
  }


  getPlanName(planId: string | undefined): string {

    if (!planId) return '';

    const plan = this.plans.find(p => p.id === planId);

    return plan ? plan.name : '';

  }
  async assignPlan(user: any) {

    if (!user.selectedPlan) return;
    const currentTab = this.activeTabIndex; // 🔥 GUARDAR TAB ACTUAL
    await this.usersService.assignPlanToUser(
      user.uid,
      user.selectedPlan
    );

    user.planId = user.selectedPlan;
    user.selectedPlan = null;

    await this.loadUsers();
    this.activeTabIndex = currentTab; // 🔥 RESTAURA TAB
  }

  async loadPlans() {
    this.plans = await this.plansService.getAllPlans();
  }

  async loadLastPayment(user: any) {

    console.log('🔎 Buscando último pago para:', user.uid);

    const lastPayment =
      await this.paymentsService.getLastPayment(user.uid);

    console.log('💰 Último pago recibido:', lastPayment);

    if (lastPayment) {
      user.lastPaymentAmount = lastPayment['amount'];
      console.log('✅ Monto asignado al user:', user.lastPaymentAmount);
    } else {
      user.lastPaymentAmount = null;
      console.log('⚠️ No se encontró pago');
    }

  }
  async assignRoutine(user: any) {

    if (!user.selectedRoutine) return;

    const routine = this.routines.find(r => r.id === user.selectedRoutine);
    if (!routine) return;

    const adminUid = this.auth.currentUser?.uid;
    if (!adminUid) return;

    const startDate = new Date();
    const endDate = new Date();

    if (routine.durationType === 'weeks') {
      endDate.setDate(endDate.getDate() + (routine.durationValue * 7));
    } else {
      endDate.setMonth(endDate.getMonth() + routine.durationValue);
    }

    await this.assignedRoutinesService.assignRoutine({
      userId: user.uid,
      routineId: routine.id,
      startDate,
      endDate,
      assignedBy: adminUid
    });

    user.selectedRoutine = null;

    alert('Rutina asignada correctamente');
  }

}