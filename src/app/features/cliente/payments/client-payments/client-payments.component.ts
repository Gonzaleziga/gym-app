import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Auth } from '@angular/fire/auth';
import { PaymentsService } from '../../../../core/services/payments.service';
import { jsPDF } from 'jspdf';
import { UsersService } from '../../../../core/services/users.service';

@Component({
  selector: 'app-client-payments',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './client-payments.component.html',
  styleUrl: './client-payments.component.scss'
})
export class ClientPaymentsComponent implements OnInit {

  private auth = inject(Auth);
  private paymentsService = inject(PaymentsService);
  private usersService = inject(UsersService);

  currentUserData: any;
  payments: any[] = [];
  loading = true;
  totalPaid = 0;

  async ngOnInit() {

    this.loading = true;

    try {

      const currentUser = this.auth.currentUser;
      if (!currentUser) return;

      const snap = await this.usersService.getUser(currentUser.uid);

      if (snap.exists()) {
        this.currentUserData = snap.data();
      }

      this.payments = await this.paymentsService.getUserPayments(currentUser.uid);

      this.totalPaid = this.payments.reduce(
        (sum: number, p: any) => sum + (p.amount || 0),
        0
      );

    } catch (error) {
      console.error("Error cargando pagos:", error);
    } finally {
      this.loading = false; // 🔥 SIEMPRE se apaga
    }
  }



  downloadReceipt(payment: any) {

    if (!this.currentUserData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const logo = new Image();
    logo.src = '/images/logo.jpg';

    logo.onload = () => {

      doc.addImage(logo, 'JPG', 20, 15, 30, 30);

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text("Gym Pro", pageWidth / 2, 25, { align: 'center' });

      doc.setFontSize(14);
      doc.text("Recibo de Pago", pageWidth / 2, 35, { align: 'center' });

      doc.line(20, 45, pageWidth - 20, 45);

      doc.setFillColor(245, 245, 245);
      doc.rect(20, 55, pageWidth - 40, 60, 'F');

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      const startY = 65;

      doc.text(`Cliente:`, 25, startY);
      doc.text(
        `${this.currentUserData.name} ${this.currentUserData.lastNameFather || ''}`,
        80,
        startY
      );

      doc.text(`Monto:`, 25, startY + 10);
      doc.text(`$${payment.amount}`, 80, startY + 10);

      doc.text(`Fecha de pago:`, 25, startY + 20);
      doc.text(
        payment.createdAt.toDate().toLocaleDateString(),
        80,
        startY + 20
      );

      doc.text(`Vigencia:`, 25, startY + 30);
      doc.text(
        `${payment.startDate.toDate().toLocaleDateString()} - ${payment.endDate.toDate().toLocaleDateString()}`,
        80,
        startY + 30
      );

      doc.text(`Meses pagados:`, 25, startY + 40);
      doc.text(`${payment.months}`, 80, startY + 40);

      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(
        "Gracias por confiar en Gym Pro",
        pageWidth / 2,
        135,
        { align: 'center' }
      );

      doc.save(`recibo-${payment.id}.pdf`);
    };
  }
}