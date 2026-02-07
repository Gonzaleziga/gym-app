import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({ 
  providedIn: 'root' })
export class AuthService {

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) { }

  // 📧 Registro email/password
  async register(email: string, password: string, name: string): Promise<UserCredential> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);

    await setDoc(doc(this.firestore, 'users', cred.user.uid), {
      uid: cred.user.uid,
      name,
      email,
      provider: 'password',
      role: 'user',
      createdAt: new Date()
    });

    return cred;
  }

  // 🔐 Login email/password
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // 🔵 Login con Google
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(this.auth, provider);

    const userRef = doc(this.firestore, 'users', cred.user.uid);
    const snap = await getDoc(userRef);

    // Solo lo crea si no existe (primer login)
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: cred.user.uid,
        name: cred.user.displayName,
        email: cred.user.email,
        provider: 'google',
        role: 'user',
        createdAt: new Date()
      });
    }

    return cred;
  }

  logout() {
    return this.auth.signOut();
  }
}