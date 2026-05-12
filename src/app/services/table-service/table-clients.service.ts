import {Injectable} from '@angular/core';
import {ColumnItem} from '../../interfaces/table/column-item';
import {createSortFn} from './create-sort-function';

@Injectable({
  providedIn: 'root'
})

export class TableClientService {
  public tableColumns:ColumnItem[] = [
      {
        key:'name',
        label: 'Name',
        colWidth: 250,
        type: 'string',
        sortOrder: "ascend",
        sortFn: createSortFn('name', 'string'),
        sortDirections: ['ascend', 'descend'],
      },
      {
        key:'branches',
        label: 'Branches',
        colWidth: 100,
        type: 'icon-branch',
        sortOrder: null,
        sortFn: createSortFn('branches', 'string'),
        sortDirections: ['ascend', 'descend', null]
      },
      {
        key:'totalHardware',
        label: 'Hardware',
        colWidth: 100,
        type: 'icon-hardware',
        sortOrder: null,
        sortFn: createSortFn('totalHardware', 'number'),
        sortDirections: ['descend', 'ascend', null]
      },
      {
        key:'reportsActive',
        label: 'Reports',
        colWidth: 230,
        type: 'report-count-tag',
        sortOrder: null,
        sortFn: createSortFn('reportsActive', 'array'),
        sortDirections: ['descend', 'ascend', null]

      },
      {
        key:'actions',
        label: 'Actions',
        colWidth: 250,
        type: 'button',
        sortOrder: null,
        sortFn: null,
        sortDirections: [null]
      },
    ]
}
