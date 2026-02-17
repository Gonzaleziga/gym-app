import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '@angular/fire/auth';
import { UsersService } from '../../../core/services/users.service';
import { UserSessionService } from '../../../core/services/user-session.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  role: string | null = null;
  userName: string | null = null;
  stats: any = null;

  // 🔥 CONTROL DEL MODAL
  showModal = false;
  selectedDetailType: string | null = null;
  detailList: any[] = [];
  // para mostrar el nombre completo en Dashboard


  constructor(
    private auth: Auth,
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router,
    private userSession: UserSessionService
  ) { }

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (!user) return;
    // 🔹 Traemos el documento completo
    const snap = await this.usersService.getUser(user.uid);
    if (!snap.exists()) return;
    const data = snap.data();
    // 🔹 Guardamos rol
    this.role = data?.['role'] ?? null;
    // 🔹 Nombre completo
    const name = data?.['name'] ?? '';
    const lastNameFather = data?.['lastNameFather'] ?? '';
    const lastNameMother = data?.['lastNameMother'] ?? '';
    this.userName = `${name} ${lastNameFather} ${lastNameMother}`.trim();
    // 🔥 SOLO ADMIN carga stats
    if (this.role === 'admin') {
      this.stats = await this.usersService.getFinancialStats();
      console.log('📊 STATS:', this.stats);
    }
  }
  // 🔥 ABRIR MODAL
  async openDetails(type: string) {

    this.selectedDetailType = type;
    this.showModal = true;
    this.detailList = [];

    const users = await this.usersService.getAllUsers();
    const payments = await this.usersService.getAllPayments(); // 👈 nuevo método

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    switch (type) {

      case 'income':

        this.detailList = payments
          .filter((p: any) => {
            const createdAt = p.createdAt?.toDate?.() ?? new Date(p.createdAt);
            return createdAt >= firstDayOfMonth;
          })
          .map((p: any) => ({
            ...p,
            showAsIncome: true
          }));

        break;

      case 'payments':

        this.detailList = payments.filter((p: any) => {
          const createdAt = p.createdAt?.toDate?.() ?? new Date(p.createdAt);
          return createdAt >= firstDayOfMonth;
        });

        break;

      case 'active':
        this.detailList = users.filter((u: any) =>
          u.membershipStatus === 'active'
        );
        break;

      case 'expired':
        this.detailList = users.filter((u: any) =>
          u.membershipStatus === 'expired'
        );
        break;

      case 'upcoming':
        this.detailList = users.filter((u: any) => {
          if (!u.membershipEnd) return false;

          const endDate = u.membershipEnd?.toDate?.() ?? new Date(u.membershipEnd);
          const diffDays = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

          return diffDays <= 7 && diffDays > 0;
        });
        break;
    }
  }

  // 🔥 CERRAR MODAL
  closeModal() {
    this.showModal = false;
    this.selectedDetailType = null;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }

}