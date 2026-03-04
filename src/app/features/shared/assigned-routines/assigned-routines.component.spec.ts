import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedRoutinesComponent } from './assigned-routines.component';

describe('AssignedRoutinesComponent', () => {
  let component: AssignedRoutinesComponent;
  let fixture: ComponentFixture<AssignedRoutinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedRoutinesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedRoutinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
