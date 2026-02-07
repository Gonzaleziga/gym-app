import { getAuth, onAuthStateChanged } from '@angular/fire/auth';

export function firebaseTest() {
    const auth = getAuth();

    onAuthStateChanged(auth, user => {
        if (user) {
            console.log('🔥 Firebase conectado. Usuario:', user.uid);
        } else {
            console.log('🔥 Firebase conectado. No hay usuario logueado');
        }
    });
}