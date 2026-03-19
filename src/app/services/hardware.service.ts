import {Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {Observable} from 'rxjs';
import {ClientTableDto} from '../interfaces/client-table.dto';
import {BranchTableDto} from '../interfaces/branch-table.dto';
import {HardwareDetailDto} from '../interfaces/hardware-detail.dto';

@Injectable({providedIn: 'root'})
export class HardwareService{

  constructor(private api: ApiUrlBaseService) {
  }

  getHardwareDetail(clientId: number, branchId: number, hardwareID: number): Observable<HardwareDetailDto> {
    return this.api.get(`clients/${clientId}/branches/${branchId}/hardware/${hardwareID}`);
  }
}
