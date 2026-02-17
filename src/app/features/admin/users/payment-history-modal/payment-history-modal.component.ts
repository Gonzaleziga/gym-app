import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { UsersService } from '../../../../core/services/users.service';
import { MatIconModule } from '@angular/material/icon';

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
    private usersService: UsersService,
    private dialogRef: MatDialogRef<PaymentHistoryModalComponent>
  ) { }

  async ngOnInit() {
    this.payments = await this.usersService.getUserPayments(this.data.uid);
    this.loading = false;
  }

  close() {
    this.dialogRef.close();
  }
}