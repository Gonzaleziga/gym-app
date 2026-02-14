import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ThemeService } from './core/services/theme.service';
import { Auth, authState } from '@angular/fire/auth';
import { UsersService } from './core/services/users.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  private auth = inject(Auth);

  constructor(
    private themeService: ThemeService,
    private usersService: UsersService,
    private router: Router
  ) { }

  ngOnInit() {
    this.themeService.initTheme();

    // 🔥 ESCUCHAR CAMBIOS DE LOGIN
    authState(this.auth).subscribe(async user => {

      if (!user) return;

      const snap = await this.usersService.getUser(user.uid);

      if (!snap.exists()) return;

      const data = snap.data();

      // 🚨 FORZAR LOGOUT
      if (data?.['forceLogout']) {

        alert('Sesión cerrada por el administrador');

        // 🔥 Resetear bandera
        await this.usersService.updateUser(user.uid, {
          forceLogout: false
        });

        await this.auth.signOut();
        this.router.navigateByUrl('/login');
      }

      // 🚨 USUARIO INACTIVO
      if (data?.['status'] === 'inactive') {

        alert('Tu cuenta está desactivada');

        await this.auth.signOut();
        this.router.navigateByUrl('/');
      }

    });
  }
}