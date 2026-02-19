import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-exercise-preview',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './exercise-preview.component.html',
  styleUrl: './exercise-preview.component.scss'
})
export class ExercisePreviewComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

}