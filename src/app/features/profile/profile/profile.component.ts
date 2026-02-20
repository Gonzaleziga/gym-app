import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { UsersService } from '../../../core/services/users.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModalComponent }
  from '../../shared/confirm-modal/confirm-modal.component';



@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatProgressSpinnerModule,

  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  private auth = inject(Auth);
  private usersService = inject(UsersService);
  private dialog = inject(MatDialog);

  userData: any = null;
  loading = true;
  uploadingPhoto = false;
  uploadingCover = false;
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
  // 🔥 SUBIR FOTO
  async onFileSelected(event: Event) {

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    if (!this.userData) return;

    const file = input.files[0];

    try {

      this.uploadingPhoto = true; // 👈 ACTIVA SPINNER

      const imageUrl = await this.usersService.uploadProfilePhoto(
        this.userData.uid,
        file
      );

      this.userData.photoURL = imageUrl;

      console.log('✅ FOTO ACTUALIZADA CORRECTAMENTE');

    } catch (error) {
      console.error('❌ ERROR SUBIENDO FOTO:', error);
    } finally {

      this.uploadingPhoto = false; // 👈 APAGA SPINNER

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
  async onCoverSelected(event: Event) {

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    if (!this.userData) return;

    const file = input.files[0];

    try {

      this.uploadingCover = true; // 👈 ACTIVA SPINNER

      const imageUrl = await this.usersService.uploadCoverPhoto(
        this.userData.uid,
        file
      );

      this.userData.coverPhotoURL = imageUrl;

    } catch (error) {
      console.error('Error subiendo cover:', error);
    } finally {

      this.uploadingCover = false; // 👈 APAGA SPINNER

    }
  }

  async confirmChangeProfilePhoto(fileInput: HTMLInputElement) {

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '350px',
      data: {
        title: 'Cambiar Foto de Perfil',
        message: '¿Deseas cambiar tu foto de perfil?'
      }
    });

    const result = await dialogRef.afterClosed().toPromise();

    if (result) {
      fileInput.click();
    }
  }


  async confirmChangeCover(coverInput: HTMLInputElement) {

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '350px',
      data: {
        title: 'Cambiar Portada',
        message: '¿Deseas cambiar tu imagen de portada?'
      }
    });

    const result = await dialogRef.afterClosed().toPromise();

    if (result) {
      coverInput.click();
    }
  }

}