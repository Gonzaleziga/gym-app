import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ExerciseLogsService {

  constructor(private firestore: Firestore) { }

  async logWeight(data: {
    userId: string;
    routineId: string;
    routineDayId: string;
    exerciseId: string;
    exerciseName: string;
    weight: number;
  }) {

    const ref = collection(this.firestore, 'exerciseLogs');

    await addDoc(ref, {
      ...data,
      createdAt: new Date()
    });
  }

  async getExerciseHistory(userId: string, exerciseName: string) {

    const ref = collection(this.firestore, 'exerciseLogs');

    const q = query(
      ref,
      where('userId', '==', userId),
      where('exerciseName', '==', exerciseName)
    );

    const snap = await getDocs(q);

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async getLastWeight(userId: string, exerciseId: string) {

    const ref = collection(this.firestore, 'exerciseLogs');

    const q = query(
      ref,
      where('userId', '==', userId),
      where('exerciseId', '==', exerciseId)
    );

    const snap = await getDocs(q);

    if (snap.empty) return null;

    const logs: any[] = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 🔥 ORDENAR POR createdAt (no date)
    logs.sort((a: any, b: any) => {

      const dateA = a.createdAt?.toDate?.() ?? new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() ?? new Date(b.createdAt);

      return dateB.getTime() - dateA.getTime();
    });

    return logs[0]?.weight ?? null;
  }
}