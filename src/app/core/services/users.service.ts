import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class UsersService {

  constructor(private firestore: Firestore) { }

  createUser(uid: string, data: any) {
    const ref = doc(this.firestore, `users/${uid}`);
    return setDoc(ref, data);
  }

  getUser(uid: string) {
    const ref = doc(this.firestore, `users/${uid}`);
    return getDoc(ref);
  }
}