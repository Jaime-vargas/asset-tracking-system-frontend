import {inject, Injectable, signal} from '@angular/core';
import {BranchTableDto} from '../interfaces/branch-table.dto';
import {BranchService} from '../services/branch.service';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {NzMessageService} from 'ng-zorro-antd/message';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({providedIn: "root"})
export class BranchStore {

  private branchService = inject(BranchService);
  private message = inject(NzMessageService);
  private notification = inject(NzNotificationService);

  // THIS STORE WILL BE USED TO HANDLE THE STATUS OF BRANCHES. IN ORDER TO HAVE ALL CENTRALIZED.
  // Every branch depends on a clientId
  public currentClientId = signal<number | null>(null);

  // Entity
  public branchList = signal<BranchTableDto[]>([]);
  public selectedBranch = signal<BranchTableDto | null>(null);

  // Filtered Entities

  // Form
  public formMode = signal<"add" | "edit" | null>(null);

  // Communication with service layer
  public loadBranches(){
    const clientId = this.currentClientId();
    if (clientId === null) return
    this.branchService.getBranches(clientId).subscribe({
      next: (data: BranchTableDto[]) => this.branchList.set(data),
      error: (err: HttpErrorResponse) => this.responseError(err),
    });
  }

  public addBranch(clientId: number, newBranch: BranchTableDto) {
    this.branchService.addBranch(clientId, newBranch).subscribe({
      next: (data: BranchTableDto) =>
        /* FIX-response incomplete (id, name), make response brings BranchTableDto object */
        this.branchList.update(currList => [...currList, {...data, reportsActive:[], totalHardware: 0}]),
      error: (err: HttpErrorResponse) => this.responseError(err),
      complete: () => this.message.success('Branch created successfully.')
    })
  }

  public editBranch(branchId: number, branch: BranchTableDto) {
    this.branchService.editBranch(branchId, branch).subscribe({
      next: (data: BranchTableDto) =>
        this.branchList.update(currList => currList.map(
          branch => branch.id === branchId ? {...branch, name: data.name} : branch)), // Only name is updated, because response don't include all table data.
      error: (err: HttpErrorResponse) => this.responseError(err),
      complete: () => this.message.success('Branch edited successfully.')
    })
  }

  responseError(error: HttpErrorResponse) {
    this.notification.error(
      'Request Failed',
      error?.message,
      {nzDuration: 0}
    )
  }
}
