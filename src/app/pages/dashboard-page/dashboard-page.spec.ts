import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of, Subject, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {provideNzIcons} from 'ng-zorro-antd/icon';
import {ApartmentOutline, ArrowRightOutline, CheckOutline, ClockCircleOutline, DesktopOutline, FileTextOutline, ReloadOutline, VideoCameraOutline} from '@ant-design/icons-angular/icons';
import {DashboardPage} from './dashboard-page';
import {AuthService} from '../../services/auth-service';
import {DashboardService} from '../../services/dashboard.service';
import {ApiUrlBaseService} from '../../services/api-url-base.service';
import {DashboardDataDto} from '../../interfaces/dashboard-data.dto';

describe('Workspace dashboard', () => {
  const data: DashboardDataDto = {
    openReports: 2, overdueReports: 1, totalHardware: 15, totalClients: 7,
    totalCameras: 12, totalSwitches: 3, totalOtherHardware: 0, totalComputers: 4,
    clients: [{id:2,name:'Yazaki',photo:{filePath:'uploads/logo.png'}}],
    recentReports: [
      {id:11,title:'Camera inspection',priority:'HIGH',status:'OVERDUE',dueDate:'2026-11-01T12:00:00Z'},
      {id:12,title:'Network inspection',priority:'MEDIUM',status:'ACTIVE',dueDate:'N/A'},
    ],
  };
  let api: {getDashboardData: ReturnType<typeof vi.fn>};
  beforeEach(async () => {
    api = {getDashboardData: vi.fn(() => of(data))};
    await TestBed.configureTestingModule({imports:[DashboardPage],providers:[
      provideRouter([]),
      provideNzIcons([ApartmentOutline,ArrowRightOutline,CheckOutline,ClockCircleOutline,DesktopOutline,FileTextOutline,ReloadOutline,VideoCameraOutline]),
      {provide:DashboardService,useValue:api},
      {provide:ApiUrlBaseService,useValue:{imageBaseUrl:'http://localhost:3000/'}},
    ]}).compileComponents();
  });
  it('shows real metrics and direct report and client links', async () => {
    vi.spyOn(TestBed.inject(AuthService), 'getAllUserDataOnToken')
      .mockReturnValue({username: 'jaime', fullName: 'Jaime Vargas', role: 'ADMIN'});
    const fixture = TestBed.createComponent(DashboardPage); await fixture.whenStable();
    const page = fixture.componentInstance;
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Hello, Jaime Vargas');
    expect(page.metrics().map(metric => metric.value)).toEqual([2,1,15,7]);
    expect(page.inventory().map(item => item.count)).toEqual([12,3,4]);
    const cards = fixture.nativeElement.querySelectorAll('app-hardware-inventory-card a');
    expect(Array.from(cards as NodeListOf<HTMLAnchorElement>, card => card.getAttribute('href'))).toEqual([
      '/hardware?type=Camera', '/hardware?type=Switch', '/hardware?type=Computer',
    ]);
    expect(fixture.nativeElement.querySelector('.report-row').getAttribute('href')).toBe('/reports/11');
    expect(fixture.nativeElement.querySelector('.client-shortcut').getAttribute('href')).toBe('/clients/2/yazaki');
    expect(fixture.nativeElement.querySelector('.client-logo img').getAttribute('src')).toBe('http://localhost:3000/uploads/logo.png');
    expect(page.recentReports()[1].dueDate).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Due date not assigned');
  });
  it('distinguishes loading from an empty workspace and prevents duplicate refreshes', async () => {
    const response = new Subject<DashboardDataDto>(); api.getDashboardData.mockReturnValue(response);
    const fixture = TestBed.createComponent(DashboardPage); await fixture.whenStable();
    const page = fixture.componentInstance;
    expect(page.loading()).toBe(true); expect(page.data()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Loading workspace overview');
    expect(fixture.nativeElement.textContent).not.toContain('No open reports');
    page.getDashboardData(); expect(api.getDashboardData).toHaveBeenCalledTimes(1);
    response.next({...data,openReports:0,overdueReports:0,recentReports:[]}); response.complete(); await fixture.whenStable();
    expect(page.loading()).toBe(false); expect(fixture.nativeElement.textContent).toContain('No open reports');
  });
  it('offers retry after a failed initial request without showing empty success states', async () => {
    api.getDashboardData.mockReturnValue(throwError(() => new Error('offline')));
    const fixture = TestBed.createComponent(DashboardPage); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('No open reports');
    api.getDashboardData.mockReturnValue(of(data)); fixture.componentInstance.getDashboardData(); await fixture.whenStable();
    expect(fixture.componentInstance.loadError()).toBe(false);
    expect(fixture.componentInstance.data()).toEqual(data);
  });
  it('keeps the last successful snapshot and timestamp if refreshing fails', async () => {
    const fixture = TestBed.createComponent(DashboardPage); await fixture.whenStable();
    const page = fixture.componentInstance; const time = page.updatedAt();
    api.getDashboardData.mockReturnValue(throwError(() => new Error('offline'))); page.getDashboardData(); await fixture.whenStable();
    expect(page.data()).toEqual(data); expect(page.updatedAt()).toBe(time);
    expect(page.loading()).toBe(false); expect(page.loadError()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Showing the last loaded data');
  });
  it('falls back to initials when a client logo cannot load', async () => {
    const fixture = TestBed.createComponent(DashboardPage); await fixture.whenStable();
    fixture.nativeElement.querySelector('.client-logo img').dispatchEvent(new Event('error')); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.client-logo img')).toBeNull();
    expect(fixture.nativeElement.querySelector('.client-logo').textContent).toContain('Y');
  });
  it('cancels a pending dashboard request when leaving the page', () => {
    const response = new Subject<DashboardDataDto>(); api.getDashboardData.mockReturnValue(response);
    const fixture = TestBed.createComponent(DashboardPage); expect(response.observed).toBe(true);
    fixture.destroy(); expect(response.observed).toBe(false);
  });
});
