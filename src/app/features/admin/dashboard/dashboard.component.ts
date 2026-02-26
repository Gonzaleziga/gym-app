import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '@angular/fire/auth';
import { UsersService } from '../../../core/services/users.service';
import { UserSessionService } from '../../../core/services/user-session.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  role: string | null = null;
  userName: string | null = null;
  stats: any = null;

  // 🔥 CONTROL DEL MODAL
  showModal = false;
  selectedDetailType: string | null = null;
  detailList: any[] = [];
  // para mostrar el nombre completo en Dashboard
  searchTerm: string = '';
  filteredDetailList: any[] = [];
  startDateFilter: string | null = null;
  endDateFilter: string | null = null;
  adminFilter: string | null = null;
  adminList: string[] = [];


  constructor(
    private auth: Auth,
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router,
    private userSession: UserSessionService,
    private paymentsService: PaymentsService
  ) { }

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (!user) return;
    // 🔹 Traemos el documento completo
    const snap = await this.usersService.getUser(user.uid);
    if (!snap.exists()) return;
    const data = snap.data();
    // 🔹 Guardamos rol
    this.role = data?.['role'] ?? null;
    // 🔹 Nombre completo
    const name = data?.['name'] ?? '';
    const lastNameFather = data?.['lastNameFather'] ?? '';
    const lastNameMother = data?.['lastNameMother'] ?? '';
    this.userName = `${name} ${lastNameFather} ${lastNameMother}`.trim();
    // 🔥 SOLO ADMIN carga stats
    if (this.role === 'admin') {
      this.stats = await this.usersService.getFinancialStats();
      console.log('📊 STATS:', this.stats);
    }
  }
  // 🔥 ABRIR MODAL
  async openDetails(type: string) {

    this.selectedDetailType = type;
    this.showModal = true;
    this.detailList = [];

    const users = await this.usersService.getAllUsers();
    const payments = await this.paymentsService.getAllPayments();// 👈 nuevo método

    console.log('USERS:', users);
    console.log('PAYMENTS:', payments);

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    switch (type) {

      case 'income':

        this.detailList = payments
          .filter((p: any) => {
            const createdAt = p.createdAt?.toDate?.() ?? new Date(p.createdAt);
            return createdAt >= firstDayOfMonth;
          })
          .map((p: any) => {

            const client = users.find((u: any) => u.uid === p.userId);
            const admin = users.find((u: any) => u.uid === p.createdBy);

            return {
              ...p,
              userName: client
                ? `${client.name ?? ''} ${client.lastNameFather ?? ''}`.trim()
                : 'Usuario no encontrado',

              createdByName: admin
                ? `${admin.name ?? ''} ${admin.lastNameFather ?? ''}`.trim()
                : 'Admin desconocido'
            };
          });

        // 🔥 ESTA LÍNEA ES LA QUE FALTA
        this.filteredDetailList = [...this.detailList];

        break;

      case 'payments':

        this.detailList = payments
          .filter((p: any) => {
            const createdAt = p.createdAt?.toDate?.() ?? new Date(p.createdAt);
            return createdAt >= firstDayOfMonth;
          })
          .map((p: any) => {

            const client = users.find((u: any) => u.uid === p.userId);
            const admin = users.find((u: any) => u.uid === p.createdBy);

            return {
              ...p,
              userName: client
                ? `${client.name} ${client.lastNameFather}`
                : 'Usuario no encontrado',

              createdByName: admin
                ? `${admin.name} ${admin.lastNameFather}`
                : 'Admin desconocido'
            };
          });

        break;
      case 'history': {

        // 🔄 Resetear filtros cada vez que se abre
        this.searchTerm = '';
        this.startDateFilter = null;
        this.endDateFilter = null;

        // 🔽 Ordenar por fecha (más reciente primero)
        const sortedPayments = [...payments].sort((a: any, b: any) => {
          const dateA = a.createdAt?.toDate?.() ?? new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() ?? new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        // 🧠 Enriquecer con nombres
        this.detailList = sortedPayments.map((p: any) => {

          const client = users.find((u: any) => u.uid === p.userId);
          const admin = users.find((u: any) => u.uid === p.createdBy);

          return {
            ...p,
            userName: client
              ? `${client.name ?? ''} ${client.lastNameFather ?? ''}`.trim()
              : 'Usuario no encontrado',

            createdByName: admin
              ? `${admin.name ?? ''} ${admin.lastNameFather ?? ''}`.trim()
              : 'Desconocido'
          };
        });

        // 🔥 Copia inicial para filtros
        this.filteredDetailList = [...this.detailList];

        // 🔥 Obtener lista única de quienes registraron pagos
        this.adminList = [
          ...new Set(
            this.detailList
              .map(p => p.createdByName)
              .filter(name => name && name !== 'Desconocido')
          )
        ];

        break;
      }

      case 'active':

        this.detailList = users
          .filter((u: any) => u.membershipStatus === 'active')
          .map((u: any) => {

            const startDate = u.membershipStart?.toDate?.() ?? new Date(u.membershipStart);
            const endDate = u.membershipEnd?.toDate?.() ?? new Date(u.membershipEnd);

            const today = new Date();

            const diffDays = Math.ceil(
              (endDate.getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24)
            );

            return {
              ...u,
              fullName: `${u.name ?? ''} ${u.lastNameFather ?? ''} ${u.lastNameMother ?? ''}`.trim(),
              membershipStartParsed: startDate,
              membershipEndParsed: endDate,
              remainingDays: diffDays
            };
          });

        this.filteredDetailList = [...this.detailList];

        break;

      case 'expired':
        this.detailList = users.filter((u: any) =>
          u.membershipStatus === 'expired'
        );
        this.filteredDetailList = [...this.detailList];
        break;

      case 'upcoming':

        this.detailList = users.filter((u: any) => {
          if (!u.membershipEnd) return false;

          const endDate = u.membershipEnd?.toDate?.() ?? new Date(u.membershipEnd);
          const diffDays =
            (endDate.getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24);

          return diffDays <= 7 && diffDays > 0;
        });

        // 🔥 IMPORTANTE: copiar para el modal
        this.filteredDetailList = [...this.detailList];

        break;
    }
  }

  // 🔥 CERRAR MODAL
  closeModal() {
    this.showModal = false;
    this.selectedDetailType = null;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }
  filterHistory() {

    let filtered = [...this.detailList];

    // 🔎 Filtro por nombre
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.userName?.toLowerCase().includes(term)
      );
    }

    // 📅 Filtro por fecha inicio (LOCAL)
    if (this.startDateFilter) {

      const [year, month, day] = this.startDateFilter.split('-');

      const start = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        0, 0, 0, 0
      );

      filtered = filtered.filter(item => {
        const created = item.createdAt?.toDate?.() ?? new Date(item.createdAt);
        return created >= start;
      });
    }

    // 📅 Filtro por fecha fin (LOCAL)
    if (this.endDateFilter) {

      const [year, month, day] = this.endDateFilter.split('-');

      const end = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        23, 59, 59, 999
      );

      filtered = filtered.filter(item => {
        const created = item.createdAt?.toDate?.() ?? new Date(item.createdAt);
        return created <= end;
      });
    }
    // 👨‍💼 Filtro por admin
    if (this.adminFilter) {
      filtered = filtered.filter(item =>
        item.createdByName === this.adminFilter
      );
    }

    this.filteredDetailList = filtered;
  }
  exportHistoryToPDF() {

    if (!this.filteredDetailList?.length) return;

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.width;

    // 🔹 LOGO
    const img = new Image();
    img.src = '/images/logo.jpg';

    img.onload = () => {

      // 🔥 Agregar logo
      doc.addImage(img as HTMLImageElement, 'JPEG', 14, 10, 25, 25);

      // 🔹 Nombre del Gym
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('GYM PRO', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Historial de Pagos', pageWidth / 2, 28, { align: 'center' });

      // 🔹 Línea separadora
      doc.setLineWidth(0.5);
      doc.line(14, 35, pageWidth - 14, 35);

      // 🔹 Tabla elegante
      autoTable(doc, {
        startY: 45,

        head: [[
          'Cliente',
          'Registrado por',
          'Monto',
          'Meses',
          'Fecha'
        ]],

        body: this.filteredDetailList.map(item => [
          item.userName,
          item.createdByName,
          `$${Number(item.amount).toLocaleString('es-MX')}`,
          item.months,
          item.createdAt?.toDate?.().toLocaleDateString()
        ]),

        theme: 'striped',

        headStyles: {
          fillColor: [33, 150, 243],
          textColor: 255,
          fontStyle: 'bold'
        },

        styles: {
          fontSize: 9,
          cellPadding: 3
        },

        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      // 🔹 Total elegante
      const finalY = (doc as any).lastAutoTable.finalY || 45;

      const total = this.filteredDetailList.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      );

      doc.setFillColor(240, 240, 240);
      doc.rect(14, finalY + 8, pageWidth - 28, 12, 'F');

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Total: $${total.toLocaleString('es-MX')}`,
        16,
        finalY + 16
      );

      // 🔹 Guardar
      doc.save(`historial-${Date.now()}.pdf`);
    };
  }
}