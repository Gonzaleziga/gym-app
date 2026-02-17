import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
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

  // =============================
  // 📧 REGISTRO
  // =============================
  async register(
    email: string,
    password: string,
    name: string,
    lastNameFather: string,
    lastNameMother: string,
    phoneNumber: string
  ) {
    const cred = await createUserWithEmailAndPassword(
      this.auth,
      email.trim(),
      password.trim()
    );

    // Actualizar perfil en Auth
    await updateProfile(cred.user, {
      displayName: name,
      photoURL: '/images/images.png'
    });

    // Crear documento en Firestore
    await this.usersService.createUser(cred.user.uid, {
      uid: cred.user.uid,
      name,
      lastNameFather,
      lastNameMother,
      phoneNumber,
      email,
      provider: 'password',

      // Seguridad
      role: 'visitor',
      status: 'active',
      isApproved: false,
      forceLogout: false,

      // Membresía
      membershipId: null,
      membershipStatus: 'expired',
      membershipEndDate: null,

      // Perfil
      photoURL: cred.user.photoURL,
      genero: 'otro',
      birthDate: null,
      profilePublic: false,
      coverPhotoURL: null,
      bio: '',
      emergencyContact: { name: '', phone: '' },

      // Fechas
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return cred;
  }

  // =============================
  // 🔐 LOGIN
  // =============================
  async login(email: string, password: string) {
    return signInWithEmailAndPassword(
      this.auth,
      email.trim(),
      password.trim()
    );
  }

  // =============================
  // 🔵 LOGIN GOOGLE
  // =============================
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
        status: 'active',
        isApproved: false,
        forceLogout: false,
        createdAt: new Date()
      });
    }

    return cred;
  }

  // =============================
  // 🔁 REDIRECT POR ROL
  // =============================
  async redirectByRole() {
    const user = this.auth.currentUser;
    if (!user) return;

    const snap = await this.usersService.getUser(user.uid);
    if (!snap.exists()) return;

    const role = snap.data()['role'];

    const membershipExpiresAt = snap.data()['membershipExpiresAt'];
    const membershipStatus = snap.data()['membershipStatus'];

    if (membershipExpiresAt && membershipExpiresAt.toDate) {

      const expires = membershipExpiresAt.toDate();
      const now = new Date();

      if (expires < now && membershipStatus === 'active') {

        await this.usersService.updateUser(user.uid, {
          membershipStatus: 'expired'
        });

      }
    }
    switch (role) {
      case 'admin':
        await this.router.navigate(['/admin']);
        break;

      case 'client':
        await this.router.navigate(['/client']);
        break;

      case 'employee':
        await this.router.navigate(['/employee']);
        break;

      default:
        await this.router.navigate(['/visitor']);
        break;
    }
  }

  // =============================
  // 📧 RESET PASSWORD
  // =============================
  async resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  // =============================
  // 🚪 LOGOUT
  // =============================
  logout() {
    return this.auth.signOut();
  }
}