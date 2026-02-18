import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { ExercisesService } from '../../../../core/services/exercises.service';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-admin-exercises',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule
  ],
  templateUrl: './admin-exercises.component.html',
  styleUrl: './admin-exercises.component.scss'
})
export class AdminExercisesComponent implements OnInit {

  exercises: any[] = [];
  loading = true;

  selectedFile: File | null = null;
  uploading = false;

  // 🔹 SOLO CAMPOS DEL FORM
  newExercise = {
    name: '',
    description: '',
    muscleGroup: '',
    difficulty: '',
    videoUrl: ''
  };

  constructor(
    private exercisesService: ExercisesService,
    private storage: Storage
  ) { }

  async ngOnInit() {
    await this.loadExercises();
  }

  // ================================
  // CARGAR EJERCICIOS
  // ================================
  async loadExercises() {
    this.loading = true;

    try {
      this.exercises = await this.exercisesService.getAllExercises();
    } catch (error) {
      console.error('❌ Error cargando ejercicios:', error);
    }

    this.loading = false;
  }

  // ================================
  // CREAR EJERCICIO
  // ================================
  async createExercise() {

    if (!this.newExercise.name) {
      alert('El nombre es obligatorio');
      return;
    }

    this.uploading = true;

    try {

      let imageUrl = '';

      // 🔥 Subir imagen si existe
      if (this.selectedFile) {
        imageUrl = await this.uploadExerciseImage(this.selectedFile);
      }

      await this.exercisesService.createExercise({
        ...this.newExercise,
        imageUrl,
        isActive: true,
        createdAt: new Date()
      });

      // 🔄 Reset formulario
      this.newExercise = {
        name: '',
        description: '',
        muscleGroup: '',
        difficulty: '',
        videoUrl: ''
      };

      this.selectedFile = null;

      await this.loadExercises();

    } catch (error) {
      console.error('❌ Error creando ejercicio:', error);
    }

    this.uploading = false;
  }

  // ================================
  // ACTIVAR / DESACTIVAR
  // ================================
  async toggleExercise(exercise: any) {

    try {

      await this.exercisesService.toggleExercise(
        exercise.id,
        exercise.isActive
      );

      // 🔥 Actualiza UI sin recargar
      exercise.isActive = !exercise.isActive;

    } catch (error) {
      console.error('❌ Error cambiando estado:', error);
    }
  }

  // ================================
  // SELECCIONAR ARCHIVO
  // ================================
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // ================================
  // SUBIR IMAGEN A STORAGE
  // ================================
  async uploadExerciseImage(file: File): Promise<string> {

    const filePath = `exercises/${Date.now()}_${file.name}`;

    const storageRef = ref(this.storage, filePath);

    await uploadBytes(storageRef, file);

    return await getDownloadURL(storageRef);
  }

}