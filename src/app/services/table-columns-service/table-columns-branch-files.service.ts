import {ColumnItem} from '../../interfaces/table/column-item';
import {createSortFn} from './create-sort-function';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class TableColumnsBranchFiles {
  public tableColumns:ColumnItem[] = [
    {
      key:'filename',
      label:'File Name',
      colWidth: 400,
      fixed: "nzLeft",
      type: "file-icon",
      sortOrder: null,
      sortFn: createSortFn('filename', 'string'),
      sortDirections: ['ascend', 'descend', null]
    },
    {
      key:'category',
      label:'Category',
      colWidth: 110,
      fixed: null,
      type: "string",
      sortOrder: null,
      sortFn: createSortFn('category', 'string'),
      sortDirections: ['ascend', 'descend', null]
    },
    {
      key:'contentType',
      label:'Type',
      colWidth: 80,
      fixed: null,
      type: "string",
      sortOrder: null,
      sortFn: createSortFn('contentType', 'string'),
      sortDirections: ['ascend', 'descend', null]
    },
    {
      key:'user',
      label:'Uploaded By',
      colWidth: 130,
      fixed: null,
      type: "string",
      sortOrder: null,
      sortFn: createSortFn('user', 'string'),
      sortDirections: ['ascend', 'descend', null]
    },
    {
      key:'size',
      label:'Size',
      colWidth: 100,
      fixed: null,
      type: "size",
      sortOrder: null,
      sortFn: null,
      sortDirections: [null]
    },
    {
      key:'actions',
      label:'Actions',
      colWidth: 100,
      fixed: null,
      type: "button",
      sortOrder: null,
      sortFn: null,
      sortDirections: [null]
    },
  ];
}
