import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {SidebarStore} from '../../../store/sidebar.store';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {HardwareStore} from '../../../store/hardware.store';
import {CameraRequestDto} from '../../../interfaces/hardware/camera/camera-request.dto';
import {CameraResponseDto} from '../../../interfaces/hardware/camera/camera-response.dto';
import {finalize} from 'rxjs';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {TagStore} from '../../../store/tag.store';
import {RouteContextService} from '../../../services/route-context.service';


@Component({
  selector: 'app-camera-form',
  imports: [
    NzButtonComponent,
    NzDividerComponent,
    NzFlexDirective,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzIconDirective,
    NzInputDirective,
    ReactiveFormsModule,
    NzRowDirective,
    NzColDirective,
    NzSelectModule
  ],
  templateUrl: './camera-form.component.html',
  styleUrl: './camera-form.component.css',
  providers: [TagStore],
})
export class CameraForm {

  private formBuilder = inject(NonNullableFormBuilder);
  private hardwareStore = inject(HardwareStore);
  private sidebarStore = inject(SidebarStore);
  private routeContext = inject(RouteContextService);
  protected tagStore = inject(TagStore);
  clientId = computed(() => this.formMode() === 'edit'
    ? this.selectedCamera()?.clientId ?? null : this.hardwareStore.currentClientId() ?? this.routeContext.clientId());
  protected newSiteName = this.formBuilder.control('', [Validators.required, Validators.maxLength(255)]);

  currentBranchId = this.hardwareStore.currentBranchId;
  formMode = this.hardwareStore.formMode;
  selectedCamera = this.hardwareStore.selectedHardware;

  buttonLoading = signal<boolean>(false);

  // Computed variables
  formTitle = computed(() =>
    this.formMode() === "add" ? "New Camera" : "Update Camera"
  )

  constructor() {
    effect(() => {
      const camera = this.selectedCamera();
      if (camera === null) return;
      this.fillFieldsFromEntity(camera)
    });
    effect(onCleanup => {
      const clientId = this.clientId();
      this.tagStore.tags.set([]);
      if (clientId === null) return;
      const subscription = this.tagStore.loadTags(clientId).subscribe();
      onCleanup(() => subscription.unsubscribe());
    });
  }

  // Form
  protected cameraForm = this.formBuilder.group({
    tagId: this.formBuilder.control<number | null>(null, Validators.required),
    cameraId: ['', [Validators.required, Validators.maxLength(25)]],
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
    brand: ['', [Validators.required, Validators.maxLength(25)]],
    model: ['', [Validators.required, Validators.maxLength(25)]],
    serialNumber: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
    location: ['', [Validators.minLength(3), Validators.maxLength(50)]],
    macAddress: ['', [Validators.required, Validators.pattern(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/)]],
    ipAddress: ['', [Validators.required, Validators.pattern(/^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/)]],
    idf: ['',Validators.maxLength(25)],
    username: ['', [Validators.minLength(3), Validators.maxLength(50)]],
    password: ['', [Validators.minLength(6), Validators.maxLength(100)]]
  });

  fillFieldsFromEntity(camera: CameraResponseDto) {
    this.cameraForm.patchValue({
      tagId: camera.tagId,
      cameraId: camera.cameraId,
      name: camera.name,
      brand: camera.brand,
      model: camera.model,
      serialNumber: camera.serialNumber,
      location: camera.location,
      macAddress: camera.macAddress,
      ipAddress: camera.ipAddress,
      idf: camera.idf,
      username: camera.username,
      password: camera.password,
    })
  }

  submitForm() {
    if(this.cameraForm.invalid || this.buttonLoading() || this.tagStore.loading() || this.tagStore.creating()) return;
    const values = this.cameraForm.getRawValue();
    if (values.tagId === null) return;
    const hardware: CameraRequestDto = {...values, tagId: values.tagId};
    this.buttonLoading.set(true);
    switch (this.formMode()) {
      case 'add':
        this.addRequest(hardware);
        break;
      case 'edit':
        this.editRequest(hardware);
        break;
    }
  }

  addRequest(hardware: CameraRequestDto){
    const currentBranchId = this.currentBranchId();
    const clientId = this.clientId();
    if (currentBranchId === null && clientId === null) {
      this.buttonLoading.set(false);
      return;
    }
    const request = currentBranchId !== null ? this.hardwareStore.saveCamera(currentBranchId, hardware)
      : this.hardwareStore.saveCameraForClient(clientId!, hardware);
    request.pipe(
      finalize(()=>{
        this.buttonLoading.set(false);
      })
    ).subscribe({
      next: () => this.onClose()
    })
  }

  editRequest(hardware: CameraRequestDto){
    const selectedCamera = this.selectedCamera();
    if (selectedCamera === null) {
      this.buttonLoading.set(false);
      return;
    }
    this.hardwareStore.updateCamera(selectedCamera.id, hardware).pipe(
      finalize(()=>{
        this.buttonLoading.set(false);
      })
    ).subscribe({
      next: () => this.onClose(),
    })
  }

  onClose(){
    this.cameraForm.reset();
    this.selectedCamera.set(null);
    this.sidebarStore.isOpen.set(false);
  }

  addSite() {
    const clientId = this.clientId();
    const name = this.newSiteName.value.trim();
    if (clientId === null || !name || this.newSiteName.invalid || this.tagStore.creating()) return;
    this.tagStore.addTag(clientId, name).subscribe(tag => {
      this.cameraForm.controls.tagId.setValue(tag.id);
      this.newSiteName.reset();
    });
  }
}
