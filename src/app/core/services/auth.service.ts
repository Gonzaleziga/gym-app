import { Injectable } from '@angular/core';
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
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private usersService: UsersService,
    private router: Router
  ) { }

  // 📧 Registro
  async register(
    email: string,
    password: string,
    name: string,
    lastNameFather: string,
    lastNameMother: string,
    phoneNumber: string
  ) {
    try {

      console.log('📩 EMAIL:', email);
      console.log('🔑 PASSWORD:', password);

      const cred = await createUserWithEmailAndPassword(
        this.auth,
        email.trim(),
        password.trim()
      );

      console.log('✅ REGISTER OK', cred.user);

      await updateProfile(cred.user, {
        displayName: name,
        photoURL: '/images/images.png'
      });

      await this.usersService.createUser(cred.user.uid, {
        uid: cred.user.uid,
        name,
        lastNameFather,
        lastNameMother,
        phoneNumber,
        email,
        provider: 'password',
        role: 'visitor',
        status: 'active',
        isApproved: false,
        forceLogout: false,
        membershipId: null,
        membershipStatus: 'inactive',
        photoURL: cred.user.photoURL,
        genero: 'otro',
        birthDate: null,
        emergencyContact: { name: '', phone: '' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return cred;

    } catch (error: any) {

      console.error('❌ REGISTER ERROR FULL:', error);
      console.error('❌ CODE:', error.code);
      console.error('❌ MESSAGE:', error.message);

      throw error;
    }
  }

  // 🔐 Login
  async login(email: string, password: string) {
    return signInWithEmailAndPassword(
      this.auth,
      email.trim(),
      password.trim()
    );


  }

  // 🔵 Google
  async loginWithGoogle() {
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
  }

  async redirectByRole() {
    const user = this.auth.currentUser;
    if (!user) return;

    const snap = await this.usersService.getUser(user.uid);
    if (!snap.exists()) return;

    const role = snap.data()['role'];

    switch (role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'client':
        this.router.navigate(['/client']);
        break;
      case 'employee':
        this.router.navigate(['/employee']);
        break;
      default:
        this.router.navigate(['/visitor']);
        break;
    }
  }

  logout() {
    return this.auth.signOut();
  }
}