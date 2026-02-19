import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRoutineComponent } from './client-routine.component';

describe('ClientRoutineComponent', () => {
  let component: ClientRoutineComponent;
  let fixture: ComponentFixture<ClientRoutineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientRoutineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientRoutineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
