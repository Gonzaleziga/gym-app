import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { UsersService } from '../services/users.service';

export const membershipGuard: CanMatchFn = async () => {

  const auth = inject(Auth);
  const router = inject(Router);
  const usersService = inject(UsersService);

  const user = auth.currentUser;

  if (!user) {
    router.navigateByUrl('/login');
    return false;
  }

  const snap = await usersService.getUser(user.uid);

  if (!snap.exists()) {
    router.navigateByUrl('/');
    return false;
  }

  const userData = snap.data();

  // 🔥 Si la membresía está activa → permitir
  if (userData?.['membershipStatus'] === 'active') {
    return true;
  }

  // 🔴 Si está vencida → redirigir
  router.navigateByUrl('/visitor');
  return false;
};