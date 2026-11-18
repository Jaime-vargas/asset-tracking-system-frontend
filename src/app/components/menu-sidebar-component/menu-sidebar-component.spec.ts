import { version } from '../../../../package.json';
import { RELEASE_NOTES } from '../../release-notes';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { ApartmentOutline, BarChartOutline, CloudServerOutline, FileExclamationOutline, InfoCircleOutline, LaptopOutline } from '@ant-design/icons-angular/icons';

import { MenuSidebarComponent } from './menu-sidebar-component';

describe('MenuSidebarComponent', () => {
  let component: MenuSidebarComponent;
  let fixture: ComponentFixture<MenuSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuSidebarComponent],
      providers: [provideRouter([]), provideNzIcons([
        ApartmentOutline, BarChartOutline, CloudServerOutline, FileExclamationOutline, InfoCircleOutline, LaptopOutline,
      ])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuSidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('shows the Beta version and opens About with the project credit', async () => {
    const sidebar = fixture.nativeElement as HTMLElement;
    expect(sidebar.querySelector('.brand-release')?.textContent).toContain(version + '+dev');
    const opened = vi.fn();
    component.aboutOpened.subscribe(opened);
    sidebar.querySelector<HTMLButtonElement>('.about-button')!.click();
    await fixture.whenStable();
    expect(opened).toHaveBeenCalledOnce();
    const dialog = document.querySelector('.ant-modal');
    expect(dialog?.textContent).toContain('Jaime Vargas');
    expect(dialog?.querySelector('a')?.getAttribute('href')).toBe('https://github.com/Jaime-vargas');
    expect(dialog?.textContent).toContain(version + '+dev');
    expect(dialog?.querySelector('.release-notes h2')?.textContent).toBe('Release notes');
    expect(dialog?.querySelector('.release-notes details[open] summary')?.textContent).toContain(version);
    expect(dialog?.querySelectorAll('.release-notes li')).toHaveLength(RELEASE_NOTES.flatMap(release => release.changes).length);
  });
});
