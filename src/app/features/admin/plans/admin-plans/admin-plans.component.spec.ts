import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPlansComponent } from './admin-plans.component';

describe('AdminPlansComponent', () => {
  let component: AdminPlansComponent;
  let fixture: ComponentFixture<AdminPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPlansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
