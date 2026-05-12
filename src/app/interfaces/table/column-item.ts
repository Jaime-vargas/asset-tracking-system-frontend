import {NzTableSortFn, NzTableSortOrder} from 'ng-zorro-antd/table';

export interface ColumnItem {
  key:string,
  label: string;
  colWidth: number;
  type: 'button'|'icon-branch'|'icon-hardware'|'report-count-tag'|'string';
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<Record<string, any>> | null;
  sortDirections: NzTableSortOrder[];
}
