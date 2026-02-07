import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private storageKey = 'theme';

  initTheme(): void {
    const savedTheme = localStorage.getItem(this.storageKey);

    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    }
  }

  toggleTheme(): void {
    const isDark = document.body.classList.toggle('dark-theme');

    localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
  }

  isDarkMode(): boolean {
    return document.body.classList.contains('dark-theme');
  }
}