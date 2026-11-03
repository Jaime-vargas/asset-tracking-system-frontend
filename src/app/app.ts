import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

// Components
import { MenuSidebarComponent } from './components/menu-sidebar-component/menu-sidebar-component';

import { CurrentUserComponent } from './components/current-user-component/current-user-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuSidebarComponent, CurrentUserComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  clientArea = computed(() => {
    const path = this.currentUrl().split(/[?#]/)[0].split('/').filter(Boolean);
    return path[0] === 'clients' && (path.length === 1 || path.length === 3);
  });
  loginArea = computed(() => ['/', '/login', ''].includes(this.currentUrl().split(/[?#]/)[0]));
  menuOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));
  }
}
