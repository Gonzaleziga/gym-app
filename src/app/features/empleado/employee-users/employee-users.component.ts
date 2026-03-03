import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { UsersService } from '../../../core/services/users.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { RoutinesService } from '../../../core/services/routines.service';
import { PlansService } from '../../../core/services/plans.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PaymentHistoryModalComponent } from '../payment-history-modal/payment-history-modal.component';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { deleteObject } from '@angular/fire/storage';
import { ConfirmModalComponent }
  from '../../shared/confirm-modal/confirm-modal.component';
import { Timestamp } from '@angular/fire/firestore';
import { AssignedRoutinesService } from '../../../core/services/assigned-routines.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-employee-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogModule,


  ],
  templateUrl: './employee-users.component.html',
  styleUrl: './employee-users.component.scss'
})
export class EmployeeUsersComponent implements OnInit {

  loading = true;

  clients: any[] = [];
  visitors: any[] = [];
  routines: any[] = [];
  activeTabIndex = 0;
  expandedUserId: string | null = null;
  searchTerm = '';
  plans: any[] = []; // si luego cargas planes
  uploadingPhotoUserId: string | null = null;
  membershipFilter: '' | 'active' | 'expired' | 'none' | 'upcoming' = '';
  sortByNewest: boolean = true;


  constructor(
    private usersService: UsersService,
    private paymentsService: PaymentsService,
    private routinesService: RoutinesService,
    private auth: Auth,
    private plansService: PlansService,
    private dialog: MatDialog,
    private storage: Storage,
    private assignedRoutinesService: AssignedRoutinesService,
    private route: ActivatedRoute


  ) { }

  async ngOnInit() {

    await this.loadData();

    this.route.queryParams.subscribe(params => {

      const uid = params['uid'];
      const tab = params['tab'];

      if (tab === 'clients') {
        this.activeTabIndex = 0; // 👈 OJO
        // En empleado Clientes es el primer tab
      }

      if (uid) {

        this.searchTerm = '';
        this.expandedUserId = uid;

        setTimeout(() => {
          const element = document.getElementById(uid);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 500);
      }

    });

  }

  async loadData() {

    this.loading = true;

    const allUsers = await this.usersService.getAllUsers();

    this.clients = allUsers.filter((u: any) => u.role === 'client');
    this.visitors = allUsers.filter((u: any) => u.role === 'visitor');

    // 🔥 Rutinas activas creadas en admin
    this.routines = await this.routinesService.getActiveRoutines();
    // 🔥 Cargar planes
    this.plans = await this.plansService.getAllPlans();
    console.log('PLANES:', this.plans);
    this.loading = false;
  }

  // ==============================
  // 🔽 UI Helpers
  // ==============================

  toggleDetails(uid: string) {
    this.expandedUserId =
      this.expandedUserId === uid ? null : uid;
  }

  getFilteredUsers(list: any[]) {

    let filtered = [...list];

    const today = new Date();

    // 🔎 BUSCADOR POR NOMBRE / EMAIL
    if (this.searchTerm) {

      const term = this.searchTerm.toLowerCase();

      filtered = filtered.filter(user => {

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

    // 🔎 FILTRO POR MEMBRESÍA
    if (this.membershipFilter === 'active') {
      filtered = filtered.filter(u => u.membershipStatus === 'active');
    }

    if (this.membershipFilter === 'expired') {
      filtered = filtered.filter(u => u.membershipStatus === 'expired');
    }

    if (this.membershipFilter === 'none') {
      filtered = filtered.filter(u => u.membershipStatus === 'none');
    }

    if (this.membershipFilter === 'upcoming') {
      filtered = filtered.filter(u => {
        if (!u.membershipEnd) return false;

        const end = u.membershipEnd?.toDate?.() ?? new Date(u.membershipEnd);
        const diff =
          (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

        return diff <= 7 && diff > 0;
      });
    }

    // 📅 ORDENAR POR FECHA DE CREACIÓN
    filtered.sort((a, b) => {

      const dateA = a.createdAt?.toDate?.() ?? new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() ?? new Date(b.createdAt);

      return this.sortByNewest
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    return filtered;
  }

  // ==============================
  // 💳 PLANES
  // ==============================

  async assignPlan(user: any) {

    if (!user.selectedPlan) return;

    const plan = this.plans.find(p => p.id === user.selectedPlan);
    if (!plan) return;

    try {

      await this.usersService.updateUser(user.uid, {
        planId: plan.id,
        membershipStatus: 'none',   // 🔥 no activa aún
        membershipStart: null,
        membershipEnd: null
      });

      // 🔥 Actualizamos en memoria
      user.planId = plan.id;
      user.membershipStatus = 'none';
      user.membershipStart = null;
      user.membershipEnd = null;
      user.selectedPlan = null;

      // ✅ Modal de éxito
      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Plan Asignado',
          message: 'Plan asignado correctamente. Ahora puedes registrar el pago.',
          confirmText: 'OK',
          hideCancel: true
        }
      });

    } catch (error) {

      console.error('Error asignando plan:', error);

      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Error',
          message: 'Ocurrió un error al asignar el plan.',
          confirmText: 'Cerrar',
          hideCancel: true
        }
      });

    }
  }



  async registerPayment(user: any) {

    if (!user.planId) return;

    const plan = this.plans.find(p => p.id === user.planId);
    if (!plan) return;

    const employeeUid = this.auth.currentUser?.uid;
    if (!employeeUid) return;

    try {

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.durationMonths);

      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      const createdTimestamp = Timestamp.fromDate(new Date());

      await this.paymentsService.registerPayment({
        userId: user.uid,
        amount: plan.price,
        months: plan.durationMonths,
        startDate: startTimestamp,
        endDate: endTimestamp,
        createdAt: createdTimestamp,
        createdBy: employeeUid
      });

      console.log('Pago guardado');

      // 🔥 Actualizar membresía
      await this.usersService.updateUser(user.uid, {
        membershipStatus: 'active',
        membershipStart: startTimestamp,
        membershipEnd: endTimestamp,
        lastPaymentAmount: plan.price
      });

      // 🔥 Actualizar en memoria
      user.membershipStatus = 'active';
      user.membershipStart = startTimestamp;
      user.membershipEnd = endTimestamp;
      user.lastPaymentAmount = plan.price;

      // ✅ Modal de éxito elegante
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

      console.error('Error registrando pago:', error);

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
  // ==============================
  // 💪 RUTINAS
  // ==============================
  async assignRoutine(user: any) {

    if (!user.selectedRoutine) return;

    const routine = this.routines.find(r => r.id === user.selectedRoutine);
    if (!routine) return;

    const employeeUid = this.auth.currentUser?.uid;
    if (!employeeUid) return;

    try {

      const startDate = new Date();
      const endDate = new Date();

      if (routine.durationType === 'weeks') {
        endDate.setDate(endDate.getDate() + (routine.durationValue * 7));
      } else {
        endDate.setMonth(endDate.getMonth() + routine.durationValue);
      }

      // 🔥 1️⃣ Desactivar rutina anterior
      await this.assignedRoutinesService.deactivateCurrentRoutine(user.uid);

      // 🔥 2️⃣ Crear nueva asignación
      await this.assignedRoutinesService.assignRoutine({
        userId: user.uid,
        routineId: routine.id,
        startDate,
        endDate,
        assignedBy: employeeUid
      });

      // 🔥 3️⃣ Guardar referencia rápida en usuario
      await this.usersService.updateUser(user.uid, {
        assignedRoutineId: routine.id
      });

      // 🔥 Actualizar en memoria
      user.assignedRoutineId = routine.id;
      user.selectedRoutine = null;

      // ✅ Modal éxito
      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Rutina Asignada',
          message: `La rutina "${routine.name}" fue asignada correctamente.`,
          confirmText: 'OK',
          hideCancel: true
        }
      });

    } catch (error) {

      console.error('Error asignando rutina:', error);

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


  getPlanName(planId: string): string {
    const plan = this.plans?.find(p => p.id === planId);
    return plan ? plan.name : 'Sin plan';
  }



  // ==============================
  // 🔄 VISITOR → CLIENT
  // ==============================

  async convertToClient(user: any) {

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: {
        title: 'Convertir a Cliente',
        message: `¿Deseas convertir a ${user.name} en cliente?`,
        confirmText: 'Convertir',
        cancelText: 'Cancelar'
      }
    });

    const confirmed = await dialogRef.afterClosed().toPromise();

    if (!confirmed) return;

    try {

      await this.usersService.updateUser(user.uid, {
        role: 'client',
        membershipStatus: 'none',
        planId: null,
        membershipStart: null,
        membershipEnd: null,
        lastPaymentAmount: null
      });

      await this.loadData();

      // 🔥 Modal de éxito
      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Usuario Actualizado',
          message: `${user.name} ahora es cliente sin membresía.`,
          confirmText: 'OK',
          hideCancel: true
        }
      });

    } catch (error) {

      console.error('Error convirtiendo usuario:', error);

      this.dialog.open(ConfirmModalComponent, {
        width: '350px',
        data: {
          title: 'Error',
          message: 'Ocurrió un error al convertir el usuario.',
          confirmText: 'Cerrar',
          hideCancel: true
        }
      });

    }
  }
  viewPayments(user: any) {
    this.dialog.open(PaymentHistoryModalComponent, {
      width: '650px',
      data: {
        uid: user.uid,
        name: user.name,
        lastNameFather: user.lastNameFather,
        lastNameMother: user.lastNameMother
      }
    });
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

  async deleteOldAdminPhoto(url: string) {
    try {
      const photoRef = ref(this.storage, url);
      await deleteObject(photoRef);
    } catch (error) {
      console.warn('No se pudo borrar la foto anterior:', error);
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