import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { PrivateSidebarComponent } from '../../components/private-sidebar/private-sidebar.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { inject, signal } from '@angular/core';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, RouterModule, PrivateSidebarComponent, MatIconModule, CommonModule],
  templateUrl: './private-layout.component.html',
  styleUrl: './private-layout.component.scss'
})
export class PrivateLayoutComponent {
  isMobile = signal(false);

  private breakpoint = inject(BreakpointObserver);

  constructor() {
    this.breakpoint.observe(['(max-width: 1023px)'])
      .subscribe(result => {
        this.isMobile.set(result.matches);
      });
  }
}
