import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { membershipGuard } from './membership.guard';

describe('membershipGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => membershipGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
