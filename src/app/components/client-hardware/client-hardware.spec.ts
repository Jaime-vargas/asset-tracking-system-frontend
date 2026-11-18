import { provideNzIcons } from 'ng-zorro-antd/icon';
import { DesktopOutline, DownloadOutline, ExportOutline, ImportOutline, VideoCameraOutline } from '@ant-design/icons-angular/icons';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ClientHardware } from './client-hardware';
import { HardwareService } from '../../services/hardware.service';
import { HardwareStore } from '../../store/hardware.store';
import { TagService } from '../../services/tag.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HardwareTableDto } from '../../interfaces/hardware/hardware-table.dto';

describe('Project related hardware', () => {
  const first = {id: 1, type: 'Camera', name: 'Entrance', model: 'M1', serialNumber: 'SERIAL1', tagId: 11, tagName: 'Colima', brand: 'Example', cameraId: 'CAM-001', ipAddress: '192.168.1.10', location: 'Entrance', idf: 'IDF-1', reportsActive: []} as unknown as HardwareTableDto;
  const second = {...first, id: 2, name: 'Warehouse', tagId: 12, tagName: 'Tecomán'};
  let api: {createComputer: ReturnType<typeof vi.fn>; getClientHardware: ReturnType<typeof vi.fn>; getHardwareByBranchId: ReturnType<typeof vi.fn>; updateRelatedHardware: ReturnType<typeof vi.fn>};
  beforeEach(async () => {
    vi.stubGlobal('ResizeObserver', class {observe() {} unobserve() {} disconnect() {}});
    vi.stubGlobal('matchMedia', () => ({matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}}));
    api = {createComputer: vi.fn().mockReturnValue(of({id: 3})), getClientHardware: vi.fn().mockReturnValue(of([first, second])), getHardwareByBranchId: vi.fn().mockReturnValue(of([first])), updateRelatedHardware: vi.fn().mockReturnValue(of([second]))};
    await TestBed.configureTestingModule({imports: [ClientHardware], providers: [provideRouter([]), provideNzIcons([DesktopOutline, DownloadOutline, ExportOutline, ImportOutline, VideoCameraOutline]),
      {provide: HardwareService, useValue: api},
      {provide: TagService, useValue: {getClientTags: () => of([{id: 11, name: 'Colima', clientId: 9}])}},
      {provide: NzMessageService, useValue: {success: vi.fn()}},
      {provide: NzNotificationService, useValue: {error: vi.fn()}},
    ]}).compileComponents();
  });
  async function createHardware() {
    const fixture = TestBed.createComponent(ClientHardware);
    fixture.componentRef.setInput('clientId', 9);
    fixture.componentRef.setInput('projectId', 7);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    return fixture;
  }
  it('registers a computer in the client inventory and reloads after saving', async () => {
    const fixture = TestBed.createComponent(ClientHardware);
    fixture.componentRef.setInput('clientId', 9);
    fixture.detectChanges();
    await fixture.whenStable();
    const add = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Add computer'))!;
    add.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const form = document.querySelector<HTMLFormElement>('.ant-modal form')!;
    const values = {name: 'Monitoring PC', brand: 'Dell', model: 'OptiPlex', serialNumber: 'PC-01'};
    for (const [name, value] of Object.entries(values)) {
      const input = form.querySelector<HTMLInputElement>('input[name="' + name + '"]')!;
      input.value = value;
      input.dispatchEvent(new Event('input', {bubbles: true}));
    }
    const site = form.querySelector<HTMLSelectElement>('select[name="tagId"]')!;
    site.selectedIndex = 1;
    site.dispatchEvent(new Event('change', {bubbles: true}));
    fixture.detectChanges();
    await fixture.whenStable();
    form.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    expect(api.createComputer).toHaveBeenCalledWith(9, expect.objectContaining({
      ...values, tagId: 11, computerType: 'DESKTOP', storage: [], networkInterfaces: [], credentials: [],
    }));
    expect(api.getClientHardware).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.computerEditor()).toBeNull();
  });

  it('combines equipment type and site filters and can reset them', async () => {
    api.getClientHardware.mockReturnValue(of([
      first, second, {...first, id: 3, type: 'Computer', name: 'Office PC'},
    ]));
    const fixture = TestBed.createComponent(ClientHardware);
    fixture.componentRef.setInput('clientId', 9);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const types = fixture.nativeElement.querySelector('[aria-label="Filter by equipment type"]');
    const computers = Array.from(types.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Computers'))!;
    computers.click();
    fixture.detectChanges();
    expect(computers.getAttribute('aria-pressed')).toBe('true');
    expect(fixture.componentInstance.filteredHardware().map(item => item.id)).toEqual([3]);
    fixture.componentInstance.siteFilter.set(12);
    expect(fixture.componentInstance.filteredHardware()).toEqual([]);
    fixture.componentInstance.clearFilters();
    expect(fixture.componentInstance.filteredHardware()).toHaveLength(3);
  });

  it('loads linked equipment and offers all equipment types from every client site', async () => {
    const fixture = await createHardware();
    expect(api.getHardwareByBranchId).toHaveBeenCalledWith(7);
    expect(fixture.nativeElement.textContent).toContain('Hardware relacionado');
    expect(fixture.nativeElement.textContent).toContain('192.168.1.10');
    expect(fixture.nativeElement.textContent).toContain('IDF-1');
    expect(fixture.nativeElement.querySelector('app-hardware-transfer')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Warehouse');
    api.getClientHardware.mockReturnValue(of([first, { ...second, type: 'Computer' }]));
    fixture.componentInstance.openRelatedEditor();
    expect(api.getClientHardware).toHaveBeenCalledWith(9);
    expect(fixture.componentInstance.candidates().map(item => item.id)).toEqual([1, 2]);
    expect(fixture.componentInstance.selectedHardwareIds()).toEqual([1]);
    fixture.componentInstance.selectedHardwareIds.set([2]);
    fixture.componentInstance.saveRelations();
    expect(api.updateRelatedHardware).toHaveBeenCalledWith(7, [2]);
    expect(fixture.debugElement.injector.get(HardwareStore).hardwareList().map(item => item.id)).toEqual([2]);
    expect(fixture.componentInstance.relatedEditorOpen()).toBe(false);
  });
  it('does not replace relationships when the candidate request fails', async () => {
    api.getClientHardware.mockReturnValue(throwError(() => new Error('Offline')));
    const fixture = await createHardware();
    fixture.componentInstance.openRelatedEditor();
    fixture.componentInstance.saveRelations();
    expect(api.updateRelatedHardware).not.toHaveBeenCalled();
    expect(fixture.debugElement.injector.get(HardwareStore).hardwareList()).toEqual([first]);
  });
  it('keeps the selection and editor open when saving fails', async () => {
    api.updateRelatedHardware.mockReturnValue(throwError(() => ({error: {message: 'Please retry'}})));
    const fixture = await createHardware();
    fixture.componentInstance.openRelatedEditor();
    fixture.componentInstance.selectedHardwareIds.set([]);
    fixture.componentInstance.saveRelations();
    expect(fixture.componentInstance.relatedEditorOpen()).toBe(true);
    expect(fixture.componentInstance.selectedHardwareIds()).toEqual([]);
    expect(fixture.componentInstance.savingRelations()).toBe(false);
    expect(fixture.debugElement.injector.get(HardwareStore).hardwareList()).toEqual([first]);
  });
});
