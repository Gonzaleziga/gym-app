import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { doc, updateDoc } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { ExercisesService } from '../../../../core/services/exercises.service';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-admin-exercises',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-exercises.component.html',
  styleUrl: './admin-exercises.component.scss'
})
export class AdminExercisesComponent implements OnInit {

  exercises: any[] = [];
  loading = true;
  selectedFile: File | null = null;
  uploading = false;
  editingExerciseId: string | null = null;
  // 🔹 SOLO CAMPOS DEL FORM
  newExercise = {
    name: '',
    description: '',
    muscleGroup: '',
    difficulty: '',
    videoUrl: '',
    imageUrl: '',
    isActive: true
  };
  // 🔹 Catálogo grupos musculares
  muscleGroups: string[] = [
    'Pecho',
    'Espalda',
    'Piernas',
    'Hombros',
    'Bíceps',
    'Tríceps',
    'Abdomen',
    'Glúteos',
    'Cardio'
  ];

  // 🔹 Catálogo dificultad
  difficultyLevels: string[] = [
    'Principiante',
    'Intermedio',
    'Avanzado'
  ];

  constructor(
    private exercisesService: ExercisesService,
    private storage: Storage,
    private firestore: Firestore
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
    console.log('⏳ uploading BEFORE:', this.uploading);
    if (!this.newExercise.name) {
      alert('El nombre es obligatorio');
      return;
    }
    this.uploading = true;

    console.log('⏳ uploading TRUE');
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
        videoUrl: '',
        imageUrl: '',
        isActive: true
      };

      this.selectedFile = null;

      await this.loadExercises();

    } catch (error) {
      console.error('❌ Error creando ejercicio:', error);
    }

    this.uploading = false;
    console.log('⏳ uploading FALSE');
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

    this.uploading = true;

    try {

      const filePath = `exercises/${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, filePath);

      await uploadBytes(storageRef, file);

      return await getDownloadURL(storageRef);

    } finally {
      this.uploading = false;
    }
  }

  // ================================
  // METODO PARA EDITAR EJERCICIO 
  // ================================
  editExercise(exercise: any) {
    this.editingExerciseId = exercise.id;

    this.newExercise = {
      name: exercise.name,
      description: exercise.description,
      muscleGroup: exercise.muscleGroup,
      difficulty: exercise.difficulty,
      imageUrl: exercise.imageUrl || '',
      videoUrl: exercise.videoUrl || '',
      isActive: exercise.isActive
    };
  }

  async updateExercise() {

    if (!this.editingExerciseId) return;

    this.uploading = true;

    try {

      let imageUrl = this.newExercise.imageUrl;

      // 🔥 Si seleccionó nueva imagen, subirla
      if (this.selectedFile) {
        imageUrl = await this.uploadExerciseImage(this.selectedFile);
      }

      await updateDoc(
        doc(this.firestore, 'exercises', this.editingExerciseId),
        {
          name: this.newExercise.name,
          description: this.newExercise.description,
          muscleGroup: this.newExercise.muscleGroup,
          difficulty: this.newExercise.difficulty,
          videoUrl: this.newExercise.videoUrl,
          imageUrl: imageUrl,
          isActive: this.newExercise.isActive
        }
      );

      this.editingExerciseId = null;

      this.newExercise = {
        name: '',
        description: '',
        muscleGroup: '',
        difficulty: '',
        imageUrl: '',
        videoUrl: '',
        isActive: true
      };

      this.selectedFile = null;

      await this.loadExercises();

    } catch (error) {
      console.error('❌ Error actualizando ejercicio:', error);
    }

    this.uploading = false;
  }

}