import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserSessionService {

  // 🔹 rol como SIGNAL
  private _role = signal<string>('visitor');

  // 🔹 getter público (solo lectura)
  role = this._role.asReadonly();

  // 🔹 método para cambiar rol
  setRole(role: string) {
    this._role.set(role);
  }

  clearSession() {
    this._role.set('visitor');
  }
}