import {Component, inject, input} from '@angular/core';
import {NzTableComponent, NzThAddOnComponent} from 'ng-zorro-antd/table';
import {TableData} from '../../interfaces/table/table-data';
import {ReportCountTagsComponent} from '../report-count-tags-component/report-count-tags-component';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {Router, RouterLink} from '@angular/router';
import {ButtonComponent} from '../button-component/button-component';
import {ColumnItem} from '../../interfaces/table/column-item';
import { NzTableModule } from 'ng-zorro-antd/table';
import {PriorityTagsComponent} from '../priority-tags-component/priority-tags-component';
import {SingleStatusTagsComponent} from '../single-status-tags-component/single-status-tags-component';
import {ApiUrlBaseService} from '../../services/api-url-base.service';
import {NzImageDirective} from 'ng-zorro-antd/image';
import {UtilityService} from '../../services/utility.service';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-table-component',
  imports: [
    NzTableComponent,
    ReportCountTagsComponent,
    NzIconDirective,
    RouterLink,
    ButtonComponent,
    NzThAddOnComponent,
    NzTableModule,
    PriorityTagsComponent,
    SingleStatusTagsComponent,
    NzImageDirective,
    NgOptimizedImage
  ],
  templateUrl: './table-component.html',
  styleUrl: './table-component.css',
})

export class TableComponent {
  apiUrlBaseService = inject(ApiUrlBaseService);
  router = inject(Router);
  utilityService = inject(UtilityService);

  tableLoading = input<boolean>(false);
  tableColumns = input.required<ColumnItem[]>();
  tableData = input.required<TableData[]>();
}
