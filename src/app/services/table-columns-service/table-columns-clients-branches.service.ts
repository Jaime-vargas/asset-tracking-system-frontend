import {Injectable} from '@angular/core';
import {ColumnItem} from '../../interfaces/table/column-item';
import {createSortFn} from './create-sort-function';

@Injectable({
  providedIn: 'root'
})

export class TableClientsBranchesService {
  public tableColumns:ColumnItem[] = [
      {
        key:'name',
        label: 'Name',
        colWidth: 250,
        fixed: null,
        type: 'string',
        sortOrder: "ascend",
        sortFn: createSortFn('name', 'string'),
        sortDirections: ['ascend', 'descend'],
      },
      {
        key:'totalHardware',
        label: 'Hardware',
        colWidth: 100,
        fixed: null,
        type: 'icon-hardware',
        sortOrder: null,
        sortFn: createSortFn('totalHardware', 'string'),
        sortDirections: ['ascend', 'descend', null]
      },
      {
        key:'reportsActive',
        label: 'Reports',
        colWidth: 230,
        fixed: null,
        type: 'report-count-tag',
        sortOrder: null,
        sortFn: createSortFn('reportsActive', 'array'),
        sortDirections: ['descend', 'ascend', null]

      },
      {
        key:'actions',
        label: 'Actions',
        colWidth: 250,
        fixed: null,
        type: 'button',
        sortOrder: null,
        sortFn: null,
        sortDirections: [null]
      },
    ]
}
