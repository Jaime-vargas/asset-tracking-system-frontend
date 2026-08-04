import {NzTableSortFn, NzTableSortOrder} from 'ng-zorro-antd/table';

type colType =
  'button' |
  'date'|
  'file-icon' |
  'formatted-date'|
  'icon-branch'|
  'icon-hardware'|
  'img-string'|
  'size'|
  'priority-tag'|
  'report-count-tag'|
  'status-tag'|
  'string';

export interface ColumnItem {
  key:string,
  label: string;
  colWidth: number;
  fixed: 'nzLeft' | 'nzRight' | null;
  type: colType;
  priority?: number | boolean;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<Record<string, any>> | null;
  sortDirections: NzTableSortOrder[];
}
