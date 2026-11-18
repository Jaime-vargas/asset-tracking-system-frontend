import { UiTag } from '../ui-tag/ui-tag';
import { DatePipe } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMenuDirective, NzMenuItemComponent } from 'ng-zorro-antd/menu';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { version as appVersion } from '../../../../package.json';
import { RELEASE_NOTES } from '../../release-notes';
import { AuthService } from '../../services/auth-service';

declare const APP_BUILD_DATE: string;

@Component({
  selector: 'app-menu-sidebar-component',
  imports: [NzMenuDirective, RouterLinkActive, RouterLink, NzMenuItemComponent, NzIconDirective, NzModalModule, DatePipe, UiTag],
  templateUrl: './menu-sidebar-component.html',
  styleUrl: './menu-sidebar-component.css',
})
export class MenuSidebarComponent {
  private authService = inject(AuthService);
  protected router = inject(Router);
  aboutOpened = output<void>();
  protected aboutOpen = signal(false);
  protected readonly releaseNotes = RELEASE_NOTES;
  protected readonly buildDate = typeof APP_BUILD_DATE === 'string' ? APP_BUILD_DATE : null;
  protected readonly version = appVersion + '+' + (this.buildDate?.replace(/\D/g, '') ?? 'dev');

  protected openAbout() {
    this.aboutOpen.set(true);
    this.aboutOpened.emit();
  }

  isProjectWorkspace = () => /^\/clients\/[^/]+\/[^/]+\/branches\/[^/]+\/[^/]+\/hardware(?:[?#]|$)/.test(this.router.url);

  currentRole = () => this.authService.getUserRole();
}
