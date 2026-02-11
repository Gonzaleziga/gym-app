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
    return runInInjectionContext(this.injector, () =>
      getDoc(doc(this.firestore, 'users', uid))
    );
  }

  async getUserRole(uid: string): Promise<string | null> {
    const snap = await this.getUser(uid);

    if (!snap.exists()) return null;

    return snap.data()?.['role'] ?? null;
  }


  createUser(uid: string, data: any) {
    return runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, 'users', uid);
      return setDoc(ref, data);
    });
  }
}