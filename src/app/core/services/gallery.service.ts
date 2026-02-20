import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private injector = inject(Injector);

  // ===============================
  // 🔥 SUBIR FOTO A GALERÍA
  // ===============================

  async uploadPhoto(uid: string, file: File, caption: string = '') {

    return runInInjectionContext(this.injector, async () => {

      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten imágenes');
      }

      const resizedFile = await this.resizeImage(file, 1000);

      const photoId = crypto.randomUUID();
      const filePath = `gallery/${uid}/${photoId}.jpg`;

      const storageRef = ref(this.storage, filePath);

      await uploadBytes(storageRef, resizedFile);

      const downloadURL = await getDownloadURL(storageRef);

      const galleryRef = collection(
        this.firestore,
        `users/${uid}/gallery`
      );

      await addDoc(galleryRef, {
        photoId,
        imageUrl: downloadURL,
        caption,
        createdAt: new Date(),
        isPublic: true
      });

      return downloadURL;
    });
  }

  // ===============================
  // 📸 OBTENER GALERÍA
  // ===============================

  async getGallery(uid: string) {

    return runInInjectionContext(this.injector, async () => {

      const galleryRef = collection(
        this.firestore,
        `users/${uid}/gallery`
      );

      const q = query(galleryRef, orderBy('createdAt', 'desc'));

      const snap = await getDocs(q);

      return snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

    });
  }

  // ===============================
  // 🗑 ELIMINAR FOTO
  // ===============================

  async deletePhoto(uid: string, photo: any) {

    return runInInjectionContext(this.injector, async () => {

      // eliminar de storage
      const filePath = `gallery/${uid}/${photo.photoId}.jpg`;
      const storageRef = ref(this.storage, filePath);

      await deleteObject(storageRef);

      // eliminar documento
      await deleteDoc(
        doc(this.firestore, `users/${uid}/gallery/${photo.id}`)
      );

    });
  }

  // ===============================
  // 🔧 REDIMENSIONAR IMAGEN
  // ===============================

  private resizeImage(file: File, maxWidth: number): Promise<File> {

    return new Promise((resolve) => {

      const reader = new FileReader();

      reader.onload = (event: any) => {

        const img = new Image();

        img.onload = () => {

          const canvas = document.createElement('canvas');
          const scale = maxWidth / img.width;

          canvas.width = maxWidth;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, {
                type: 'image/jpeg'
              }));
            }
          }, 'image/jpeg', 0.8);

        };

        img.src = event.target.result;
      };

      reader.readAsDataURL(file);
    });
  }
  async toggleLike(uid: string, photo: any, currentUserId: string) {

    return runInInjectionContext(this.injector, async () => {

      const photoRef = doc(
        this.firestore,
        `users/${uid}/gallery/${photo.id}`
      );

      const likes: string[] = photo.likes || [];

      let updatedLikes;

      if (likes.includes(currentUserId)) {
        // 🔥 quitar like
        updatedLikes = likes.filter(id => id !== currentUserId);
      } else {
        // 🔥 agregar like
        updatedLikes = [...likes, currentUserId];
      }

      await updateDoc(photoRef, {
        likes: updatedLikes
      });

      return updatedLikes;
    });
  }

  async addComment(ownerUid: string, photo: any, commentData: any) {

    return runInInjectionContext(this.injector, async () => {

      const updatedComments = photo.comments
        ? [...photo.comments, commentData]
        : [commentData];

      await updateDoc(
        doc(this.firestore, `users/${ownerUid}/gallery/${photo.id}`),
        { comments: updatedComments }
      );

      return updatedComments;
    });
  }

}