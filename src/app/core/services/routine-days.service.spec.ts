import { TestBed } from '@angular/core/testing';

import { RoutineDaysService } from './routine-days.service';

describe('RoutineDaysService', () => {
  let service: RoutineDaysService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoutineDaysService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
