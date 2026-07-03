import {inject, Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {Observable} from 'rxjs';
import {HardwareTableDto} from '../interfaces/hardware/hardware-table.dto';
import {BranchTableDto} from '../interfaces/branch-table.dto';

@Injectable({providedIn: 'root'})
export class BranchService {

  private api = inject(ApiUrlBaseService);

  getBranches(clientId:number):Observable<BranchTableDto[]>{
    return this.api.get(`clients/${clientId}/branches`);
  }

  addBranch(clientId:number, branch: any):Observable<BranchTableDto>{
    return this.api.post(`clients/${clientId}/branches`, branch);
  }

  editBranch(branchid: number, branch: any):Observable<BranchTableDto>{
    return this.api.put(`branches/${branchid}`, branch);
  }
}
