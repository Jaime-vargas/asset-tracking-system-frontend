import {ColumnItem} from '../../interfaces/table/column-item';
import {createSortFn} from './create-sort-function';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class TableColumnsHardwareService {
  public tableColumns:ColumnItem[] = [
    {
      key:'clientName',
      label:'Client',
      colWidth: 200,
      fixed: "nzLeft",
      type: "string",
      sortOrder: null,
      sortFn: createSortFn('clientName', 'string'),
      sortDirections: ['ascend', 'descend']
    },
    {
      key:'branchName',
      label:'Project',
      colWidth: 200,
      fixed: null,
      type: "string",
      sortOrder: null,
      sortFn: createSortFn('branchName', 'string'),
      sortDirections: ['ascend', 'descend']
    },
    {
      key:'type',
      label:'Type',
      colWidth: 100,
      fixed: null,
      type: "icon-hardware",
      sortOrder: null,
      sortFn: createSortFn('type', 'number'),
      sortDirections: ['ascend', 'descend', null]
    },
    {
      key:'name',
      label:'Name',
      fixed: null,
      colWidth: 250,
      type: 'string',
      sortOrder: null,
      sortFn: createSortFn('name', "string"),
      sortDirections: ['ascend', 'descend']
    },
    {
      key:'model',
      label:'Model',
      colWidth:200,
      fixed: null,
      type:'string',
      sortOrder: null,
      sortFn: createSortFn('model',"string"),
      sortDirections: ['ascend', 'descend']
    },
    {
      key:'serialNumber',
      label:'Serial Number',
      colWidth:200,
      fixed: null,
      type:'string',
      sortOrder: null,
      sortFn: createSortFn('serialNumber',"string"),
      sortDirections: ['ascend', 'descend', null]
    },
    {
      key:'location',
      label:'Location',
      colWidth:200,
      fixed: null,
      type:'string',
      sortOrder: null,
      sortFn: createSortFn('location',"string"),
      sortDirections: ['ascend', 'descend']
    },
    {
      key:'reportsActive',
      label:'Reports',
      colWidth:220,
      fixed: null,
      type:'report-count-tag',
      sortOrder: null,
      sortFn: createSortFn('reportsActive',"array"),
      sortDirections: ['ascend', 'descend', null]
    },
    {
      key:'lastMaintenanceDate',
      label:'Last Update',
      colWidth:200,
      fixed: null,
      type:'formatted-date',
      sortOrder: null,
      sortFn: createSortFn('lastMaintenanceDate',"string"),
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
