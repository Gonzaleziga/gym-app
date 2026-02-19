import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class RoutineDaysService {

  private injector = inject(Injector);

  constructor(private firestore: Firestore) { }

  // ================================
  // CREAR DÍA
  // ================================
  async addRoutineDay(data: any) {

    return runInInjectionContext(this.injector, async () => {

      const ref = collection(this.firestore, 'routineDays');
      await addDoc(ref, data);

    });

  }

  // ================================
  // OBTENER DÍAS POR RUTINA
  // ================================
  async getRoutineDays(routineId: string) {

    return runInInjectionContext(this.injector, async () => {

      const q = query(
        collection(this.firestore, 'routineDays'),
        where('routineId', '==', routineId)
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    });

  }

  // ================================
  // ELIMINAR DÍA
  // ================================
  async deleteRoutineDay(dayId: string) {

    return runInInjectionContext(this.injector, async () => {

      await deleteDoc(
        doc(this.firestore, 'routineDays', dayId)
      );

    });

  }

  // ================================
  // ACTUALIZAR DÍA
  // ================================
  async updateRoutineDay(dayId: string, data: any) {

    return runInInjectionContext(this.injector, async () => {

      const dayRef = doc(this.firestore, 'routineDays', dayId);
      await updateDoc(dayRef, data);

    });

  }

}