import {TagDto} from './tag.dto';

export type DocumentScope = 'ALL_CLIENT' | 'SELECTED_SITES' | 'UNASSIGNED';

export interface DocumentDto {
  id: number;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  categoryId: number | null;
  category: string | null;
  user: string;
  projectId: number | null;
  projectName: string | null;
  scope: DocumentScope;
  tags: TagDto[];
  downloadAvailable: boolean;
}

export interface DocumentRequestDto {
  categoryId: number;
  projectId: number | null;
  scope: 'ALL_CLIENT' | 'SELECTED_SITES';
  tagIds: number[];
}
