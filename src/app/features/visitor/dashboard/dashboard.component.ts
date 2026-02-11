import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { UsersService } from '../../../core/services/users.service';
import { OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
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

    this.role = await this.usersService.getUserRole(user.uid);
    console.log('ROLE UI:', this.role);
    if (this.role) {
      this.userSession.setRole(this.role); // 👈 CLAVE
    }
  }
  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }

}
