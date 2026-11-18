import { DirectoryScope, DirectoryOption, SiteGroup } from '../interfaces/directory';
export function directoryClients(records: DirectoryScope[]): DirectoryOption[] {
  return [
    ...new Map(records.map(item => [
      item.clientId, {
        id: item.clientId, name: item.clientName
      }
    ])).values()
  ]
    .sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id);
}
export function directorySites(records: DirectoryScope[], clientId: number | null): DirectoryOption[] {
  return [
    ...new Map(records.filter(item => clientId === null || item.clientId === clientId).map(item => [
      item.tagId ?? 0,
      {
        id: item.tagId ?? 0, name: clientId === null ? `${item.tagName || 'Site not assigned'} - ${item.clientName}` : item.tagName || 'Site not assigned'
      }
    ])).values()
  ]
    .sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id);
}
export function scopeOrder(a: DirectoryScope, b: DirectoryScope) {
  return a.clientName.localeCompare(b.clientName) || a.clientId - b.clientId
    || (a.tagName ?? '').localeCompare(b.tagName ?? '') || (a.tagId ?? 0) - (b.tagId ?? 0);
}
export function groupBySite<T extends DirectoryScope>(records: T[], grouped: boolean): SiteGroup<T>[] {
  if (!grouped)
    return records.length ? [
      {
        key: 'all', clientId: 0, clientName: '', siteId: 0, siteName: '', items: records
      }
    ] : [];
  const groups = new Map<string, SiteGroup<T>>();
  for (const item of records) {
    const key = `${item.clientId}:${item.tagId ?? 0}`;
    if (!groups.has(key))
      groups.set(key, {
        key, clientId: item.clientId, clientName: item.clientName, siteId: item.tagId ?? 0, siteName: item.tagName || 'Site not assigned', color: item.tagColor, items: []
      });
    groups.get(key)!.items.push(item);
  }
  return [
    ...groups.values()
  ];
}
export function validDirectoryDate(value: string | null | undefined): Date | null {
  if (!value || value === 'N/A')
    return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
export function matchesDirectorySearch(query: string, values: unknown[]): boolean {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  const text = normalize(values.join(' '));
  return normalize(query).trim().split(/\s+/).every(term => text.includes(term));
}
export function directoryDateKey(value: string): string {
  const date = validDirectoryDate(value);
  if (!date)
    return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
