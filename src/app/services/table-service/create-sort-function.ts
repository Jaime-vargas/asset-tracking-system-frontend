import { NzTableSortFn } from 'ng-zorro-antd/table';

export function createSortFn(
  key: string,
  type: 'array' | 'number' | 'string'
): NzTableSortFn<Record<string, any>> {

  return (a: Record<string, any>, b: Record<string, any>) => {

    const valueA = a[key];
    const valueB = b[key];

    switch (type) {

      case 'array':
        return valueA.length - valueB.length;

      case 'number':
        return Number(valueA) - Number(valueB);

      case 'string':
      default:
        return String(valueA).localeCompare(String(valueB));
    }
  };
}
