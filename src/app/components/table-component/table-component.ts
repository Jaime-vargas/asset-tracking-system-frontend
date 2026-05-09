import {Component, input} from '@angular/core';
import {NzTableComponent} from 'ng-zorro-antd/table';
import {SingleStatusTagsComponent} from '../single-status-tags-component/single-status-tags-component';
import {TableData} from '../../interfaces/type/TableData';
import {ReportCountTagsComponent} from '../report-count-tags-component/report-count-tags-component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {RouterLink} from '@angular/router';
import {ButtonComponent} from '../button-component/button-component';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';


@Component({
  selector: 'app-table-component',
  imports: [
    NzTableComponent,
    SingleStatusTagsComponent,
    ReportCountTagsComponent,
    NzButtonComponent,
    NzIconDirective,
    RouterLink,
    ButtonComponent,
    NzEmptyComponent
  ],
  templateUrl: './table-component.html',
  styleUrl: './table-component.css',
})

export class TableComponent {
  tableColumns = input.required<{key:string, colWidth:number, label: string, type:string}[]>();
  tableData = input.required<TableData[]>();

}
