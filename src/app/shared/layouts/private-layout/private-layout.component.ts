import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { PrivateSidebarComponent } from '../../components/private-sidebar/private-sidebar.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { UsersService } from '../../../core/services/users.service';
import { UserSessionService } from '../../../core/services/user-session.service';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    RouterModule,
    PrivateSidebarComponent,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './private-layout.component.html',
  styleUrl: './private-layout.component.scss'
})
export class PrivateLayoutComponent implements OnInit {

  isMobile = signal(false);

  private breakpoint = inject(BreakpointObserver);
  private auth = inject(Auth);
  private usersService = inject(UsersService);
  private userSession = inject(UserSessionService);

  constructor() {
    this.breakpoint.observe(['(max-width: 1023px)'])
      .subscribe(result => {
        this.isMobile.set(result.matches);
      });
  }

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (!user) return;

    const role = await this.usersService.getUserRole(user.uid);

    if (role) {
      this.userSession.setRole(role);
    }
  }
}