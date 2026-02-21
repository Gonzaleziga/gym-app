import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../../core/services/users.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { Auth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { PaymentHistoryModalComponent }
  from '../payment-history-modal/payment-history-modal.component';
import { FormsModule } from '@angular/forms';
import { PlansService } from '../../../../core/services/plans.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, MatSelectModule } from '@angular/material/select';
import { PaymentsService } from '../../../../core/services/payments.service';
import { AssignedRoutinesService } from '../../../../core/services/assigned-routines.service';
import { RoutinesService } from '../../../../core/services/routines.service';
import { ConfirmModalComponent }
  from '../../../../features/shared/confirm-modal/confirm-modal.component';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { deleteObject } from '@angular/fire/storage';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    FormsModule,
    MatFormFieldModule,
    MatOption,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {

  users: any[] = [];
  loading = true;
  admins: any[] = [];
  employees: any[] = [];
  clients: any[] = [];
  visitors: any[] = [];
  roles = ['admin', 'employee', 'client', 'visitor'];
  expandedUserId: string | null = null;
  searchTerm: string = '';
  activeTabIndex: number = 0;
  plans: any[] = [];
  routines: any[] = [];
  uploadingPhotoUserId: string | null = null;


  constructor(
    private usersService: UsersService,
    private plansService: PlansService,
    private routinesService: RoutinesService,
    private assignedRoutinesService: AssignedRoutinesService,
    private authService: AuthService,
    private auth: Auth,
    private dialog: MatDialog,
    private paymentsService: PaymentsService,
    private storage: Storage
  ) { }

  async ngOnInit() {
    await this.loadUsers();
    this.plans = await this.plansService.getAllPlans();
    this.routines = await this.routinesService.getAllRoutines();

  }

  async loadUsers() {
    this.loading = true;

    this.users = await this.usersService.getAllUsers();

    const today = new Date();

    // 🔥 Verificar vencimiento automático
    for (const user of this.users) {
      if (user.membershipEnd) {

        const endDate = user.membershipEnd.toDate
          ? user.membershipEnd.toDate()
          : new Date(user.membershipEnd);

        if (endDate < today && user.membershipStatus === 'active') {

          await this.usersService.updateUser(user.uid, {
            membershipStatus: 'expired'
          });

          user.membershipStatus = 'expired';
        }
      }
    }

    this.admins = this.users.filter(u => u.role === 'admin');
    this.employees = this.users.filter(u => u.role === 'employee');
    this.clients = this.users.filter(u => u.role === 'client');
    this.visitors = this.users.filter(u => u.role === 'visitor');

    this.loading = false;
  }

  async changeRole(uid: string, role: string) {

    const user = this.users.find(u => u.uid === uid);
    if (!user) return;

    // 🔔 Modal confirmación
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Cambio de Rol',
        message: `¿Seguro que deseas cambiar el rol de ${user.name} a "${role}"?`,
        confirmText: 'Cambiar',
        cancelText: 'Cancelar'
      }
    });

    const confirmed = await dialogRef.afterClosed().toPromise();

    if (!confirmed) return;

    try {

      const currentTab = this.activeTabIndex;

      await this.usersService.updateUser(uid, { role });

      // 🔄 Recargar usuarios
      await this.loadUsers();

      this.activeTabIndex = currentTab;

      // ✅ Modal éxito
      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Rol Actualizado',
          message: 'El rol fue cambiado correctamente.',
          confirmText: 'OK',
          hideCancel: true
        }
      });

    } catch (error) {

      console.error('❌ Error cambiando rol:', error);

      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Error',
          message: 'Ocurrió un error al cambiar el rol.',
          confirmText: 'Cerrar',
          hideCancel: true
        }
      });

    }
  }

  async toggleStatus(user: any) {

    const newStatus =
      user.status === 'active' ? 'inactive' : 'active';

    const actionText =
      newStatus === 'inactive'
        ? 'bloquear'
        : 'activar';

    // 🔔 Modal confirmación
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Acción',
        message: `¿Seguro que deseas ${actionText} la cuenta de ${user.name}?`,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar'
      }
    });

    const confirmed = await dialogRef.afterClosed().toPromise();

    if (!confirmed) return;

    try {

      await this.usersService.updateUser(user.uid, {
        status: newStatus
      });

      user.status = newStatus;

      // ✅ Modal éxito
      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Cuenta Actualizada',
          message: `La cuenta fue ${newStatus === 'inactive' ? 'bloqueada' : 'activada'} correctamente.`,
          confirmText: 'OK',
          hideCancel: true
        }
      });

    } catch (error) {

      console.error('❌ Error cambiando estado:', error);

      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Error',
          message: 'Ocurrió un error al actualizar la cuenta.',
          confirmText: 'Cerrar',
          hideCancel: true
        }
      });

    }
  }

  async forceLogout(uid: string) {

    const user = this.users.find(u => u.uid === uid);
    if (!user) return;

    // 🔔 Modal confirmación
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: {
        title: 'Forzar Cierre de Sesión',
        message: `¿Seguro que deseas cerrar la sesión de ${user.name}?`,
        confirmText: 'Sí, cerrar sesión',
        cancelText: 'Cancelar'
      }
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (!confirmed) return;

    try {

      await this.usersService.updateUser(uid, {
        forceLogout: true
      });

      // ✅ Modal éxito
      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Sesión Cerrada',
          message: 'El usuario deberá iniciar sesión nuevamente.',
          confirmText: 'OK',
          hideCancel: true
        }
      });

    } catch (error) {

      console.error('❌ Error forzando logout:', error);

      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Error',
          message: 'No se pudo forzar el cierre de sesión.',
          confirmText: 'Cerrar',
          hideCancel: true
        }
      });

    }
  }

  async resetPassword(user: any) {

    // 🔔 Modal confirmación
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: {
        title: 'Restablecer Contraseña',
        message: `¿Deseas enviar un correo de recuperación a ${user.email}?`,
        confirmText: 'Sí, enviar correo',
        cancelText: 'Cancelar'
      }
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (!confirmed) return;

    try {

      await this.authService.resetPassword(user.email);

      // ✅ Modal éxito
      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Correo Enviado',
          message: 'Se envió el correo de recuperación correctamente.',
          confirmText: 'OK',
          hideCancel: true
        }
      });

    } catch (error) {

      console.error('❌ Error enviando reset:', error);

      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Error',
          message: 'No se pudo enviar el correo de recuperación.',
          confirmText: 'Cerrar',
          hideCancel: true
        }
      });

    }
  }

  async activateMembership(user: any) {
    await this.usersService.activateMembership(user.uid, 1);
    await this.loadUsers();
  }

  async registerPayment(user: any) {

    if (!user.planId) {
      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Sin Plan',
          message: 'Primero debes asignar un plan al cliente.',
          confirmText: 'OK',
          hideCancel: true
        }
      });
      return;
    }

    const plan = this.plans.find(p => p.id === user.planId);
    if (!plan) return;

    const adminUid = this.auth.currentUser?.uid;
    if (!adminUid) return;

    // 🔹 CONFIRMAR PAGO
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Pago',
        message: `¿Registrar pago de $${plan.price} para ${user.name}?`,
        confirmText: 'Registrar',
        cancelText: 'Cancelar'
      }
    });

    const confirmed = await dialogRef.afterClosed().toPromise();

    if (!confirmed) return;

    try {

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.durationMonths);

      // 🔥 1️⃣ Registrar pago
      await this.paymentsService.registerPayment({
        userId: user.uid,
        amount: plan.price,
        months: plan.durationMonths,
        startDate,
        endDate,
        createdAt: new Date(),
        createdBy: adminUid
      });

      // 🔥 2️⃣ Actualizar membresía
      await this.usersService.updateUser(user.uid, {
        membershipStatus: 'active',
        membershipStart: startDate,
        membershipEnd: endDate
      });

      user.membershipStatus = 'active';

      // 🔹 Modal éxito
      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Pago Registrado',
          message: 'El pago fue registrado correctamente.',
          confirmText: 'OK',
          hideCancel: true
        }
      });

    } catch (error) {

      console.error('❌ Error registrando pago:', error);

      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Error',
          message: 'Ocurrió un error al registrar el pago.',
          confirmText: 'Cerrar',
          hideCancel: true
        }
      });
    }
  }


  // ✅ ÚNICO MÉTODO CORRECTO
  viewPayments(user: any) {
    this.dialog.open(PaymentHistoryModalComponent, {
      data: {
        uid: user.uid,
        name: user.name,
        lastNameFather: user.lastNameFather,
        lastNameMother: user.lastNameMother
      },
      width: '650px'
    });
  }

  async toggleDetails(uid: string) {

    if (this.expandedUserId === uid) {
      this.expandedUserId = null;
      return;
    }

    this.expandedUserId = uid;

    const user = this.users.find(u => u.uid === uid);

    if (user) {
      await this.loadLastPayment(user);
    }
  }

  getFilteredUsers(list: any[]) {

    if (!this.searchTerm) return list;

    const term = this.searchTerm.toLowerCase();

    return list.filter(user => {

      const fullName =
        (user.name || '') + ' ' +
        (user.lastNameFather || '') + ' ' +
        (user.lastNameMother || '');

      return (
        fullName.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );

    });
  }


  getPlanName(planId: string | undefined): string {

    if (!planId) return '';

    const plan = this.plans.find(p => p.id === planId);

    return plan ? plan.name : '';

  }
  async assignPlan(user: any) {

    if (!user.selectedPlan) return;
    const currentTab = this.activeTabIndex; // 🔥 GUARDAR TAB ACTUAL
    await this.usersService.assignPlanToUser(
      user.uid,
      user.selectedPlan
    );

    user.planId = user.selectedPlan;
    user.selectedPlan = null;

    await this.loadUsers();
    this.activeTabIndex = currentTab; // 🔥 RESTAURA TAB
  }

  async loadPlans() {
    this.plans = await this.plansService.getAllPlans();
  }

  async loadLastPayment(user: any) {

    console.log('🔎 Buscando último pago para:', user.uid);

    const lastPayment =
      await this.paymentsService.getLastPayment(user.uid);

    console.log('💰 Último pago recibido:', lastPayment);

    if (lastPayment) {
      user.lastPaymentAmount = lastPayment['amount'];
      console.log('✅ Monto asignado al user:', user.lastPaymentAmount);
    } else {
      user.lastPaymentAmount = null;
      console.log('⚠️ No se encontró pago');
    }

  }
  async assignRoutine(user: any) {

    if (!user.selectedRoutine) return;

    const routine = this.routines.find(r => r.id === user.selectedRoutine);
    if (!routine) return;

    const adminUid = this.auth.currentUser?.uid;
    if (!adminUid) return;

    // 🔹 Confirmación antes de asignar
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: {
        title: 'Asignar Rutina',
        message: `¿Deseas asignar la rutina "${routine.name}" a ${user.name}?`,
        confirmText: 'Asignar',
        cancelText: 'Cancelar'
      }
    });

    const confirmed = await dialogRef.afterClosed().toPromise();

    if (!confirmed) return;

    const startDate = new Date();
    const endDate = new Date();

    if (routine.durationType === 'weeks') {
      endDate.setDate(endDate.getDate() + (routine.durationValue * 7));
    } else {
      endDate.setMonth(endDate.getMonth() + routine.durationValue);
    }

    try {

      // 🔥 1️⃣ Desactivar rutina anterior
      await this.assignedRoutinesService.deactivateCurrentRoutine(user.uid);

      // 🔥 2️⃣ Crear nueva
      await this.assignedRoutinesService.assignRoutine({
        userId: user.uid,
        routineId: routine.id,
        startDate,
        endDate,
        assignedBy: adminUid
      });

      // 🔥 3️⃣ Guardar referencia rápida
      await this.usersService.updateUser(user.uid, {
        assignedRoutineId: routine.id
      });

      user.assignedRoutineId = routine.id;
      user.selectedRoutine = null;

      // 🔹 Modal de éxito
      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Rutina Asignada',
          message: 'La rutina fue asignada correctamente.',
          confirmText: 'OK',
          hideCancel: true
        }
      });

    } catch (error) {

      console.error('❌ Error asignando rutina:', error);

      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Error',
          message: 'Ocurrió un error al asignar la rutina.',
          confirmText: 'Cerrar',
          hideCancel: true
        }
      });

    }
  }


  async uploadAdminPhoto(user: any, event: any) {

    const file = event.target.files[0];
    if (!file) return;

    // 🔒 Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }

    this.uploadingPhotoUserId = user.uid;

    try {

      const oldPhotoURL = user.adminPhotoURL || null;

      // 🔥 Redimensionar antes de subir
      const resizedFile = await this.resizeImage(file, 600);

      const filePath = `admin-photos/${user.uid}_${Date.now()}`;
      const storageRef = ref(this.storage, filePath);

      await uploadBytes(storageRef, resizedFile);

      const downloadURL = await getDownloadURL(storageRef);

      await this.usersService.updateUser(user.uid, {
        adminPhotoURL: downloadURL
      });

      user.adminPhotoURL = downloadURL;

      // 🔥 Eliminar foto anterior
      if (oldPhotoURL) {
        await this.deleteOldAdminPhoto(oldPhotoURL);
      }

    } catch (error) {
      console.error('Error subiendo foto admin:', error);
    }

    this.uploadingPhotoUserId = null;
  }


  async deleteOldAdminPhoto(url: string) {
    try {
      const photoRef = ref(this.storage, url);
      await deleteObject(photoRef);
    } catch (error) {
      console.warn('No se pudo borrar la foto anterior:', error);
    }
  }

  async confirmChangeAdminPhoto(user: any, fileInput: HTMLInputElement) {

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '350px',
      data: {
        title: 'Cambiar Foto Oficial',
        message: '¿Deseas cambiar la foto oficial de este usuario?'
      }
    });

    const result = await dialogRef.afterClosed().toPromise();

    if (result) {
      fileInput.click();
    }
  }

  async resizeImage(file: File, maxSize = 600): Promise<File> {

    return new Promise((resolve) => {

      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e: any) => {
        img.src = e.target.result;
      };

      img.onload = () => {

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.8);

      };

      reader.readAsDataURL(file);
    });
  }
}