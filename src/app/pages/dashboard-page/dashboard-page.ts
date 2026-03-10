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

@Component({
  selector: 'app-dashboard-page',
  imports: [DasboardCardComponent, DasboardBoxComponent, NzTypographyComponent, NzDividerComponent, NzFlexDirective, NzIconModule, NzTableComponent, NzGridModule, NzButtonComponent, NzThMeasureDirective, NzCellBreakWordDirective],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {

  //table data
  listOfData = [
    { id: '#101', title: 'Camara no se ve', priority: 'Alta', dueDate: '2026-03-09', status: 'Activo' },
    { id: '#102', title: 'Servidor sin conexión', priority: 'Alta', dueDate: '2026-03-10', status: 'Activo' },
    { id: '#103', title: 'Laptop no enciende', priority: 'Media', dueDate: '2026-03-12', status: 'Pendiente' },
    { id: '#104', title: 'Problema con impresora', priority: 'Baja', dueDate: '2026-03-15', status: 'Activo' },
    { id: '#105', title: 'Router reiniciándose', priority: 'Alta', dueDate: '2026-03-08', status: 'Overdue' },
    { id: '#106', title: 'Pantalla dañada', priority: 'Media', dueDate: '2026-03-18', status: 'Pendiente' },
    { id: '#107', title: 'Acceso a red lento', priority: 'Baja', dueDate: '2026-03-20', status: 'Activo' },
    { id: '#108', title: 'Correo no sincroniza', priority: 'Media', dueDate: '2026-03-11', status: 'Activo' },
    { id: '#109', title: 'Actualización fallida', priority: 'Alta', dueDate: '2026-03-07', status: 'Overdue' },
    { id: '#110', title: 'Teclado no responde', priority: 'Baja', dueDate: '2026-03-22', status: 'Pendiente' }
  ];

}
