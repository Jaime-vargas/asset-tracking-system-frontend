import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';

type mode = 'add' | 'edit';

@Injectable({
  providedIn: 'root',
})

export class SidebarStore{

  private formModeSubjet =
    new BehaviorSubject<mode>("add");

  private isOpenSubjet =
    new BehaviorSubject<boolean>(false);

  private refreshTableSubjet =
    new Subject<void>();

  private selectedEntitySubjet =
    new BehaviorSubject<any>(null);

  formMode$ = this.formModeSubjet.asObservable();

  isOpen$ = this.isOpenSubjet.asObservable();

  refreshTable$ = this.refreshTableSubjet.asObservable();

  selectedEntity$ = this.selectedEntitySubjet.asObservable();

  open(): void {
    this.isOpenSubjet.next(true);
  }
  close(): void {
    this.isOpenSubjet.next(false);
  }

  setSelectedEntity(selectedEntity: any): void {
    this.selectedEntitySubjet.next(selectedEntity);
  }

  clearSelectedEntity(): void {
    this.selectedEntitySubjet.next(null);
  }

  setMode(mode:mode){
    this.formModeSubjet.next(mode);
  }

  triggerRefreshTable(){
    this.refreshTableSubjet.next();
  }

}
