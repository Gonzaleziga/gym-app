import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { UsersService } from '../services/users.service';

export const adminGuard: CanMatchFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const usersService = inject(UsersService);

  const user = auth.currentUser;

  if (!user) {
    router.navigateByUrl('/login');
    return false;
  }

  const snap = await usersService.getUser(user.uid);

  if (snap.exists() && snap.data()?.['role'] === 'admin') {
    console.log('ADMIN GUARD OK');
    return true;
  }

  router.navigateByUrl('/');
  return false;
};