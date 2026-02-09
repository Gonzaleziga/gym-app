import { CanMatchFn } from '@angular/router';

export const clienteGuard: CanMatchFn = (route, segments) => {
  return true;
};
