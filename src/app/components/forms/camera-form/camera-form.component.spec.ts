import {TestBed} from '@angular/core/testing';
import {signal} from '@angular/core';
import {EMPTY, of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {CameraForm} from './camera-form.component';
import {HardwareStore} from '../../../store/hardware.store';
import {SidebarStore} from '../../../store/sidebar.store';
import {TagService} from '../../../services/tag.service';
import {RouteContextService} from '../../../services/route-context.service';
import {CameraResponseDto} from '../../../interfaces/hardware/camera/camera-response.dto';

describe('Camera site selection', () => {
  const camera: CameraResponseDto = {
    id: 1, clientId: 9, tagId: 11, tagName: 'Colima', cameraId: 'CAM-01', name: 'Camera One',
    brand: 'Example', model: 'Model', serialNumber: 'SERIAL-1', location: 'Entrance',
    macAddress: 'AA:BB:CC:DD:EE:FF', ipAddress: '192.168.1.10', idf: '', username: '', password: ''
  };
  let hardwareStore: {
    currentBranchId: ReturnType<typeof signal<number | null>>;
    currentClientId: ReturnType<typeof signal<number | null>>;
    formMode: ReturnType<typeof signal<'add' | 'edit' | null>>;
    selectedHardware: ReturnType<typeof signal<CameraResponseDto | null>>;
    saveCamera: ReturnType<typeof vi.fn>;
    saveCameraForClient: ReturnType<typeof vi.fn>;
    updateCamera: ReturnType<typeof vi.fn>;
  };
  let tagService: {getClientTags: ReturnType<typeof vi.fn>; addTag: ReturnType<typeof vi.fn>};
  let sidebar: {isOpen: ReturnType<typeof signal<boolean>>};

  beforeEach(async () => {
    hardwareStore = {
      currentBranchId: signal(7), currentClientId: signal(null), formMode: signal('add'), selectedHardware: signal(null),
      saveCamera: vi.fn().mockReturnValue(of(camera)), saveCameraForClient: vi.fn().mockReturnValue(of(camera)),
      updateCamera: vi.fn().mockReturnValue(of(camera))
    };
    tagService = {
      getClientTags: vi.fn().mockReturnValue(of([{id: 11, name: 'Colima', clientId: 9}])),
      addTag: vi.fn().mockReturnValue(of({id: 12, name: 'Tecomán', clientId: 9}))
    };
    sidebar = {isOpen: signal(true)};
    await TestBed.configureTestingModule({
      imports: [CameraForm],
      providers: [
        {provide: HardwareStore, useValue: hardwareStore},
        {provide: SidebarStore, useValue: sidebar},
        {provide: TagService, useValue: tagService},
        {provide: NzNotificationService, useValue: {error: vi.fn()}}
      ]
    }).overrideComponent(CameraForm, {set: {template: '', imports: []}}).compileComponents();
    TestBed.inject(RouteContextService).clientId.set(9);
  });

  it('does not save without a site and sends the explicit selection', async () => {
    const fixture = TestBed.createComponent(CameraForm);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    component['cameraForm'].patchValue({...camera, tagId: null});
    component.submitForm();
    expect(hardwareStore.saveCamera).not.toHaveBeenCalled();
    component['cameraForm'].controls.tagId.setValue(11);
    component.submitForm();
    expect(hardwareStore.saveCamera).toHaveBeenCalledWith(7, expect.objectContaining({tagId: 11}));
    expect(sidebar.isOpen()).toBe(false);
  });

  it('uses the camera owner when editing from a route without client context', async () => {
    TestBed.inject(RouteContextService).clientId.set(null);
    hardwareStore.formMode.set('edit');
    hardwareStore.selectedHardware.set(camera);
    const fixture = TestBed.createComponent(CameraForm);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(tagService.getClientTags).toHaveBeenCalledWith(9);
    expect(fixture.componentInstance['cameraForm'].controls.tagId.value).toBe(11);
    fixture.componentInstance.submitForm();
    expect(hardwareStore.updateCamera).toHaveBeenCalledWith(1, expect.objectContaining({tagId: 11}));
  });

  it('selects a newly created site', async () => {
    const fixture = TestBed.createComponent(CameraForm);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance['newSiteName'].setValue('  Tecomán  ');
    fixture.componentInstance.addSite();
    expect(tagService.addTag).toHaveBeenCalledWith(9, 'Tecomán');
    expect(fixture.componentInstance['cameraForm'].controls.tagId.value).toBe(12);
  });

  it('creates hardware directly from the client workspace', async () => {
    hardwareStore.currentBranchId.set(null);
    hardwareStore.currentClientId.set(9);
    const fixture = TestBed.createComponent(CameraForm);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance['cameraForm'].patchValue(camera);
    fixture.componentInstance.submitForm();
    expect(hardwareStore.saveCameraForClient).toHaveBeenCalledWith(9, expect.objectContaining({tagId: 11}));
    expect(hardwareStore.saveCamera).not.toHaveBeenCalled();
  });

  it('keeps the form open and releases loading after a failed request', async () => {
    hardwareStore.saveCamera.mockReturnValue(EMPTY);
    const fixture = TestBed.createComponent(CameraForm);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance['cameraForm'].patchValue(camera);
    fixture.componentInstance.submitForm();
    expect(fixture.componentInstance.buttonLoading()).toBe(false);
    expect(sidebar.isOpen()).toBe(true);
  });
});
