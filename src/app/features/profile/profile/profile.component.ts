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
import { GalleryService } from '../../../core/services/gallery.service';
import { ViewChild, ElementRef } from '@angular/core';
import { GalleryPreviewComponent } from '../../shared/gallery-preview/gallery-preview.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,

  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  @ViewChild('galleryInput') galleryInputRef!: ElementRef<HTMLInputElement>;
  private auth = inject(Auth);
  private usersService = inject(UsersService);
  private dialog = inject(MatDialog);
  private galleryService = inject(GalleryService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  userData: any = null;
  loading = true;
  uploadingPhoto = false;
  uploadingCover = false;
  gallery: any[] = [];
  uploadingGallery = false;
  isOwner = false;
  photoToReplace: any = null;
  editingBio = false;
  newBio = '';
  isFromCommunity = false;
  editingExtraInfo = false;
  selectedGender = '';
  emergencyName = '';
  emergencyPhone = '';

  async ngOnInit() {

    const routeUid = this.route.snapshot.paramMap.get('uid');
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      this.loading = false;
      return;
    }

    // 🔥 CASO 1: Perfil desde comunidad (/profile/:uid)
    if (routeUid) {

      this.isOwner = currentUser.uid === routeUid;
      this.isFromCommunity = !this.isOwner;

      const snap = await this.usersService.getUser(routeUid);

      if (snap.exists()) {

        this.userData = snap.data();
        this.userData.uid = routeUid;

        // 🔥 BIO
        this.newBio = this.userData.bio || '';

        // 🔥 GÉNERO
        this.selectedGender = this.userData.gender || '';

        // 🔥 CONTACTO EMERGENCIA
        this.emergencyName = this.userData.emergencyContact?.name || '';
        this.emergencyPhone = this.userData.emergencyContact?.phone || '';

        await this.loadGallery();
      }

      this.loading = false;
      return;
    }

    // 🔥 CASO 2: Mi perfil (/profile)
    this.isOwner = true;

    const snap = await this.usersService.getUser(currentUser.uid);

    if (snap.exists()) {

      this.userData = snap.data();
      this.userData.uid = currentUser.uid;

      // 🔥 BIO
      this.newBio = this.userData.bio || '';

      // 🔥 GÉNERO
      this.selectedGender = this.userData.gender || '';

      // 🔥 CONTACTO EMERGENCIA
      this.emergencyName = this.userData.emergencyContact?.name || '';
      this.emergencyPhone = this.userData.emergencyContact?.phone || '';

      await this.loadGallery();
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

  async loadGallery() {

    if (!this.userData) return;

    this.gallery = await this.galleryService.getGallery(
      this.userData.uid
    );
  }

  async onGallerySelected(event: Event) {

    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    if (!this.userData) return;

    const file = input.files[0];

    try {

      this.uploadingGallery = true;

      // 🔄 CASO 1: Reemplazo específico
      if (this.photoToReplace) {

        await this.galleryService.deletePhoto(
          this.userData.uid,
          this.photoToReplace
        );

        this.photoToReplace = null;

      }
      // 🔥 CASO 2: Límite de 6 fotos
      else if (this.gallery.length >= 6) {

        const oldest = this.gallery[this.gallery.length - 1];

        await this.galleryService.deletePhoto(
          this.userData.uid,
          oldest
        );

        this.gallery = this.gallery.filter(p => p.id !== oldest.id);
      }

      // ⬆ Subir nueva foto
      await this.galleryService.uploadPhoto(
        this.userData.uid,
        file
      );

      // 🔄 Recargar galería
      await this.loadGallery();

    } catch (error) {
      console.error(error);
    } finally {
      this.uploadingGallery = false;
      input.value = ''; // 🔥 limpia el input para permitir subir misma imagen
    }
  }
  openGalleryInput() {
    if (this.galleryInputRef) {
      this.galleryInputRef.nativeElement.click();
    }
  }
  openGalleryPreview(imageUrl: string) {
    this.dialog.open(GalleryPreviewComponent, {
      data: { imageUrl },
      panelClass: 'gallery-dialog',
      maxWidth: '95vw'
    });
  }
  async deletePhoto(photo: any, event: Event) {

    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '350px',
      data: {
        title: 'Eliminar foto',
        message: '¿Estás seguro de que deseas eliminar esta foto?'
      }
    });

    const result = await dialogRef.afterClosed().toPromise();

    if (!result) return;

    try {

      this.uploadingGallery = true;

      await this.galleryService.deletePhoto(
        this.userData.uid,
        photo
      );

      this.gallery = this.gallery.filter(p => p.id !== photo.id);

    } catch (error) {
      console.error('Error eliminando foto:', error);
    } finally {
      this.uploadingGallery = false;
    }
  } async selectPhotoToReplace(photo: any, event: Event) {

    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '350px',
      data: {
        title: 'Reemplazar foto',
        message: '¿Deseas reemplazar esta foto por una nueva?'
      }
    });

    const result = await dialogRef.afterClosed().toPromise();

    if (!result) return;

    this.photoToReplace = photo;
    this.openGalleryInput();
  }



  async saveBio() {

    if (!this.userData) return;

    try {

      await this.usersService.updateUser(
        this.userData.uid,
        { bio: this.newBio }
      );

      this.userData.bio = this.newBio;
      this.editingBio = false;

    } catch (error) {
      console.error('Error guardando bio:', error);
    }
  }
  goBack() {
    this.location.back();
  }

  async saveExtraInfo() {

    if (!this.userData) return;

    try {

      await this.usersService.updateUser(this.userData.uid, {
        gender: this.selectedGender,
        emergencyContact: {
          name: this.emergencyName,
          phone: this.emergencyPhone
        }
      });

      // actualizar vista
      this.userData.gender = this.selectedGender;
      this.userData.emergencyContact = {
        name: this.emergencyName,
        phone: this.emergencyPhone
      };

      this.editingExtraInfo = false;

    } catch (error) {
      console.error('Error actualizando info extra', error);
    }
  }
}