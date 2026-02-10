import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { UsersService } from '../services/users.service';

export const visitorGuard: CanMatchFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const usersService = inject(UsersService);

  const user = auth.currentUser;

  if (!user) {
    router.navigateByUrl('/login');
    return false;
  }

  const snap = await usersService.getUser(user.uid);

  if (snap.exists() && snap.data()?.['role'] === 'visitor') {
    console.log('VISITOR GUARD OK');
    return true;
  }

  router.navigateByUrl('/');
  return false;
};