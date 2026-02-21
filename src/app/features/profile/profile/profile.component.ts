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
import { collection, getDocs, query, where } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';


interface GalleryPhoto {
  id: string;
  imageUrl: string;
  likes?: string[];
  comments?: any[];
  loaded?: boolean;
}
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
  private firestore = inject(Firestore);

  userData: any = null;
  loading = true;
  uploadingPhoto = false;
  uploadingCover = false;
  gallery: GalleryPhoto[] = [];
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
  currentUserId!: string;
  newCommentText: { [photoId: string]: string } = {};
  currentUserData: any = null;
  totalWorkouts = 0;
  monthlyWorkouts = 0;
  weeklyStats: { label: string; count: number }[] = [];
  maxWeeklyCount = 1;
  editingNickname = false;
  newNickname = '';

  async ngOnInit() {
    const routeUid = this.route.snapshot.paramMap.get('uid');
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      const currentSnap = await this.usersService.getUser(currentUser.uid);
      if (currentSnap.exists()) {
        this.currentUserData = currentSnap.data();


      }
    }
    if (!currentUser) {
      this.loading = false;
      return;
    }
    // 🔥 ASIGNAR SIEMPRE
    this.currentUserId = currentUser.uid;

    // 🔥 CASO 1
    if (routeUid) {
      this.isOwner = currentUser.uid === routeUid;
      this.isFromCommunity = !this.isOwner;
      const snap = await this.usersService.getUser(routeUid);
      if (snap.exists()) {
        this.userData = snap.data();
        this.userData.uid = routeUid;
        this.newBio = this.userData.bio || '';
        this.selectedGender = this.userData.gender || '';
        this.emergencyName = this.userData.emergencyContact?.name || '';
        this.emergencyPhone = this.userData.emergencyContact?.phone || '';
        this.newNickname = this.userData.nickname || '';
        await this.loadGallery();
        await this.loadWorkoutStats(this.userData.uid);
        await this.loadWeeklyStats(this.userData.uid);
      }
      this.loading = false;
      return;
    }
    // 🔥 CASO 2
    this.isOwner = true;

    const snap = await this.usersService.getUser(currentUser.uid);

    if (snap.exists()) {
      this.userData = snap.data();
      this.userData.uid = currentUser.uid;
      this.newBio = this.userData.bio || '';
      this.selectedGender = this.userData.gender || '';
      this.emergencyName = this.userData.emergencyContact?.name || '';
      this.emergencyPhone = this.userData.emergencyContact?.phone || '';
      await this.loadGallery();
    }
    this.loading = false;
    await this.loadWorkoutStats(this.userData.uid);
    await this.loadWeeklyStats(this.userData.uid);
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

  async saveNickname() {

    if (!this.userData) return;

    const cleanNickname = this.newNickname.trim();

    if (cleanNickname.length < 3) {
      alert('El nickname debe tener al menos 3 caracteres');
      return;
    }

    await this.usersService.updateUser(this.userData.uid, {
      nickname: cleanNickname
    });

    this.userData.nickname = cleanNickname;
    this.editingNickname = false;
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

    this.gallery = (await this.galleryService.getGallery(
      this.userData.uid
    )) as GalleryPhoto[];
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
  async toggleLike(photo: any) {

    console.log("CLICK LIKE", photo);

    if (!this.currentUserId) {
      console.log("NO USER ID");
      return;
    }

    const updatedLikes = await this.galleryService.toggleLike(
      this.userData.uid,
      photo,
      this.currentUserId
    );

    console.log("UPDATED LIKES", updatedLikes);

    photo.likes = updatedLikes;
  }
  hasLiked(photo: any): boolean {
    return photo.likes?.includes(this.currentUserId);
  }
  async addComment(photo: any) {

    const text = this.newCommentText[photo.id];
    if (!text?.trim()) return;

    const commentData = {
      uid: this.currentUserId,
      name: this.currentUserData?.name || 'Usuario',
      photoURL: this.currentUserData?.photoURL || '',
      text: text.trim(),
      createdAt: new Date()
    };

    const updated = await this.galleryService.addComment(
      this.userData.uid,
      photo,
      commentData
    );

    photo.comments = updated;
    this.newCommentText[photo.id] = '';
  }

  async loadWorkoutStats(userId: string) {

    const workoutsRef = collection(this.firestore, 'workoutHistory');

    const q = query(
      workoutsRef,
      where('userId', '==', userId)
    );

    const snap = await getDocs(q);

    this.totalWorkouts = snap.size;

    // 🔥 Calcular entrenamientos del mes actual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    this.monthlyWorkouts = 0;

    snap.forEach(doc => {
      const data: any = doc.data();

      if (!data.completedAt) return;

      const completedDate = data.completedAt.toDate
        ? data.completedAt.toDate()
        : new Date(data.completedAt);

      if (completedDate >= firstDayOfMonth) {
        this.monthlyWorkouts++;
      }
    });
  }

  async loadWeeklyStats(userId: string) {
    console.log("Cargando weekly stats para:", userId);
    const workoutsRef = collection(this.firestore, 'workoutHistory');

    const q = query(
      workoutsRef,
      where('userId', '==', userId)
    );

    const snap = await getDocs(q);

    const today = new Date();
    const days: { date: Date; label: string; count: number }[] = [];

    const labels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - i
      );

      days.push({
        date,
        label: labels[date.getDay()],
        count: 0
      });
    }

    snap.forEach(doc => {
      const data: any = doc.data();
      const completedDate = data.completedAt.toDate();

      days.forEach(day => {
        if (
          completedDate.getFullYear() === day.date.getFullYear() &&
          completedDate.getMonth() === day.date.getMonth() &&
          completedDate.getDate() === day.date.getDate()
        ) {
          day.count++;
        }
      });
    });

    this.weeklyStats = days.map(d => ({
      label: d.label,
      count: d.count
    }));

    this.maxWeeklyCount = Math.max(
      ...this.weeklyStats.map(d => d.count),
      1
    );
    console.log("Resultado semanal:", this.weeklyStats);
  }
  canDeleteComment(comment: any): boolean {

    const isCommentOwner = comment.uid === this.currentUserId;
    const isPhotoOwner = this.isOwner;

    return isCommentOwner || isPhotoOwner;
  }
  async deleteComment(photoId: string, commentId: string) {
    console.log("Eliminar:", photoId, commentId);
    const confirmed = confirm('¿Eliminar comentario?');
    if (!confirmed) return;

    try {

      await this.galleryService.deleteComment(
        this.userData.uid,
        photoId,
        commentId
      );

      // 🔥 recargar comentarios
      await this.loadGallery();

    } catch (error) {
      console.error('Error eliminando comentario:', error);
    }
  }
}