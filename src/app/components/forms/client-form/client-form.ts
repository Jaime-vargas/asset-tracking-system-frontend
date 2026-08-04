import {Component, inject, OnInit, computed} from '@angular/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {ClientTableDto} from '../../../interfaces/client-table.dto';
import { NzImageModule } from 'ng-zorro-antd/image';
import {UploadComponent} from '../../upload-drag-and-drop-component/upload-component';
import {SidebarStore} from '../../../store/sidebar.store';
import {ClientRequestDto} from '../../../interfaces/client/client-request.dto';
import {ClientStore} from '../../../store/client.store';
import {UploadButtonComponent} from '../../upload-button-component/upload-button-component';


@Component({
  selector: 'app-client-form',
  imports: [
    NzDividerComponent,
    NzFlexDirective,
    NzButtonComponent,
    NzIconDirective,
    NzFormDirective,
    ReactiveFormsModule,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzInputDirective,
    NzImageModule,
    UploadComponent,
    UploadButtonComponent
  ],
  standalone: true,
  templateUrl: './client-form.html',
  styleUrl: './client-form.css',
})
export class ClientForm implements OnInit{

  private clientStore = inject(ClientStore);
  protected formBuilder = inject(FormBuilder);
  private sidebarStore = inject(SidebarStore);

  formMode = this.clientStore.formMode;
  selectedClient = this.clientStore.selectedClient;
  selectedClientImage = this.clientStore.selectedClientImage;

  // Static
  fallbackClientImage = '/default-images/default-client.webp';

  // Computed variables
  // --------------------
  formTitle = computed(() =>
    this.formMode() === "add" ? "New Client" : "Update Client"
  );


  uploadUrl = computed(()=>  {
      const url = this.clientStore.clientPhotoUrl();
      if(url === null) return '';
      return this.formMode() === 'add'? '' : url;
  });

  // if formMode is "add" you cannot update a photo because there isn't an id to refer
  uploadDisabled = computed(()=>
    this.formMode() === 'add'
  );


  ngOnInit() {
    const client = this.selectedClient();
    if (client === null) return;
    this.fillFieldsFromEntity(client);
  }

  // Form
  // --------------------
  protected clientForm: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)],],
  });

  fillFieldsFromEntity(client: ClientTableDto) {
    this.clientForm.patchValue({
      name: client.name,
    })
  }

  submitForm(){
    if(this.clientForm.invalid) return;
    const client: ClientRequestDto = this.clientForm.getRawValue();
    switch (this.formMode()) {
      case 'add':
        this.addRequest(client);
        break;
      case 'edit':
        this.editRequest(client);
        break;
    }
  }

  addRequest(client: ClientRequestDto) {
    this.clientStore.addClient(client);
    this.formMode.set("edit");
  }

  editRequest(client: ClientRequestDto) {
    const selectedClient = this.selectedClient();
    if (selectedClient === null) return;
    this.clientStore.editClient(selectedClient.id, client);
    this.onClose();
  }

  onClose() {
    this.clientForm.reset();
    this.selectedClient.set(null);
    this.sidebarStore.isOpen.set(false);
  }

  uploadSuccess(client: ClientTableDto) {
    this.clientStore.updateSelectedClient(client);
  }

  uploadClientPhoto(formData: FormData) {
    const selectedClient = this.selectedClient();
    if (selectedClient === null) return;
    this.clientStore.uploadClientPhoto(selectedClient.id, formData, true);
  }
}

