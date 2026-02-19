import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Auth } from '@angular/fire/auth';
import { UsersService } from '../../../core/services/users.service';
import { OnInit } from '@angular/core';
import { UserSessionService } from '../../../core/services/user-session.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { PlansService } from '../../../core/services/plans.service';
import { RoutinesService } from '../../../core/services/routines.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  role: string | null = null;
  userData: any = null;
  lastPayment: any = null;
  daysRemaining: number = 0;
  loading = true;
  plans: any[] = [];
  activeRoutine: any = null;
  routineDays: any[] = [];
  loadingRoutine = true;
  constructor(
    private auth: Auth,
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router,
    private userSession: UserSessionService,
    private paymentsService: PaymentsService,
    private plansService: PlansService,
    private routinesService: RoutinesService,
  ) { }

  async ngOnInit() {

    const currentUser = this.auth.currentUser;
    if (!currentUser) return;

    // =============================
    // 👤 DATOS DEL USUARIO
    // =============================
    this.userData =
      await this.usersService.getUserById(currentUser.uid);

    // =============================
    // 💳 ÚLTIMO PAGO
    // =============================
    this.lastPayment =
      await this.paymentsService.getLastPayment(currentUser.uid);

    // =============================
    // 📦 PLANES
    // =============================
    this.plans =
      await this.plansService.getAllPlans();

    // =============================
    // 📅 DÍAS RESTANTES MEMBRESÍA
    // =============================
    if (this.userData?.membershipEnd) {

      const endDate = this.userData.membershipEnd.toDate
        ? this.userData.membershipEnd.toDate()
        : new Date(this.userData.membershipEnd);

      const today = new Date();
      const diff = endDate.getTime() - today.getTime();

      this.daysRemaining =
        Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    // =============================
    // 💪 RUTINA ACTIVA
    // =============================
    this.activeRoutine =
      await this.routinesService.getActiveRoutineForUser(
        currentUser.uid
      );

    if (this.activeRoutine) {

      this.routineDays =
        await this.routinesService.getRoutineDaysByRoutineId(
          this.activeRoutine.routineId
        );

    }

  }

  getPlanName(planId: string) {
    const plan = this.plans.find(p => p.id === planId);
    return plan ? plan.name : '';
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }
}
