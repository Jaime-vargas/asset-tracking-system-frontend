import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {BranchTableDto} from '../interfaces/branch-table.dto';

@Injectable({providedIn: "root"})
export class BranchStore {

  private branchList =
    new BehaviorSubject<BranchTableDto[] | null>(null);

  branchList$ = this.branchList.asObservable();

  setBranchList = (newBranchList: BranchTableDto[]) => {
    this.branchList.next(newBranchList);
  }
}
