import {Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {Observable} from 'rxjs';
import {ClientTableDto} from '../interfaces/client-table.dto';
import {BranchTableDto} from '../interfaces/branch-table.dto';

@Injectable({providedIn: 'root'})
export class ClientService{

  constructor(private api: ApiUrlBaseService) {
  }

  getClients(): Observable<ClientTableDto[]>{
    return this.api.get("clients");
  }

  getBranches(clientId:number): Observable<BranchTableDto[]>{
    return this.api.get(`clients/${clientId}/branches`);
  }

}
