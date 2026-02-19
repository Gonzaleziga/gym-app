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

@Component({
  selector: 'app-client-routine',
  standalone: true,
  imports: [CommonModule, MatCardModule,],
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
            (instructor['lastNameFather'] || '');
        }
      }

      // 5️⃣ Días ordenados
      const days: any[] =
        await this.routinesService.getRoutineDaysByRoutineId(
          assigned['routineId']
        );

      this.routineDays =
        days.sort((a, b) => a.dayNumber - b.dayNumber);

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

}