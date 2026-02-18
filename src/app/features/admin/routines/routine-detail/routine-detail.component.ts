import { MatIconModule } from '@angular/material/icon';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { RoutineDaysService } from '../../../../core/services/routine-days.service';
import { ExercisesService } from '../../../../core/services/exercises.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-routine-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './routine-detail.component.html',
  styleUrl: './routine-detail.component.scss'
})
export class RoutineDetailComponent implements OnInit {

  routineId!: string;
  routine: any;
  routineDays: any[] = [];
  exercises: any[] = [];

  newDay = {
    dayNumber: 1,
    title: '',
    exercises: [] as any[]
  };

  editingDayId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private routineDaysService: RoutineDaysService,
    private exercisesService: ExercisesService,
    private dialog: MatDialog
  ) { }

  async ngOnInit() {

    this.routineId = this.route.snapshot.paramMap.get('id')!;

    const routineSnap = await getDoc(
      doc(this.firestore, 'routines', this.routineId)
    );

    this.routine = {
      id: routineSnap.id,
      ...routineSnap.data()
    };

    this.routineDays =
      await this.routineDaysService.getRoutineDays(this.routineId);

    this.exercises =
      await this.exercisesService.getAllExercises();
  }

  async addDay() {

    if (!this.routine?.id) return;

    if (this.editingDayId) {
      // 🔥 MODO EDITAR

      await this.routineDaysService.updateRoutineDay(
        this.editingDayId,
        {
          dayNumber: this.newDay.dayNumber,
          title: this.newDay.title,
          exercises: this.newDay.exercises
        }
      );

      this.editingDayId = null;

    } else {
      // 🔥 MODO CREAR

      await this.routineDaysService.addRoutineDay({
        routineId: this.routine.id,
        dayNumber: this.newDay.dayNumber,
        title: this.newDay.title,
        exercises: this.newDay.exercises,
        createdAt: new Date()
      });
    }

    // Reset
    this.newDay = {
      dayNumber: 1,
      title: '',
      exercises: []
    };

    this.routineDays =
      await this.routineDaysService.getRoutineDays(this.routine.id);
  }

  addExerciseToDay(exerciseId: string) {
    this.newDay.exercises.push({
      exerciseId,
      sets: 3,
      reps: '12'
    });
  }

  getExerciseName(id: string) {
    const ex = this.exercises.find(e => e.id === id);
    return ex ? ex.name : '';
  }
  removeExerciseFromDay(index: number) {
    this.newDay.exercises.splice(index, 1);
  }

  getExerciseImage(exerciseId: string): string {

    const exercise = this.exercises.find(e => e.id === exerciseId);

    return exercise?.imageUrl || 'assets/no-image.png';
  }

  getExerciseMuscle(exerciseId: string): string {

    const exercise = this.exercises.find(e => e.id === exerciseId);

    return exercise?.muscleGroup || '';
  }
  async deleteDay(dayId: string) {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Día',
        message: '¿Estás seguro de que deseas eliminar este día de entrenamiento? Esta acción no se puede deshacer.'
      }
    });

    const result = await dialogRef.afterClosed().toPromise();

    if (result) {
      await this.routineDaysService.deleteRoutineDay(dayId);
      this.routineDays = this.routineDays.filter(d => d.id !== dayId);
    }

  }

  editDay(day: any) {

    this.editingDayId = day.id;

    this.newDay = {
      dayNumber: day.dayNumber,
      title: day.title,
      exercises: day.exercises.map((ex: any) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps
      }))
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }



}