import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { UsersService } from '../../../core/services/users.service';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './public-profile.component.html',
  styleUrl: './public-profile.component.scss'
})
export class PublicProfileComponent implements OnInit {
  private usersService = inject(UsersService);
  private router = inject(Router);
  private auth = inject(Auth);
  private dialog = inject(MatDialog);

  profiles: any[] = [];
  loading = true;
  currentUserData: any = null;
  isVisitor = false;

  async ngOnInit() {

    const currentUser = this.auth.currentUser;

    if (currentUser) {

      // 🔹 Obtener datos del usuario actual
      const snap = await this.usersService.getUser(currentUser.uid);

      if (snap.exists()) {
        this.currentUserData = snap.data();
        this.isVisitor = this.currentUserData?.role === 'visitor';
      }

      // 🔹 Obtener perfiles públicos
      const allProfiles = await this.usersService.getPublicProfiles();

      this.profiles = allProfiles.filter(
        profile => profile["uid"] !== currentUser.uid
      );
    }

    this.loading = false;
  }

  async goToProfile(user: any) {

    if (this.isVisitor) {

      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Acceso restringido',
          message: 'Debes ser cliente para ver perfiles de la comunidad.',
          confirmText: 'Entendido',
          hideCancel: true
        }
      });

      return;
    }

    this.router.navigate(['/profile', user.uid]);
  }
}
