import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { UsersService } from '../../../../core/services/users.service';
import { PaymentsService } from '../../../../core/services/payments.service';

@Component({
  selector: 'app-finance-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './finance-detail-modal.component.html',
  styleUrl: './finance-detail-modal.component.scss'
})
export class FinanceDetailModalComponent implements OnInit {

  title = '';
  items: any[] = [];
  loading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private usersService: UsersService,
    private paymentsService: PaymentsService
  ) { }

  async ngOnInit() {

    switch (this.data.type) {

      case 'income':
        this.title = 'Reporte Financiero del Mes';

        const monthlyPayments = await this.paymentsService.getMonthlyPayments();
        const users = await this.usersService.getAllUsers();

        // 🔥 Unir pagos con usuarios
        const enrichedPayments = monthlyPayments.map((payment: any) => {

          const user = users.find((u: any) => u.uid === payment.userId);

          return {
            ...payment,
            userName: user
              ? `${user.name} ${user.lastNameFather}`
              : 'Usuario no encontrado'
          };
        });

        const total = enrichedPayments.reduce((sum: number, p: any) => {
          return sum + (p.amount || 0);
        }, 0);

        this.items = enrichedPayments;
        this.data.total = total;

        break;


      case 'payments':
        this.title = 'Historial de Pagos del Mes';

        const payments = await this.paymentsService.getMonthlyPayments();
        const allUsers = await this.usersService.getAllUsers();

        this.items = payments.map((payment: any) => {

          const user = allUsers.find((u: any) => u.uid === payment.userId);

          return {
            ...payment,
            userName: user
              ? `${user.name} ${user.lastNameFather}`
              : 'Usuario no encontrado'
          };
        });

        break;

      case 'active':
        this.title = 'Miembros Activos';
        this.items = await this.usersService.getUsersByMembershipStatus('active');
        break;

      case 'expired':
        this.title = 'Miembros Vencidos';
        this.items = await this.usersService.getUsersByMembershipStatus('expired');
        break;

      case 'expiring':
        this.title = 'Vencen en 7 días';
        this.items = await this.usersService.getUsersExpiringSoon();
        break;
    }

    this.loading = false;
  }
}