import {Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {Observable} from 'rxjs';
import {HardwareTableDto} from '../interfaces/hardware-table.dto';

@Injectable({providedIn: 'root'})
export class BranchService {
  constructor(private api: ApiUrlBaseService) {
  }

  getHardwareTableFromBranch(clientId:number, branchId:number): Observable<HardwareTableDto[]>{
    return this.api.get(`clients/${clientId}/branches/${branchId}/hardware`);
  }

}
