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

    if (!currentUser) {
      this.loading = false;
      return;
    }

    try {
      const snap = await this.usersService.getUser(currentUser.uid);

      if (snap.exists()) {
        this.userData = snap.data();
        this.userData.uid = currentUser.uid;
      }
    } catch (error) {
      console.error('❌ Error cargando perfil:', error);
    }

    this.loading = false;
  }

  // 🔥 SUBIR FOTO
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;
    if (!this.userData) return;

    const file = input.files[0];

    try {
      this.loading = true;

      const imageUrl = await this.usersService.uploadProfilePhoto(
        this.userData.uid,
        file
      );

      // 🔥 actualizar Firestore también
      await this.usersService.updateUser(this.userData.uid, {
        photoURL: imageUrl
      });

      // 🔥 actualizar vista
      this.userData.photoURL = imageUrl;

      console.log('✅ FOTO ACTUALIZADA CORRECTAMENTE');

    } catch (error) {
      console.error('❌ ERROR SUBIENDO FOTO:', error);
    } finally {
      this.loading = false;
    }
  }

  // 🔥 PERFIL PÚBLICO / PRIVADO
  async togglePublicProfile() {
    if (!this.userData) return;

    const newValue = !this.userData.isPublic;

    try {
      await this.usersService.updateUser(this.userData.uid, {
        isPublic: newValue
      });

      this.userData.isPublic = newValue;

    } catch (error) {
      console.error('❌ Error actualizando visibilidad:', error);
    }
  }
}