import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, orderBy, limit } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  constructor(
    private firestore: Firestore,
    private injector: Injector
  ) { }

  // 🔹 Registrar pago
  async registerPayment(data: any) {
    return runInInjectionContext(this.injector, async () => {
      const paymentsRef = collection(this.firestore, 'payments');
      await addDoc(paymentsRef, data);
    });
  }

  // 🔹 Obtener pagos por usuario
  async getUserPayments(uid: string) {
    return runInInjectionContext(this.injector, async () => {

      const paymentsRef = collection(this.firestore, 'payments');

      const q = query(
        paymentsRef,
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      );

      const snap = await getDocs(q);

      return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });
  }

  // 🔹 Último pago
  async getLastPayment(uid: string) {

    const paymentsRef = collection(this.firestore, 'payments');

    const q = query(
      paymentsRef,
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const snap = await getDocs(q);

    if (snap.empty) return null;

    return snap.docs[0].data();
  }

  // 🔹 Pagos del mes (para dashboard)
  async getMonthlyPayments() {
    return runInInjectionContext(this.injector, async () => {

      const paymentsRef = collection(this.firestore, 'payments');
      const snap = await getDocs(paymentsRef);

      const today = new Date();
      const firstDayOfMonth =
        new Date(today.getFullYear(), today.getMonth(), 1);

      return snap.docs
        .map(doc => doc.data())
        .filter((p: any) => {
          const createdAt = p.createdAt?.toDate?.() ?? new Date(p.createdAt);
          return createdAt >= firstDayOfMonth;
        });
    });
  }

  async getAllPayments() {

    const paymentsRef = collection(this.firestore, 'payments');
    const snap = await getDocs(paymentsRef);

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  }
}