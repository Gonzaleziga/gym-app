import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { UsersService } from '../services/users.service';
import { firstValueFrom } from 'rxjs';

export const adminGuard: CanMatchFn = async () => {

  const auth = inject(Auth);
  const router = inject(Router);
  const usersService = inject(UsersService);

  // 🔥 Espera real al usuario Firebase
  const user = await firstValueFrom(authState(auth));

  if (!user) {
    router.navigateByUrl('/login');
    return false;
  }

  const snap = await usersService.getUser(user.uid);

  if (snap.exists() && snap.data()?.['role'] === 'admin') {
    console.log('✅ ADMIN GUARD OK');
    return true;
  }

  router.navigateByUrl('/');
  return false;
};