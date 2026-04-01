import {Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {Observable} from 'rxjs';
import {HardwareDetailDto} from '../interfaces/hardware-dto/hardware-detail.dto';
import {HardwareTableDto} from '../interfaces/hardware-dto/hardware-table.dto';
import {ReportTableDto} from '../interfaces/report-dto/report-table.dto';

@Injectable({providedIn: 'root'})
export class HardwareService{

  constructor(private api: ApiUrlBaseService) {
  }

  getAllHardware(): Observable<HardwareTableDto[]> {
    return this.api.get(`hardware`);
  }

  getHardwareDetail(hardwareID: number): Observable<HardwareDetailDto> {
    return this.api.get(`hardware/${hardwareID}`);
  }

  getHardwareReports(hardwareID: number): Observable<ReportTableDto[]>{
    return this.api.get(`hardware/${hardwareID}/reports`);
  }

}
