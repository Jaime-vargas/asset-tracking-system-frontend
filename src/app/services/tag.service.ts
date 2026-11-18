import { TagColor } from '../interfaces/tag-color';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiUrlBaseService } from './api-url-base.service';
import { TagDto } from '../interfaces/tag.dto';

@Injectable({ providedIn: 'root' })
export class TagService {
  private api = inject(ApiUrlBaseService);

  deleteTag(clientId: number, tagId: number): Observable<void> {
    return this.api.delete(`clients/${clientId}/tags/${tagId}`);
  }
  editTag(clientId: number, tagId: number, name: string, color: TagColor): Observable<TagDto> {
    return this.api.put(`clients/${clientId}/tags/${tagId}`, { name, color });
  }
  getClientTags(clientId: number): Observable<TagDto[]> {
    return this.api.get(`clients/${clientId}/tags`);
  }

  addTag(clientId: number, name: string, color: TagColor = 'PURPLE'): Observable<TagDto> {
    return this.api.post(`clients/${clientId}/tags`, { name, color });
  }
}
