import {Component, input, output} from '@angular/core';
import {NzTableComponent, NzThAddOnComponent} from 'ng-zorro-antd/table';
import {TableData} from '../../interfaces/table/table-data';
import {ReportCountTagsComponent} from '../report-count-tags-component/report-count-tags-component';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {RouterLink} from '@angular/router';
import {ButtonComponent} from '../button-component/button-component';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {ColumnItem} from '../../interfaces/table/column-item';
import { NzTableModule } from 'ng-zorro-antd/table';
import {PriorityTagsComponent} from '../priority-tags-component/priority-tags-component';
import {SingleStatusTagsComponent} from '../single-status-tags-component/single-status-tags-component';
import {ApiUrlBaseService} from '../../services/api-url-base.service';
import {NzImageDirective} from 'ng-zorro-antd/image';


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
    NzTableModule,
    PriorityTagsComponent,
    SingleStatusTagsComponent,
    NzImageDirective
  ],
  templateUrl: './table-component.html',
  styleUrl: './table-component.css',
})

export class TableComponent {
  constructor(protected apiUrlBaseService: ApiUrlBaseService) {
  }
  tableColumns = input.required<ColumnItem[]>();
  tableData = input.required<TableData[]>();
}
