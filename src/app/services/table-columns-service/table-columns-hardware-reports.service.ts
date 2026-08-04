import {Injectable} from '@angular/core';
import {ColumnItem} from '../../interfaces/table/column-item';
import {createSortFn} from './create-sort-function';


@Injectable({
  providedIn: 'root'
})

export class TableColumnsHardwareReportsService {
  public tableColumns:ColumnItem[] = [
    {
      key:'id',
      label:'# ID',
      colWidth: 80,
      fixed: "nzLeft",
      type: "string",
      sortOrder: null,
      sortFn: createSortFn('id', 'string'),
      sortDirections: ['ascend', 'descend']
    },
    {
      key:'title',
      label:'Title',
      colWidth: 200,
      fixed: null,
      type: "string",
      sortOrder: null,
      sortFn: createSortFn('title', 'string'),
      sortDirections: ['ascend', 'descend', null]
    },
    {
      key:'priority',
      label:'Priority',
      colWidth: 100,
      fixed: null,
      type: "priority-tag",
      sortOrder: null,
      sortFn: createSortFn('priority', 'string'),
      sortDirections: ['ascend', 'descend', null]
    },
    {
      key:'createdDate',
      label:'Created At',
      fixed: null,
      colWidth: 150,
      type: 'formatted-date',
      sortOrder: null,
      sortFn: createSortFn('createdDate', "date"),
      sortDirections: ['ascend', 'descend', null]
    },
    {
      key:'dueDate',
      label:'Due Date',
      fixed: null,
      colWidth: 150,
      type: 'formatted-date',
      sortOrder: null,
      sortFn: createSortFn('dueDate', "date"),
      sortDirections: ['ascend', 'descend', null]
    },
    {
      key:'status',
      label:'Status',
      colWidth:100,
      fixed: null,
      type:'status-tag',
      sortOrder: null,
      sortFn: createSortFn('status',"string"),
      sortDirections: ['ascend', 'descend', null]
    },
    {
      key:'actions',
      label: 'Actions',
      colWidth: 100,
      fixed: null,
      type: 'button',
      sortOrder: null,
      sortFn: null,
      sortDirections: [null]
    }
  ]
}
