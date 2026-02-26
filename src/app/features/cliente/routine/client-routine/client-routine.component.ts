import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { ExercisesService } from '../../../../core/services/exercises.service';
import { AssignedRoutinesService } from '../../../../core/services/assigned-routines.service';
import { RoutinesService } from '../../../../core/services/routines.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { MatCardModule } from '@angular/material/card';
import { UsersService } from '../../../../core/services/users.service';
import { MatDialog } from '@angular/material/dialog';
import { ExercisePreviewComponent } from '../exercise-preview/exercise-preview.component';
import { MatIconModule } from '@angular/material/icon';
import { collection, query, where, getDocs, addDoc } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-client-routine',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './client-routine.component.html',
  styleUrl: './client-routine.component.scss'
})
export class ClientRoutineComponent implements OnInit {

  routine: any = null;
  routineDays: any[] = [];
  exercises: any[] = [];
  loading = true;
  instructorName: string = '';

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private exercisesService: ExercisesService,
    private assignedRoutinesService: AssignedRoutinesService,
    private routinesService: RoutinesService,
    private usersService: UsersService,
    private dialog: MatDialog
  ) { }

  async ngOnInit() {

    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      this.loading = false;
      return;
    }

    try {

      // 1️⃣ Catálogo ejercicios
      this.exercises = await this.exercisesService.getAllExercises();

      // 2️⃣ Rutina asignada
      const assigned: any =
        await this.assignedRoutinesService.getActiveRoutine(currentUser.uid);

      if (!assigned) {
        this.loading = false;
        return;
      }

      // 3️⃣ Documento rutina
      const routineSnap = await getDoc(
        doc(this.firestore, 'routines', assigned['routineId'])
      );

      if (!routineSnap.exists()) {
        this.loading = false;
        return;
      }

      this.routine = {
        id: routineSnap.id,
        ...(routineSnap.data() as any)
      };

      // 4️⃣ Instructor
      if (assigned['assignedBy']) {

        const instructor =
          await this.usersService.getUserById(assigned['assignedBy']);

        if (instructor) {
          this.instructorName =
            (instructor['name'] || '') + ' ' +
            (instructor['lastNameFather'] || '') + ' ' +
            (instructor['lastNameMother'] || '');
        }
      }

      // 5️⃣ Días ordenados
      const days: any[] =
        await this.routinesService.getRoutineDaysByRoutineId(
          assigned['routineId']
        );

      this.routineDays =
        days.sort((a, b) => a.dayNumber - b.dayNumber);
      for (const day of this.routineDays) {
        day.completedToday = false;
        await this.checkIfCompletedToday(day);
      }

    } catch (error) {
      console.error('❌ Error cargando rutina:', error);
    }

    this.loading = false;
  }

  // ============================
  // HELPERS
  // ============================

  getExerciseName(id: string) {
    const ex = this.exercises.find(e => e.id === id);
    return ex ? ex.name : '';
  }

  getExerciseById(id: string) {
    return this.exercises.find(e => e.id === id);
  }

  openExercisePreview(exerciseId: string) {

    const exercise = this.getExerciseById(exerciseId);
    if (!exercise) return;

    this.dialog.open(ExercisePreviewComponent, {
      width: '450px',
      data: exercise
    });

  }

  async completeWorkout(day: any) {

    if (day.completedToday) return;

    const currentUser = this.auth.currentUser;
    if (!currentUser || !this.routine) return;

    await addDoc(
      collection(this.firestore, 'workoutHistory'),
      {
        userId: currentUser.uid,
        routineId: this.routine.id,
        routineName: this.routine.name,
        dayNumber: day.dayNumber,
        completedAt: new Date()
      }
    );

    day.completedToday = true;
  }
  async checkIfCompletedToday(day: any) {

    const currentUser = this.auth.currentUser;
    if (!currentUser) return;

    const workoutsRef = collection(this.firestore, 'workoutHistory');

    const q = query(
      workoutsRef,
      where('userId', '==', currentUser.uid),
      where('routineId', '==', this.routine.id),
      where('dayNumber', '==', day.dayNumber)
    );

    const snap = await getDocs(q);

    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    snap.forEach(doc => {
      const data: any = doc.data();

      const completedDate = data.completedAt.toDate();

      if (completedDate >= startOfToday) {
        day.completedToday = true;
      }
    });
  }

}