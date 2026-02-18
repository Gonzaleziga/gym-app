import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ExercisesService {

  constructor(private firestore: Firestore) { }

  // 🔥 Crear ejercicio
  async createExercise(data: any) {
    const ref = collection(this.firestore, 'exercises');
    return await addDoc(ref, data);
  }

  // 🔥 Obtener todos
  async getAllExercises() {
    const ref = collection(this.firestore, 'exercises');
    const snap = await getDocs(ref);

    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  }

  // 🔥 Activar / Desactivar
  async toggleExercise(id: string, currentStatus: boolean) {
    const ref = doc(this.firestore, 'exercises', id);
    return await updateDoc(ref, {
      isActive: !currentStatus
    });
  }

}