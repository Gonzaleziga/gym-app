import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRoutinesComponent } from './admin-routines.component';

describe('AdminRoutinesComponent', () => {
  let component: AdminRoutinesComponent;
  let fixture: ComponentFixture<AdminRoutinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRoutinesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRoutinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
