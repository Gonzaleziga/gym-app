import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private darkClass = 'dark-theme';

  constructor() { }

  /** Alterna entre claro y oscuro */
  toggleTheme(): void {
    document.documentElement.classList.toggle(this.darkClass);

    const isDark = document.documentElement.classList.contains(this.darkClass);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  /** Carga el tema guardado al iniciar la app */
  loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add(this.darkClass);
    }
  }

  /** (Opcional) Saber si está activo */
  isDarkMode(): boolean {
    return document.documentElement.classList.contains(this.darkClass);
  }
}