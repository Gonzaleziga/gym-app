import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(
    private firestore: Firestore,
    private injector: Injector
  ) { }

  getUser(uid: string) {
    return runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, 'users', uid);
      return getDoc(ref);
    });
  }

  createUser(uid: string, data: any) {
    return runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, 'users', uid);
      return setDoc(ref, data);
    });
  }
}