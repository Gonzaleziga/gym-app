import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { UsersService } from '../../../core/services/users.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  private auth = inject(Auth);
  private usersService = inject(UsersService);

  userData: any = null;
  loading = true;

  async ngOnInit() {
    const currentUser = this.auth.currentUser;

    if (!currentUser) return;

    const snap = await this.usersService.getUser(currentUser.uid);

    if (snap.exists()) {
      this.userData = snap.data();
      this.userData.uid = currentUser.uid; // 🔥 importante
      console.log('👤 PROFILE DATA:', this.userData);
    }

    this.loading = false;
  }

  async togglePublicProfile() {
    if (!this.userData) return;

    const newValue = !this.userData.isPublic;

    await this.usersService.updateUser(this.userData.uid, {
      isPublic: newValue
    });

    this.userData.isPublic = newValue;
  }
}