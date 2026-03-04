import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssignedRoutinesService } from '../../../core/services/assigned-routines.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/users.service';
import { RoutinesService } from '../../../core/services/routines.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-assigned-routines',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './assigned-routines.component.html',
  styleUrl: './assigned-routines.component.scss'
})
export class AssignedRoutinesComponent implements OnInit {

  clients: any[] = [];
  routines: any[] = [];
  loading = true;
  assignments: any[] = [];

  constructor(
    private assignedRoutinesService: AssignedRoutinesService,
    private authService: AuthService,
    private routinesService: RoutinesService,
    private router: Router,
    private auth: Auth,
    private usersService: UsersService
  ) { }
  async ngOnInit() {

    const currentUser = this.auth.currentUser;
    if (!currentUser) return;

    // 🔹 Traer asignaciones (según rol)
    const assignments =
      await this.assignedRoutinesService
        .getActiveAssignmentsByEmployee(currentUser.uid);

    // 🔹 Traer todos los usuarios
    const users = await this.usersService.getAllUsers();

    // 🔹 Traer todas las rutinas
    this.routines = await this.routinesService.getAllRoutines();

    // 🔹 Mezclar información
    this.assignments = assignments.map((a: any) => {

      const user = users.find(u => u.uid === a.userId);

      return {
        ...a,
        fullName: user
          ? `${user.name} ${user.lastNameFather} ${user.lastNameMother}`
          : 'Desconocido'
      };

    });
    this.loading = false;
  }

  getRoutineName(id: string) {
    return this.routines.find(r => r.id === id)?.name || 'Sin nombre';
  }
  async goToClient(uid: string) {

    const currentUser = this.auth.currentUser;
    if (!currentUser) return;

    const userData =
      await this.usersService.getUserById(currentUser.uid);

    if (userData?.['role'] === 'admin') {

      this.router.navigate(['/admin/users'], {
        queryParams: { uid, tab: 'clients' }
      });

    } else if (userData?.['role'] === 'employee') {

      this.router.navigate(['/employee/users'], {
        queryParams: { uid, tab: 'clients' }
      });

    }

  }
}