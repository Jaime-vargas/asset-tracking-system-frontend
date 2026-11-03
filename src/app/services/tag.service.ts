import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiUrlBaseService} from './api-url-base.service';
import {TagDto} from '../interfaces/tag.dto';

@Injectable({providedIn: 'root'})
export class TagService {
  private api = inject(ApiUrlBaseService);

  getClientTags(clientId: number): Observable<TagDto[]> {
    return this.api.get(`clients/${clientId}/tags`);
  }

  addTag(clientId: number, name: string): Observable<TagDto> {
    return this.api.post(`clients/${clientId}/tags`, {name});
  }
}
