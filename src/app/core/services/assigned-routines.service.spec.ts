import { TestBed } from '@angular/core/testing';

import { AssignedRoutinesService } from './assigned-routines.service';

describe('AssignedRoutinesService', () => {
  let service: AssignedRoutinesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignedRoutinesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
