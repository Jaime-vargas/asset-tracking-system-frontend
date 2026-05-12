import {Component, input} from '@angular/core';
import {NzTableComponent, NzThAddOnComponent} from 'ng-zorro-antd/table';
import {SingleStatusTagsComponent} from '../single-status-tags-component/single-status-tags-component';
import {TableData} from '../../interfaces/table/table-data';
import {ReportCountTagsComponent} from '../report-count-tags-component/report-count-tags-component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {RouterLink} from '@angular/router';
import {ButtonComponent} from '../button-component/button-component';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {ColumnItem} from '../../interfaces/table/column-item';
import { NzTableModule } from 'ng-zorro-antd/table';


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
    NzEmptyComponent,
    NzThAddOnComponent,
    NzTableModule
  ],
  templateUrl: './table-component.html',
  styleUrl: './table-component.css',
})

export class TableComponent {
  tableColumns = input.required<ColumnItem[]>();
  tableData = input.required<TableData[]>();

  sortFn = (a: Record<string, any>, b: Record<string, any>) => {
    console.log("EXCECUTED", a, b)
    return String(a['name']).localeCompare(String(b['name']));
  }


}
