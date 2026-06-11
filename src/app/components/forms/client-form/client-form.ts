import {Component, inject, output, signal, OnInit, computed, effect} from '@angular/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {form} from '@angular/forms/signals';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {ClientTableDto} from '../../../interfaces/client-table.dto';
import {withI18nSupport} from '@angular/platform-browser';
import {ApiUrlBaseService} from '../../../services/api-url-base.service';
import { NzImageModule } from 'ng-zorro-antd/image';
import {UploadComponent} from '../../upload-drag-and-drop-component/upload-component';
import {SidebarStore} from '../../../store/sidebar.store';
import {ClientService} from '../../../services/client.service';
import {ClientRequestDto} from '../../../interfaces/client/client-request.dto';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {Subscription} from 'rxjs';
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
export class ClientForm{
  constructor(protected apiUrlBaseService: ApiUrlBaseService,
              private clientService: ClientService,
              private clientStore: ClientStore,
              private sidebarStore: SidebarStore,
              private message : NzMessageService,
              private notification : NzNotificationService) {
  }
  private subscriptions: Subscription = new Subscription();

  ngOnInit() {
    this.subscriptions.add(
      this.sidebarStore.selectedEntity$.subscribe(entity => {
        this.clientToEdit.set(entity);
        this.setFieldsFromEntity();
      })
    );
    this.subscriptions.add(
      this.sidebarStore.formMode$.subscribe(mode => {
        this.formMode.set(mode)
      })
    );
    this.subscriptions.add(
      this.clientStore.clientList$.subscribe(clientList => {
        const current = this.clientToEdit();
        if(!current || !clientList) return;
        const updatedClient =
          clientList.find(
            c => c.id === current.id
          );
        if(updatedClient) this.clientToEdit.set(updatedClient);
      })
    )
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  formTitle= computed(()=>
    this.formMode() === "add" ? "New Client" : "Update Client"
  )

  clientToEdit = signal<ClientTableDto | null>(null);
  formMode = signal<string>("add")

  // Image Helpers
  url = computed(()=>`clients/${this.clientToEdit()?.id}/photo`);
  uploadDisabled = computed(()=>
    this.formMode() === 'add'
  );
  clientImage = computed(()=>{
    const path = this.clientToEdit()?.photo?.filePath;
    if(!path) return undefined;
    return this.apiUrlBaseService.imageBaseUrl + path;
  });

  // Form fields
  private fb = inject(FormBuilder);
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)],],
  });

  setFieldsFromEntity() {
    const client = this.clientToEdit();
    if(client) {
      this.form.patchValue({
        name: this.clientToEdit()?.name,
      })
    }
  }

  onClose() {
    this.form.reset();
    this.sidebarStore.clearSelectedEntity();
    this.sidebarStore.close();
  }

  refreshForm(){
    this.sidebarStore.triggerRefreshTable();
  }

  submit(){
    const client: ClientRequestDto = this.form.getRawValue();
    if(this.form.invalid) return
    switch (this.formMode()) {
      case 'add':
        this.clientService.addClient(client).subscribe({
          next: (client: ClientTableDto) => {
            this.clientToEdit.set(client);
            this.sidebarStore.triggerRefreshTable();
            this.sidebarStore.setMode("edit");
            this.message.success("Client created successfully.");
          }
        })
        break;
      case 'edit':
        const entity = this.clientToEdit();
        if (entity) {
          this.clientService.editClient(entity.id, client).subscribe({
            next: (response: any) => {
              this.sidebarStore.triggerRefreshTable();
              this.onClose();
              this.message.success("Client updated successfully.");
            },error: (err) => {
              this.notification.error(
                'Upload failed',
                err?.error.message,
                { nzDuration: 0 }
              );
            }
          })
        }
    }
  }
}

