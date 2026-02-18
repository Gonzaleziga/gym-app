import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class RoutineExercisesService {

  constructor(private firestore: Firestore) { }

  async addExerciseToDay(data: any) {
    return await addDoc(collection(this.firestore, 'routineExercises'), {
      ...data,
      createdAt: new Date()
    });
  }

  async getExercisesByDay(dayId: string) {

    const q = query(
      collection(this.firestore, 'routineExercises'),
      where('dayId', '==', dayId)
    );

    const snap = await getDocs(q);

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}