import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, collection, addDoc, getDocs, updateDoc, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, getStorage } from '@angular/fire/storage';
@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(
    private firestore: Firestore,
    private injector: Injector,
    private storage: Storage
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
  // 🔥 actualizar foto de perfil
  async uploadProfilePhoto(uid: string, file: File) {

    return runInInjectionContext(this.injector, async () => {

      const filePath = `profile-photos/${uid}/profile.jpg`;

      const storageRef = ref(this.storage, filePath);

      // ⬆ subir imagen
      await uploadBytes(storageRef, file);

      // 🔗 obtener URL
      const downloadURL = await getDownloadURL(storageRef);

      // 💾 guardar URL en Firestore
      await this.updateUser(uid, {
        photoURL: downloadURL
      });

      return downloadURL;
    });
  }

  // 🔴 activar / desactivar
  toggleStatus(uid: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    return this.updateUser(uid, { status: newStatus });
  }

  // 🚪 forzar logout
  forceLogout(uid: string) {
    return this.updateUser(uid, { forceLogout: true });
  }

  async getPublicProfiles() {
    const usersRef = collection(this.firestore, 'users');

    const q = query(usersRef, where('isPublic', '==', true));

    const snap = await getDocs(q);

    return snap.docs.map(doc => doc.data());
  }

  async activateMembership(uid: string, months: number) {

    const startDate = new Date();

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    await this.updateUser(uid, {
      membershipStatus: 'active',
      membershipStart: startDate,
      membershipEnd: endDate
    });

  }

  async getFinancialStats() {
    return runInInjectionContext(this.injector, async () => {

      const paymentsRef = collection(this.firestore, 'payments');
      const paymentsSnap = await getDocs(paymentsRef);

      const usersSnap = await getDocs(collection(this.firestore, 'users'));

      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      let monthlyIncome = 0;
      let monthlyPayments = 0;
      let activeMembers = 0;
      let expiredMembers = 0;
      let upcomingExpirations = 0;

      // 🔥 pagos
      paymentsSnap.forEach(doc => {
        const data: any = doc.data();
        const createdAt = data.createdAt?.toDate?.() ?? new Date(data.createdAt);

        if (createdAt >= firstDayOfMonth) {
          monthlyIncome += data.amount;
          monthlyPayments++;
        }
      });

      // 🔥 usuarios
      usersSnap.forEach(doc => {
        const data: any = doc.data();

        if (data.membershipStatus === 'active') {
          activeMembers++;

          if (data.membershipEnd) {

            const endDate = data.membershipEnd.toDate
              ? data.membershipEnd.toDate()
              : new Date(data.membershipEnd);

            const today = new Date();

            const diffDays =
              (endDate.getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24);

            if (diffDays <= 7 && diffDays > 0) {
              upcomingExpirations++;
            }
          }

        } else if (data.membershipStatus === 'expired') {
          expiredMembers++;
        }
      });

      return {
        monthlyIncome,
        monthlyPayments,
        activeMembers,
        expiredMembers,
        upcomingExpirations
      };

    });
  }

  async getUsersByMembershipStatus(status: string) {

    const usersRef = collection(this.firestore, 'users');

    const q = query(usersRef, where('membershipStatus', '==', status));

    const snap = await getDocs(q);

    return snap.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
  }

  async getUsersExpiringSoon() {

    const usersRef = collection(this.firestore, 'users');
    const snap = await getDocs(usersRef);

    const today = new Date();

    return snap.docs
      .map(doc => ({ uid: doc.id, ...doc.data() }))
      .filter((u: any) => {

        if (!u.membershipEnd || u.membershipStatus !== 'active') return false;

        const endDate = u.membershipEnd?.toDate?.() ?? new Date(u.membershipEnd);

        const diffDays =
          (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

        return diffDays <= 7 && diffDays > 0;
      });
  }


  // 🔥 Asignar plan
  async assignPlanToUser(uid: string, planId: string) {
    return this.updateUser(uid, {
      planId
    });
  }




}