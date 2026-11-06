import { effect, inject, Signal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiUrlBaseService } from './api-url-base.service';

export function evidencePhotoUrls(photoIds: Signal<readonly number[]>) {
  const http = inject(HttpClient);
  const api = inject(ApiUrlBaseService);
  const urls = signal(new Map<number, string>());

  effect(onCleanup => {
    const ids = photoIds();
    urls.set(new Map());
    const created: string[] = [];
    const requests = ids.map(id => http.get(`${api.baseUrl}/evidence/${id}`, { responseType: 'blob' })
      .subscribe({
        next: blob => {
          const url = URL.createObjectURL(blob);
          created.push(url);
          urls.update(current => new Map(current).set(id, url));
        },
        error: () => { /* The photo's placeholder stays visible. */ },
      }));
    onCleanup(() => {
      requests.forEach(request => request.unsubscribe());
      created.forEach(url => URL.revokeObjectURL(url));
    });
  });
  return urls.asReadonly();
}
