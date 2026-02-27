import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, query, where, getDoc, orderBy } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class RoutinesService {

  private firestore = inject(Firestore);

  // 📥 Obtener todas las rutinas
  async getAllRoutines(): Promise<any[]> {

    const routinesRef = collection(this.firestore, 'routines');

    const snap = await getDocs(routinesRef);

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // ➕ Crear rutina
  async createRoutine(data: any) {

    const routinesRef = collection(this.firestore, 'routines');

    return await addDoc(routinesRef, data);
  }

  // 🔁 Activar / Desactivar rutina
  async toggleRoutine(id: string, currentStatus: boolean) {

    const routineDoc = doc(this.firestore, `routines/${id}`);

    await updateDoc(routineDoc, {
      isActive: !currentStatus
    });
  }

  async assignRoutine(data: {
    userId: string;
    routineId: string;
    startDate: Date;
    endDate: Date;
    assignedBy: string;
  }) {

    const assignedRef = collection(this.firestore, 'assignedRoutines');

    // 1️⃣ Desactivar rutina activa anterior
    const q = query(
      assignedRef,
      where('userId', '==', data.userId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      await updateDoc(doc(this.firestore, 'assignedRoutines', docSnap.id), {
        isActive: false
      });
    }

    // 2️⃣ Crear nueva rutina activa
    await addDoc(assignedRef, {
      ...data,
      isActive: true,
      createdAt: new Date()
    });
  }

  async getActiveRoutineForUser(userId: string) {

    const q = query(
      collection(this.firestore, 'assignedRoutines'),
      where('userId', '==', userId),
      where('status', '==', 'active')
    );

    const snap = await getDocs(q);

    if (snap.empty) return null;

    const assigned = {
      id: snap.docs[0].id,
      ...snap.docs[0].data()
    } as any;

    // 🔥 Traer datos completos de la rutina
    const routineDoc = await getDoc(
      doc(this.firestore, 'routines', assigned.routineId)
    );

    if (!routineDoc.exists()) return null;

    return {
      ...assigned,
      routineData: routineDoc.data()
    };
  }

  async getRoutineDaysByRoutineId(routineId: string) {

    const q = query(
      collection(this.firestore, 'routineDays'),
      where('routineId', '==', routineId),
      orderBy('dayNumber', 'asc') // 👈 AQUÍ
    );

    const snap = await getDocs(q);

    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  }
  async getRoutineById(routineId: string) {

    const routineRef = doc(this.firestore, 'routines', routineId);

    const snap = await getDoc(routineRef);

    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...snap.data()
    };
  }
  async getActiveRoutines() {

    const routines = await this.getAllRoutines();

    return routines.filter((r: any) => r.isActive);
  }

}