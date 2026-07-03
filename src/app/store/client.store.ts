import {computed, inject, Injectable, signal} from '@angular/core';
import {ClientTableDto} from '../interfaces/client-table.dto';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {ClientService} from '../services/client.service';
import {ClientRequestDto} from '../interfaces/client/client-request.dto';
import {ApiUrlBaseService} from '../services/api-url-base.service';
import {ClientDto} from '../interfaces/client/client.dto';
import {NzUploadFile} from 'ng-zorro-antd/upload';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({providedIn: 'root',})
export class ClientStore {

  private apiUrlBaseService = inject(ApiUrlBaseService);
  private clientService = inject(ClientService);
  private message = inject(NzMessageService);
  private notification = inject(NzNotificationService);

  // Entity
  public clientList = signal<ClientTableDto[]>([]);
  public selectedClient = signal<ClientTableDto | null>(null);

  // Computed
  public selectedClientImage = computed<string|null>(() => {
    const path = this.selectedClient()?.photo?.filePath;
    return (path) ? this.apiUrlBaseService.imageBaseUrl + path : null;
  });

  public clientPhotoUrl = computed<string|null>(()=>{
    const client = this.selectedClient();
    if(client === null) return null;
    return this.clientService.getUploadClientPhotoUrl(client.id);
  });

  // Form
  public formMode = signal<"add" | "edit" | null>(null);

  // Functions
  public updateSelectedClient (client:ClientDto) {
    const actualClient = this.clientList().find(c => c.id === client.id);
    if (!actualClient) return;
    const updatedClient: ClientTableDto = {
      id: client.id,
      name: client.name,
      photo: client.photo,
      totalHardware: actualClient.totalHardware,
      reportsActive: actualClient.reportsActive,
      branches: actualClient.branches,
    }
    this.clientList.update(currList =>
      currList.map(client => client.id === updatedClient.id ? updatedClient : client));
    this.selectedClient.set(updatedClient)
  }

  // Store is the layer that shares data with services.
  public loadClients(){
    this.clientService.getClients().subscribe({
      next: (clients: ClientTableDto[]) =>
        this.clientList.set(clients),
      error: (err: HttpErrorResponse) => this.responseError(err),
    })
  }

  public addClient(client: ClientRequestDto) {
    this.clientService.addClient(client).subscribe({
      /* TODO: response incomplete (id, name), make response brings ClientTableDto object */
      next: (data:ClientDto)=> {
        const newClient: ClientTableDto = {
          ...data,
          branches: 0,
          totalHardware: 0,
          reportsActive: [],
        };
        this.clientList.update(currList =>
          [...currList, newClient]);
        this.selectedClient.set(newClient);
      },
      error: (err: HttpErrorResponse) => this.responseError(err),
      complete:() => this.message.success('Client created successfully.')
    })
  }

  public editClient(clientId: number, client: ClientRequestDto) {
    this.clientService.editClient(clientId, client).subscribe({
      next: (data: ClientRequestDto) => this.clientList.update(currList => currList.map(
        client => client.id === clientId ? {...client, name: data.name} : client)),
      error: (err: HttpErrorResponse) => this.responseError(err),
      complete: () => this.message.success('Client edited successfully.')
    })
  }

  public uploadClientPhoto(clientId: number, formData: FormData, replaceExisting: boolean) {
    this.clientService.uploadPhoto(clientId, formData, replaceExisting).subscribe({
      next: (data: ClientDto)=>
        this.updateSelectedClient(data),
      error: (err: HttpErrorResponse) => this.responseError(err),
      complete:() => this.message.success('Photo updated successfully.')
    })
  }

  responseError(error: HttpErrorResponse) {
    const errorMessage: string = error.error.message;
    this.notification.error(
      'Request Failed',
      errorMessage,
      {nzDuration: 0}
    )
  }
}
