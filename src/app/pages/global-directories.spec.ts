import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HardwarePage } from './hardware-page/hardware-page';
import { ReportsPage } from './reports-page/reports-page';
import { HardwareService } from '../services/hardware.service';
import { ReportsService } from '../services/report.service';
import { HardwareTableDto } from '../interfaces/hardware/hardware-table.dto';
import { ReportTableDto } from '../interfaces/report/report-table.dto';
import { groupBySite, directorySites, directoryDateKey } from '../utils/directory';
const hardware: HardwareTableDto[] = [
  { id: 1, name: 'Camera Colima', type: 'Camera', model: 'Axis', serialNumber: 'SER-1', clientId: 1, clientName: 'Same client', tagId: 11, tagName: 'Colima', ipAddress: '192.168.1.2', location: 'Main entrance' },
  { id: 2, name: 'Camera Tecoman', type: 'Camera', model: 'Axis', serialNumber: 'SER-2', clientId: 1, clientName: 'Same client', tagId: 12, tagName: 'Tecoman', ipAddress: '192.168.1.3', location: '' },
  { id: 3, name: 'Other camera', type: 'Camera', model: 'Example', serialNumber: 'SER-3', clientId: 2, clientName: 'Same client', tagId: 21, tagName: 'Colima', ipAddress: '10.0.0.1', location: '' },
].map(item => ({ ...item, branchId: null, branchName: null, tagColor: 'BLUE', reportsActive: item.id === 1 ? [{ clientId: 1, reportId: 10, dueDate: '2026-11-04T12:00:00Z' }] : [], lastMaintenanceDate: '2026-11-01T12:00:00Z' }));
const reports: ReportTableDto[] = [
  { id: 10, title: 'Entrance review', clientId: 1, clientName: 'Same client', tagId: 11, tagName: 'Colima', hardwareId: 1, hardwareName: 'Camera Colima', status: 'OVERDUE', priority: 'HIGH' },
  { id: 11, title: 'Maintenance', clientId: 1, clientName: 'Same client', tagId: 12, tagName: 'Tecoman', hardwareId: 2, hardwareName: 'Camera Tecoman', status: 'ACTIVE', priority: 'MEDIUM' },
  { id: 12, title: 'Old inspection', clientId: 2, clientName: 'Same client', tagId: 21, tagName: 'Colima', hardwareId: 3, hardwareName: 'Other camera', status: 'CLOSED', priority: 'LOW' },
].map(item => ({ ...item, branchId: null, branchName: null, tagColor: 'BLUE', createdDate: '2026-10-01T12:00:00Z', dueDate: '2026-11-04T12:00:00Z' }));
describe('Native global directories', () => {
  let hardwareApi: {
    getAllHardware: ReturnType<typeof vi.fn>;
  };
  let reportsApi: {
    getAllReports: ReturnType<typeof vi.fn>;
  };
  beforeEach(async () => {
    hardwareApi = { getAllHardware: vi.fn(() => of(hardware)) };
    reportsApi = { getAllReports: vi.fn(() => of(reports)) };
    await TestBed.configureTestingModule({ imports: [HardwarePage, ReportsPage], providers: [provideRouter([]), { provide: HardwareService, useValue: hardwareApi }, { provide: ReportsService, useValue: reportsApi }] }).compileComponents();
  });
  it('shows all equipment and keeps same-name clients and sites separate by ID', async () => {
    const fixture = TestBed.createComponent(HardwarePage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    expect(page.filteredHardware()).toHaveLength(3);
    expect(page.clients()).toHaveLength(2);
    expect(page.groups()).toHaveLength(3);
    page.setClient(2);
    page.siteId.set(21);
    expect(page.filteredHardware().map(item => item.id)).toEqual([3]);
    page.setClient(1);
    expect(page.siteId()).toBeNull();
    expect(page.sites().map(site => site.id)).toEqual([11, 12]);
    expect(page.filteredHardware()).toHaveLength(2);
  });
  it('filters by equipment type using the shared buttons', async () => {
    hardwareApi.getAllHardware.mockReturnValue(of([
      ...hardware, {...hardware[0], id: 4, type: 'Computer', name: 'Office PC'},
    ]));
    const fixture = TestBed.createComponent(HardwarePage);
    await fixture.whenStable();
    const group = fixture.nativeElement.querySelector('[aria-label="Filter by equipment type"]');
    const buttons = Array.from(group.querySelectorAll('button') as NodeListOf<HTMLButtonElement>);
    expect(buttons.map(button => button.querySelector('small')?.textContent)).toEqual(['4', '3', '1']);
    buttons[2].click();
    expect(fixture.componentInstance.filteredHardware().map(item => item.id)).toEqual([4]);
    fixture.componentInstance.setClient(2);
    expect(fixture.componentInstance.filteredHardware()).toEqual([]);
    buttons[0].click();
    expect(fixture.componentInstance.filteredHardware().map(item => item.id)).toEqual([3]);
  });

  it('combines multi-field search and report filters, and opens the correct equipment', async () => {
    const fixture = TestBed.createComponent(HardwarePage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.search.set('axis 192.168.1.2');
    page.onlyReports.set(true);
    await fixture.whenStable();
    expect(page.filteredHardware().map(item => item.id)).toEqual([1]);
    expect(fixture.nativeElement.querySelector('.record-row').getAttribute('href')).toBe('/hardware/1');
    page.clearFilters();
    expect(page.filteredHardware()).toHaveLength(3);
    expect(fixture.nativeElement.querySelector('nz-select,nz-table,nz-icon')).toBeNull();
    page.hardwareData.set([{...hardware[0],name:'Network unit',type:'Switch'}]);
    page.search.set('switch');
    expect(page.filteredHardware().map(item=>item.id)).toEqual([1]);
  });
  it('paginates every equipment record and resets page on scope changes', async () => {
    const fixture = TestBed.createComponent(HardwarePage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.hardwareData.set(Array.from({ length: 25 }, (_, i) => ({ ...hardware[0], id: i + 1, name: `Camera ${i}` })));
    expect(page.groups().flatMap(group => group.items)).toHaveLength(12);
    page.page.set(3);
    expect(page.groups().flatMap(group => group.items)).toHaveLength(1);
    page.search.set('Camera');
    await fixture.whenStable();
    expect(page.currentPage()).toBe(1);
    page.grouped.set(false);
    expect(page.groups()).toHaveLength(1);
  });
  it('clears loading on failure and supports hardware retry without duplicate requests', async () => {
    const response = new Subject<HardwareTableDto[]>();
    hardwareApi.getAllHardware.mockReturnValue(response);
    const fixture = TestBed.createComponent(HardwarePage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.getAllHardwareData();
    expect(hardwareApi.getAllHardware).toHaveBeenCalledTimes(1);
    response.error(new Error('offline'));
    await fixture.whenStable();
    expect(page.loading()).toBe(false);
    expect(page.loadError()).toBe(true);
    hardwareApi.getAllHardware.mockReturnValue(of(hardware));
    page.getAllHardwareData();
    expect(page.loadError()).toBe(false);
    expect(page.hardwareData()).toHaveLength(3);
  });
  it('filters reports by their actual equipment site, status and priority', async () => {
    const fixture = TestBed.createComponent(ReportsPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    expect(page.filteredReports()).toHaveLength(3);
    expect(page.totals()).toEqual({ all: 3, open: 2, overdue: 1, closed: 1 });
    page.status.set('OPEN');
    expect(page.filteredReports()).toHaveLength(2);
    page.siteId.set(11);
    page.priority.set('HIGH');
    expect(page.filteredReports().map(item => item.id)).toEqual([10]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.record-row').getAttribute('href')).toBe('/reports/10');
    page.setClient(2);
    expect(page.siteId()).toBeNull();
    page.clearFilters();
    expect(page.filteredReports()).toHaveLength(3);
  });
  it('uses inclusive calendar dates and distinguishes created and due dates', async () => {
    const fixture = TestBed.createComponent(ReportsPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    const due = directoryDateKey(reports[0].dueDate);
    page.dateFrom.set(due);
    page.dateTo.set(due);
    expect(page.filteredReports()).toHaveLength(3);
    page.dateField.set('createdDate');
    expect(page.filteredReports()).toHaveLength(0);
    page.dateFrom.set('2026-11-05');
    page.dateTo.set('2026-11-01');
    expect(page.invalidDateRange()).toBe(true);
    expect(page.filteredReports()).toHaveLength(0);
    page.clearFilters();
    expect(page.invalidDateRange()).toBe(false);
    expect(page.filteredReports()).toHaveLength(3);
  });
  it('handles missing report dates and request errors without rendering invalid dates', async () => {
    const fixture = TestBed.createComponent(ReportsPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.reportsData.set([{ ...reports[0], dueDate: 'N/A', createdDate: '' }]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Not assigned');
    page.dateFrom.set('2026-01-01');
    expect(page.filteredReports()).toHaveLength(0);
    reportsApi.getAllReports.mockReturnValue(throwError(() => new Error('offline')));
    page.getReports();
    expect(page.loading()).toBe(false);
    expect(page.loadError()).toBe(true);
  });
  it('groups by client/site IDs and labels same-named sites with their clients', () => {
    expect(groupBySite(hardware, true).map(group => group.key)).toEqual(['1:11', '1:12', '2:21']);
    expect(directorySites(hardware, null)).toHaveLength(3);
    expect(directorySites(hardware, 2)).toEqual([{ id: 21, name: 'Colima' }]);
  });
});
