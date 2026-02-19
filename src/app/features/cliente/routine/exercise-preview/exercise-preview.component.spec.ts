import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercisePreviewComponent } from './exercise-preview.component';

describe('ExercisePreviewComponent', () => {
  let component: ExercisePreviewComponent;
  let fixture: ComponentFixture<ExercisePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExercisePreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExercisePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
