import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { empleadoGuard } from './empleado.guard';

describe('empleadoGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => empleadoGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
