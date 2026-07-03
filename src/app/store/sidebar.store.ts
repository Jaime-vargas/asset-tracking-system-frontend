import {Injectable, signal} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';

type mode = 'add' | 'edit';

@Injectable({
  providedIn: 'root',
})

export class SidebarStore{

  public isOpen = signal<boolean>(false)
}
