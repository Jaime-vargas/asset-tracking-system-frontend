import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ClientTableDto} from '../interfaces/client-table.dto';

@Injectable({
  providedIn: 'root',
})
export class ClientStore  {

  private clientList =
    new BehaviorSubject<ClientTableDto[] | null>(null);

  clientList$ = this.clientList.asObservable();

  setClientList(clientList: ClientTableDto[]){
    this.clientList.next(clientList);
  }
}
