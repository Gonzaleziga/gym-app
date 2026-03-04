import { TestBed } from '@angular/core/testing';

import { ExerciseLogsService } from './exercise-logs.service';

describe('ExerciseLogsService', () => {
  let service: ExerciseLogsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExerciseLogsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
