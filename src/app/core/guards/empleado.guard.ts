import { CanMatchFn } from '@angular/router';

export const empleadoGuard: CanMatchFn = (route, segments) => {
  return true;
};
