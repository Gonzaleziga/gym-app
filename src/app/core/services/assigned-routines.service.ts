import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AssignedRoutinesService {

  constructor(private firestore: Firestore) { }

  // 🔹 Asignar rutina
  async assignRoutine(data: {
    userId: string;
    routineId: string;
    startDate: Date;
    endDate: Date;
    assignedBy: string;
  }) {

    const ref = collection(this.firestore, 'assignedRoutines');

    await addDoc(ref, {
      ...data,
      status: 'active',
      createdAt: new Date()
    });
  }

  // 🔹 Obtener rutina activa del cliente
  async getActiveRoutine(userId: string) {

    const ref = collection(this.firestore, 'assignedRoutines');

    const q = query(
      ref,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );

    const snap = await getDocs(q);

    if (snap.empty) return null;

    const today = new Date();

    const activeRoutine = snap.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .find((r: any) => {

        const endDate = r.endDate?.toDate
          ? r.endDate.toDate()
          : new Date(r.endDate);

        return endDate >= today;
      });

    return activeRoutine || null;
  }

  // 🔹 Finalizar rutina
  async completeRoutine(id: string) {
    await updateDoc(
      doc(this.firestore, 'assignedRoutines', id),
      { status: 'completed' }
    );
  }

  // 🔥 Desactivar rutina activa anterior
  async deactivateCurrentRoutine(userId: string) {

    const ref = collection(this.firestore, 'assignedRoutines');

    const q = query(
      ref,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );

    const snap = await getDocs(q);

    for (const docSnap of snap.docs) {
      await updateDoc(doc(this.firestore, 'assignedRoutines', docSnap.id), {
        status: 'completed'
      });
    }
  }

  async getActiveAssignmentsByEmployee(employeeUid: string) {

    const ref = collection(this.firestore, 'assignedRoutines');

    const q = query(
      ref,
      where('status', '==', 'active'),
      where('assignedBy', '==', employeeUid)
    );

    const snap = await getDocs(q);

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

}