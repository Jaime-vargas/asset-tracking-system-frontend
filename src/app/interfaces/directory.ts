export interface DirectoryScope {
  clientId: number;
  clientName: string;
  tagId?: number | null;
  tagName?: string | null;
  tagColor?: string | null;
}
export interface DirectoryOption {
  id: number;
  name: string;
}
export interface SiteGroup<T> {
  key: string;
  clientId: number;
  clientName: string;
  siteId: number;
  siteName: string;
  color?: string | null;
  items: T[];
}
