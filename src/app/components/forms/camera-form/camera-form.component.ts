import {Component, computed, inject, OnInit} from '@angular/core';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {SidebarStore} from '../../../store/sidebar.store';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {HardwareStore} from '../../../store/hardware.store';
import {BranchTableDto} from '../../../interfaces/branch-table.dto';
import {CameraRequestDto} from '../../../interfaces/hardware/camera/camera-request.dto';

@Component({
  selector: 'app-hardware-form',
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
    NzColDirective
  ],
  templateUrl: './hardware-form.html',
  styleUrl: './hardware-form.css',
})
export class HardwareForm implements OnInit{

  private formBuilder = inject(FormBuilder);
  private hardwareStore = inject(HardwareStore);
  private sidebarStore = inject(SidebarStore);

  currentBranchId = this.hardwareStore.currentBranchId;
  formMode = this.hardwareStore.formMode;
  selectedHardware = this.hardwareStore.selectedHardware;

  // Computed variables
  formTitle = computed(() =>
    this.formMode() === "add" ? "New Branch" : "Update Branch"
  )

  ngOnInit() {
    const hardware = this.selectedHardware();
    if (hardware === null) return;

  }

  // Form
  protected hardwareForm = this.formBuilder.group({
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

  fillFieldsFromEntity(hardware: CameraRequestDto) {
    this.branchForm.patchValue({
      name: branch.name,
    })
  }

  submitForm() {
    if(this.hardwareForm.invalid) return;
    const hardware = this.hardwareForm.getRawValue();
    console.log(hardware);
  }

  onClose(){}
}
