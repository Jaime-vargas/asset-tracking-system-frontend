import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  ApartmentOutline,
  BarChartOutline,
  CloudServerOutline,
  FileExclamationOutline,
  FolderOpenOutline,
  LaptopOutline,
} from '@ant-design/icons-angular/icons';

import { MenuSidebarComponent } from './menu-sidebar-component';

describe('MenuSidebarComponent', () => {
  let component: MenuSidebarComponent;
  let fixture: ComponentFixture<MenuSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuSidebarComponent],
      providers: [
        provideRouter([]),
        provideNzIcons([
          ApartmentOutline, BarChartOutline, CloudServerOutline,
          FileExclamationOutline, FolderOpenOutline, LaptopOutline,
        ]),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuSidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
