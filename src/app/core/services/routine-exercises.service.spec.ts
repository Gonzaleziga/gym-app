import { TestBed } from '@angular/core/testing';

import { RoutineExercisesService } from './routine-exercises.service';

describe('RoutineExercisesService', () => {
  let service: RoutineExercisesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoutineExercisesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
