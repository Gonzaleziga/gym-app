import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, collection, getDocs, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(
    private firestore: Firestore,
    private injector: Injector
  ) { }

  getUser(uid: string) {
    return runInInjectionContext(this.injector, () =>
      getDoc(doc(this.firestore, 'users', uid))
    );
  }

  async getUserRole(uid: string): Promise<string | null> {
    const snap = await this.getUser(uid);

    if (!snap.exists()) return null;

    return snap.data()?.['role'] ?? null;
  }


  createUser(uid: string, data: any) {
    return runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, 'users', uid);
      return setDoc(ref, data);
    });
  }

  // 🔥 Obtener todos los usuarios
  getAllUsers() {
    return runInInjectionContext(this.injector, async () => {
      const ref = collection(this.firestore, 'users');
      const snap = await getDocs(ref);

      return snap.docs.map(d => ({
        uid: d.id,
        ...d.data()
      }));
    });
  }


  // 🔥 actualizar usuario
  updateUser(uid: string, data: any) {
    return runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, 'users', uid);
      return updateDoc(ref, data);
    });
  }

  // 🔴 activar / desactivar
  toggleStatus(uid: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    return this.updateUser(uid, { status: newStatus });
  }

  // 🚪 forzar logout
  forceLogout(uid: string) {
    return this.updateUser(uid, { forceLogout: true });
  }
}