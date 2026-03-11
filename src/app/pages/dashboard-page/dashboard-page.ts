import { Component } from '@angular/core';
import {DasboardCardComponent} from '../../components/dasboard-card-component/dasboard-card-component';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {NzCellBreakWordDirective, NzTableComponent, NzThMeasureDirective} from 'ng-zorro-antd/table';
import { NzGridModule } from 'ng-zorro-antd/grid';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {DasboardGreyCardComponent} from '../../components/dasboard-grey-card-component/dasboard-grey-card-component';

@Component({
  selector: 'app-dashboard-page',
  imports: [DasboardCardComponent, DasboardGreyCardComponent, DasboardBoxComponent, NzTypographyComponent, NzDividerComponent, NzFlexDirective, NzIconModule, NzTableComponent, NzGridModule, NzButtonComponent, NzThMeasureDirective, NzCellBreakWordDirective, NzTagComponent, DasboardGreyCardComponent],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {

  //color tags
  priorityColorTag(priority: string){
      if(priority === 'Alta') return '#c72e30';
      if (priority === 'Media')return '#ec8a42';
      if (priority === 'Baja')return '#428d5b';
      else return '#CCC';
  }
  statusColorTag(status: string){
    if(status === 'Overdue') return '#c72e30';
    if (status === 'Activo')return '#ec8a42';
    else return '#CCC';
  }

  //table data
  listOfData = [
    { id: '#101', title: 'Camara no se ve', priority: 'Alta', dueDate: '2026-03-09', status: 'Activo' },
    { id: '#102', title: 'Servidor sin conexión', priority: 'Alta', dueDate: '2026-03-10', status: 'Activo' },
    { id: '#103', title: 'Laptop no enciende', priority: 'Media', dueDate: '2026-03-12', status: 'Activo' },
    { id: '#104', title: 'Problema con impresora', priority: 'Baja', dueDate: '2026-03-15', status: 'Activo' },
    { id: '#105', title: 'Router reiniciándose', priority: 'Alta', dueDate: '2026-03-08', status: 'Overdue' },
    { id: '#106', title: 'Pantalla dañada', priority: 'Media', dueDate: '2026-03-18', status: 'Overdue' },
    { id: '#107', title: 'Acceso a red lento', priority: 'Baja', dueDate: '2026-03-20', status: 'Activo' },
    { id: '#108', title: 'Correo no sincroniza', priority: 'Media', dueDate: '2026-03-11', status: 'Activo' }
  ];
}
