import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './public-profile.component.html',
  styleUrl: './public-profile.component.scss'
})
export class PublicProfileComponent implements OnInit {
  private usersService = inject(UsersService);

  profiles: any[] = [];
  loading = true;

  async ngOnInit() {
    this.profiles = await this.usersService.getPublicProfiles();
    console.log('🌍 PUBLIC PROFILES:', this.profiles);
    this.loading = false;
  }
}
