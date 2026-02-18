import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { Firestore, collection, addDoc, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { RoutineDaysService } from '../../../../core/services/routine-days.service';
import { ExercisesService } from '../../../../core/services/exercises.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-routines',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    RouterLink
  ],
  templateUrl: './admin-routines.component.html',
  styleUrl: './admin-routines.component.scss'
})
export class AdminRoutinesComponent implements OnInit {

  routines: any[] = [];
  loading = true;

  newRoutine = {
    name: '',
    description: '',
    durationValue: 4,
    durationType: 'weeks',
    isActive: true
  };
  selectedRoutineId: string | null = null;
  routineDays: any[] = [];
  exercises: any[] = [];
  newDay = {
    dayNumber: 1,
    title: '',
    exercises: [] as any[]
  };




  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private routineDaysService: RoutineDaysService,
    private exercisesService: ExercisesService,
  ) { }

  async ngOnInit() {
    await this.loadRoutines();
    this.exercises = await this.exercisesService.getAllExercises();
  }

  async loadRoutines() {
    this.loading = true;

    const snapshot = await getDocs(collection(this.firestore, 'routines'));

    this.routines = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    this.loading = false;
  }

  async createRoutine() {

    if (!this.newRoutine.name) return;

    const user = this.auth.currentUser;
    if (!user) return;

    await addDoc(collection(this.firestore, 'routines'), {
      ...this.newRoutine,
      createdBy: user.uid,
      createdAt: new Date()
    });

    this.newRoutine = {
      name: '',
      description: '',
      durationValue: 4,
      durationType: 'weeks',
      isActive: true
    };

    await this.loadRoutines();
  }
  removeExerciseFromDay(index: number) {
    this.newDay.exercises.splice(index, 1);
  }


  async toggleRoutine(routine: any) {

    await updateDoc(
      doc(this.firestore, 'routines', routine.id),
      { isActive: !routine.isActive }
    );

    routine.isActive = !routine.isActive;
  }

  async selectRoutine(routineId: string) {
    this.selectedRoutineId = routineId;
    this.routineDays = await this.routineDaysService.getRoutineDays(routineId);
  }

  async addDay() {

    if (!this.selectedRoutineId) return;

    await this.routineDaysService.addRoutineDay({
      routineId: this.selectedRoutineId,
      dayNumber: this.newDay.dayNumber,
      title: this.newDay.title,
      exercises: this.newDay.exercises,
      createdAt: new Date()
    });

    this.newDay = {
      dayNumber: this.newDay.dayNumber + 1,
      title: '',
      exercises: []
    };

    this.routineDays =
      await this.routineDaysService.getRoutineDays(this.selectedRoutineId);
  }

  addExerciseToDay(exerciseId: string) {

    this.newDay.exercises.push({
      exerciseId,
      sets: 3,
      reps: '12'
    });
  }
  getExerciseName(exerciseId: string): string {

    const exercise = this.exercises.find(e => e.id === exerciseId);

    return exercise ? exercise.name : 'Ejercicio';
  }

}