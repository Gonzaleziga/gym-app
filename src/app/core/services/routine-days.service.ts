import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class RoutineDaysService {

  constructor(private firestore: Firestore) { }

  async addRoutineDay(data: any) {
    const ref = collection(this.firestore, 'routineDays');
    await addDoc(ref, data);
  }

  async getRoutineDays(routineId: string) {
    const ref = collection(this.firestore, 'routineDays');

    const q = query(ref, where('routineId', '==', routineId));

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
  async deleteRoutineDay(dayId: string) {

    await deleteDoc(
      doc(this.firestore, 'routineDays', dayId)
    );

  }
  async updateRoutineDay(dayId: string, data: any) {

    const dayRef = doc(this.firestore, 'routineDays', dayId);

    await updateDoc(dayRef, data);
  }
}