import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlansService } from '../../../../core/services/plans.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-admin-plans',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './admin-plans.component.html',
  styleUrl: './admin-plans.component.scss'
})
export class AdminPlansComponent implements OnInit {

  plans: any[] = [];
  loading = true;

  newPlan = {
    name: '',
    price: 0,
    durationMonths: 1,
    type: 'monthly',
    isActive: true
  };
  editingPlanId: string | null = null;
  constructor(private plansService: PlansService) { }

  async ngOnInit() {
    await this.loadPlans();
  }

  async loadPlans() {
    this.loading = true;
    this.plans = await this.plansService.getAllPlans();
    this.loading = false;
  }

  async createPlan() {

    if (!this.newPlan.name || this.newPlan.price <= 0) {
      alert('Completa los datos correctamente');
      return;
    }

    await this.plansService.createPlan({
      ...this.newPlan,
      price: Number(this.newPlan.price),
      durationMonths: Number(this.newPlan.durationMonths)
    });

    // Reset limpio
    this.newPlan = {
      name: '',
      price: 0,
      durationMonths: 1,
      type: 'monthly',
      isActive: true
    };

    await this.loadPlans();
  }

  async togglePlan(plan: any) {
    await this.plansService.togglePlanStatus(plan.id, plan.isActive);
    await this.loadPlans();
  }

  startEdit(plan: any) {
    this.editingPlanId = plan.id;
  }

  cancelEdit() {
    this.editingPlanId = null;
  }

  async saveEdit(plan: any) {

    await this.plansService.updatePlan(plan.id, {
      name: plan.name,
      price: Number(plan.price),
      durationMonths: Number(plan.durationMonths),
      type: plan.type
    });

    this.editingPlanId = null;
    await this.loadPlans();
  }
}