import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc } from '@angular/fire/firestore';

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

}