import {inject, Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {Observable} from 'rxjs';
import {ClientTableDto} from '../interfaces/client-table.dto';
import {ClientRequestDto} from '../interfaces/client/client-request.dto';
import {ClientDto} from '../interfaces/client/client.dto';
import {ClientSummaryDto} from '../interfaces/client/client-summary.dto';

@Injectable({providedIn: 'root'})
export class ClientService{

  private api = inject(ApiUrlBaseService);

  getClientSummary(clientId: number): Observable<ClientSummaryDto> {
    return this.api.get(`clients/${clientId}`);
  }

  getClients(): Observable<ClientTableDto[]>{
    return this.api.get("clients");
  }

  addClient(clientRequestDto: ClientRequestDto): Observable<ClientTableDto>{
    return this.api.post("clients", clientRequestDto);
  }

  editClient(clientId: number, clientRequestDto: ClientRequestDto): Observable<ClientTableDto>{
    return this.api.put(`clients/${clientId}`, clientRequestDto);
  }

  /** Photo */
  uploadPhoto(clientId: number, formData: FormData, replaceExisting: boolean): Observable<ClientDto>{
    return this.api.post(`clients/${clientId}/photo?replaceExisting=${replaceExisting}`, formData);
  }

  getUploadClientPhotoUrl(clientId: number){
    return `${this.api.baseUrl}/clients/${clientId}/photo`
  }
}
