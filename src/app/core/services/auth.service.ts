import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private injector: Injector,
    private usersService: UsersService
  ) { }

  // 📧 Registro email/password
  register(email: string, password: string, name: string) {
    return runInInjectionContext(this.injector, async () => {
      const cred = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      await updateProfile(cred.user, { displayName: name });
      await this.usersService.createUser(cred.user.uid, {
        uid: cred.user.uid,
        name,
        email,
        provider: 'password',
        role: 'visitor',
        isApproved: false,
        createdAt: new Date()
      });

      return cred;
    });
  }

  // 🔐 Login email/password
  login(email: string, password: string) {
    return runInInjectionContext(this.injector, () =>
      signInWithEmailAndPassword(this.auth, email, password)
    );
  }

  // 🔵 Login con Google
  loginWithGoogle() {
    return runInInjectionContext(this.injector, async () => {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(this.auth, provider);

      const userRef = doc(this.firestore, 'users', cred.user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: cred.user.uid,
          name: cred.user.displayName,
          email: cred.user.email,
          provider: 'google',
          role: 'visitor',
          isApproved: false,
          createdAt: new Date()
        });
      }

      return cred;
    });
  }

  logout() {
    return runInInjectionContext(this.injector, () => this.auth.signOut());
  }
}