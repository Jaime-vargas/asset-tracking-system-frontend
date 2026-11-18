import { TagColor } from '../interfaces/tag-color';
import { inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TagService } from '../services/tag.service';
import { TagDto } from '../interfaces/tag.dto';

@Injectable({ providedIn: 'root' })
export class TagStore {
  private tagService = inject(TagService);
  private notification = inject(NzNotificationService);

  tags = signal<TagDto[]>([]);
  loading = signal(false);
  creating = signal(false);

  loadTags(clientId: number) {
    this.tags.set([]);
    this.loading.set(true);
    return this.tagService.getClientTags(clientId).pipe(
      tap((tags) => this.tags.set(tags)),
      catchError((error: HttpErrorResponse) => {
        this.responseError(error);
        return EMPTY;
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  addTag(clientId: number, name: string, color: TagColor = 'PURPLE') {
    this.creating.set(true);
    return this.tagService.addTag(clientId, name.trim(), color).pipe(
      tap((tag) =>
        this.tags.update((tags) => [...tags, tag].sort((a, b) => a.name.localeCompare(b.name))),
      ),
      catchError((error: HttpErrorResponse) => {
        this.responseError(error);
        return EMPTY;
      }),
      finalize(() => this.creating.set(false)),
    );
  }

  deleteTag(clientId: number, tagId: number) {
    this.creating.set(true);
    return this.tagService.deleteTag(clientId, tagId).pipe(
      tap(() => this.tags.update((tags) => tags.filter((tag) => tag.id !== tagId))),
      finalize(() => this.creating.set(false)),
    );
  }
  editTag(clientId: number, tagId: number, name: string, color: TagColor) {
    this.creating.set(true);
    return this.tagService.editTag(clientId, tagId, name.trim(), color).pipe(
      tap((updated) =>
        this.tags.update((tags) =>
          tags
            .map((tag) => (tag.id === updated.id ? updated : tag))
            .sort((a, b) => a.name.localeCompare(b.name)),
        ),
      ),
      catchError((error: HttpErrorResponse) => {
        this.responseError(error);
        return EMPTY;
      }),
      finalize(() => this.creating.set(false)),
    );
  }
  private responseError(error: HttpErrorResponse) {
    this.notification.error(
      'Request Failed',
      error.error?.message ?? 'Could not load or save sites.',
      { nzDuration: 0 },
    );
  }
}
