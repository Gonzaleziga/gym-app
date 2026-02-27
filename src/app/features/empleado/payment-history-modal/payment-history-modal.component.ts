import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PaymentsService } from '../../../core/services/payments.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-payment-history-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './payment-history-modal.component.html',
  styleUrl: './payment-history-modal.component.scss'
})
export class PaymentHistoryModalComponent implements OnInit {

  payments: any[] = [];
  loading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private paymentsService: PaymentsService,
    private usersService: UsersService,
    private dialogRef: MatDialogRef<PaymentHistoryModalComponent>
  ) { }

  async ngOnInit() {

    const payments =
      await this.paymentsService.getPaymentsByUser(this.data.uid);

    const allUsers =
      await this.usersService.getAllUsers();

    this.payments = payments.map((p: any) => {

      const creator = allUsers.find(u => u.uid === p.createdBy);

      return {
        ...p,
        createdByName: creator
          ? `${creator.name} ${creator.lastNameFather}`
          : 'Desconocido'
      };
    });

    this.loading = false;
  }

  close() {
    this.dialogRef.close();
  }
}