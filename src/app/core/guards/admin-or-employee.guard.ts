import { CanMatchFn } from '@angular/router';
import { inject } from '@angular/core';
import { UserSessionService } from '../services/user-session.service';

export const adminOrEmployeeGuard: CanMatchFn = () => {
  const session = inject(UserSessionService);
  const role = session.role();

  return role === 'admin' || role === 'employee';
};