import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { visitorGuard } from './visitor.guard';

describe('visitorGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => visitorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
