import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, getDocs, doc, getDoc, addDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class PlansService {

  constructor(
    private firestore: Firestore,
    private injector: Injector
  ) { }

  // 🔹 Obtener todos los planes
  async getAllPlans() {
    return runInInjectionContext(this.injector, async () => {
      const ref = collection(this.firestore, 'plans');
      const snap = await getDocs(ref);

      return snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
    });
  }

  // 🔹 Obtener solo activos
  async getActivePlans() {
    const plans = await this.getAllPlans();
    return plans.filter((p: any) => p.isActive);
  }

  // 🔹 Obtener plan por ID
  async getPlanById(id: string) {
    return runInInjectionContext(this.injector, () =>
      getDoc(doc(this.firestore, 'plans', id))
    );
  }

  // 🔹 Crear plan
  async createPlan(data: any) {
    return runInInjectionContext(this.injector, () =>
      addDoc(collection(this.firestore, 'plans'), {
        ...data,
        createdAt: new Date()
      })
    );
  }

  // 🔹 Actualizar plan
  updatePlan(id: string, data: any) {
    const ref = doc(this.firestore, 'plans', id);
    return updateDoc(ref, data);
  }

  // 🔹 Activar / Desactivar
  async togglePlanStatus(id: string, currentStatus: boolean) {
    return this.updatePlan(id, {
      isActive: !currentStatus
    });
  }
}