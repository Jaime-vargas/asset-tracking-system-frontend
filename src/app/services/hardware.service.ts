import {Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {Observable} from 'rxjs';
import {HardwareTableDto} from '../interfaces/hardware/hardware-table.dto';
import {ReportTableDto} from '../interfaces/report/report-table.dto';
import {HardwareUnion} from '../interfaces/hardware/hardware-union';

@Injectable({providedIn: 'root'})
export class HardwareService{

  constructor(private api: ApiUrlBaseService) {
  }

  getAllHardware(): Observable<HardwareTableDto[]> {
    return this.api.get(`hardware`);
  }

  getHardwareDetail(hardwareID: number): Observable<HardwareUnion> {
    return this.api.get(`hardware/${hardwareID}`);
  }

  getHardwareReports(hardwareID: number): Observable<ReportTableDto[]>{
    return this.api.get(`hardware/${hardwareID}/reports`);
  }

}
