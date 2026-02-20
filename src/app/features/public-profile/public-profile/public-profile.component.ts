import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { UsersService } from '../../../core/services/users.service';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './public-profile.component.html',
  styleUrl: './public-profile.component.scss'
})
export class PublicProfileComponent implements OnInit {
  private usersService = inject(UsersService);
  private router = inject(Router);
  private auth = inject(Auth);

  profiles: any[] = [];
  loading = true;

  async ngOnInit() {

    const currentUser = this.auth.currentUser?.uid;

    const allProfiles = await this.usersService.getPublicProfiles();

    this.profiles = allProfiles.filter(
      profile => profile["uid"] !== currentUser
    );

    this.loading = false;
  }

  goToProfile(user: any) {
    this.router.navigate(['/profile', user.uid]);
  }
}
