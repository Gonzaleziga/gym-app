import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { UsersService } from '../../../core/services/users.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButton, MatButtonModule, MatIconButton } from '@angular/material/button';
import { OnInit } from '@angular/core';
import { UserSessionService } from '../../../core/services/user-session.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButton, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  role: string | null = null;


  expiredMembersList: any[] = [];
  upcomingMembersList: any[] = [];
  selectedDetailType: 'expired' | 'upcoming' | null = null;

  detailList: any[] = [];
  // 🔥 CONTROL DEL MODAL
  showModal = false;
  userName: string | null = null;
  stats: any = null;

  constructor(
    private auth: Auth,
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router,
    private userSession: UserSessionService,


  ) { }

  async ngOnInit() {
    await this.loadMembershipStats();
    const user = this.auth.currentUser;
    if (!user) return;
    const snap = await this.usersService.getUser(user.uid);
    if (!snap.exists()) return;
    const data = snap.data();
    // 🔥 Guardamos rol
    this.role = data?.['role'] ?? null;
    console.log('ROLE UI:', this.role);
    if (this.role) {
      this.userSession.setRole(this.role);
    }
    const name = data?.['name'] ?? '';
    const lastNameFather = data?.['lastNameFather'] ?? '';
    const lastNameMother = data?.['lastNameMother'] ?? '';
    this.userName = `${name} ${lastNameFather} ${lastNameMother}`.trim();
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }
  async loadMembershipStats() {

    const alerts = await this.usersService.getMembershipAlerts();

    this.expiredMembersList = alerts.expired;
    this.upcomingMembersList = alerts.expiringSoon;

    this.stats = {
      expiredMembers: alerts.expired.length,
      upcomingExpirations: alerts.expiringSoon.length
    };
  }

  // 🔥 ABRIR MODAL
  async openDetails(type: 'expired' | 'upcoming') {

    this.selectedDetailType = type;
    this.showModal = true;
    this.detailList = [];

    const users = await this.usersService.getAllUsers(); // 🔥 ahora sí existe

    const today = new Date();

    if (type === 'expired') {

      this.detailList = users.filter((u: any) => {

        if (!u.membershipEnd) return false;

        const endDate =
          u.membershipEnd?.toDate?.() ?? new Date(u.membershipEnd);

        return endDate < today && u.membershipStatus === 'expired';

      });

    }

    if (type === 'upcoming') {

      this.detailList = users.filter((u: any) => {

        if (!u.membershipEnd) return false;

        const endDate =
          u.membershipEnd?.toDate?.() ?? new Date(u.membershipEnd);

        const diffDays =
          (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

        return diffDays <= 7 && diffDays > 0;

      });

    }

  }
  closeModal() {
    this.showModal = false;
    this.selectedDetailType = null;
  }

  goToUser(uid: string) {
    this.closeModal(); // opcional, cerrar modal
    this.router.navigate(['/employee/users'], {
      queryParams: {
        uid,
        tab: 'clients'
      }
    });
  }
}
