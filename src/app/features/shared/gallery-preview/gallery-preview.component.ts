import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-gallery-preview',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
  <div class="preview-container">
    <button class="close-btn" (click)="close()">✕</button>
    <img [src]="data.imageUrl">
  </div>
`,


  styles: [`
  .preview-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background: black;
    padding: 20px;
  }

  img {
    max-width: 70vw;
    max-height: 70vh;
    border-radius: 12px;
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    background: rgba(0,0,0,0.6);
    color: white;
    border: none;
    font-size: 22px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
  }
`]
})
export class GalleryPreviewComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<GalleryPreviewComponent>
  ) { }

  close() {
    this.dialogRef.close();
  }
}