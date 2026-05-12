import {Component, input} from '@angular/core';
import {NzTableComponent, NzThAddOnComponent} from 'ng-zorro-antd/table';
import {TableData} from '../../interfaces/table/table-data';
import {ReportCountTagsComponent} from '../report-count-tags-component/report-count-tags-component';
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
    ReportCountTagsComponent,
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
}
