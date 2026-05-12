import {computed, Injectable} from '@angular/core';
import {ColumnItem} from '../../interfaces/table/column-item';

@Injectable({
  providedIn: 'root'
})

export class TableClientService {
  public tableColumns:ColumnItem[] = [
      {
        key:'name',
        label: 'Name',
        colWidth: 150,
        type: 'string',
        sortOrder: "ascend",
        sortFn: (a: Record<string, any>, b: Record<string, any>) =>
          String(a['name']).localeCompare(String(b['name'])),
        sortDirections: ['ascend', 'descend']
      },
      {
        key:'branches',
        label: 'Branches',
        colWidth: 80,
        type: 'icon-branch',
        sortOrder: null,
        sortFn: null,
        sortDirections: [null]
      },
      {
        key:'totalHardware',
        label: 'Hardware',
        colWidth: 80,
        type: 'icon-hardware',
        sortOrder: null,
        sortFn: (a: Record<string, any>, b: Record<string, any>) =>
          a['totalHardware'] - b['totalHardware'],
        sortDirections: ['ascend', 'descend', null]
      },
      {
        key:'reportsActive',
        label: 'Reports',
        colWidth: 150,
        type: 'report-count-tag',
        sortOrder: null,
        sortFn: (a: Record<string, any[]>, b: Record<string, any[]>) =>
          a['reportsActive'].length - b['totalHardware'].length,
        sortDirections: ['ascend', 'descend', null]
      },
      {
        key:'actions',
        label: 'Actions',
        colWidth: 200,
        type: 'button',
        sortOrder: null,
        sortFn: null,
        sortDirections: [null]
      },
    ]
}
