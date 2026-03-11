import {Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {DashboardDataDto} from '../interfaces/dashboard-data.dto';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class DashboardService{

  constructor(private api: ApiUrlBaseService) {
  }

  getDashboardData(): Observable<DashboardDataDto>{
    return this.api.get("dashboard");
  }
}
