import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { AuthService } from './auth-service';
import { MaintenanceService } from './maintenance.service';

interface PendingPhoto {
  id: string;
  owner: string;
  projectId: number;
  reviewId: number;
  file: File;
}

@Injectable({ providedIn: 'root' })
export class MaintenancePhotoQueue {
  private readonly auth = inject(AuthService);
  private readonly api = inject(MaintenanceService);
  private database?: Promise<IDBDatabase>;
  private syncing = false;
  private retryRequested = false;
  private readonly state = signal<PendingPhoto[]>([]);
  readonly pending = this.state.asReadonly();
  readonly lastUploaded = signal<{projectId: number; reviewId: number} | null>(null);

  start() {
    window.addEventListener('online', () => void this.sync());
    window.addEventListener('focus', () => void this.sync());
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) void this.sync();
    });
    window.setInterval(() => {
      if (!document.hidden && this.state().length) void this.sync();
    }, 30_000);
    void this.sync();
  }

  owner() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return this.auth.getAllUserDataOnToken(token)?.username ?? null;
    } catch {
      return null;
    }
  }

  async enqueue(projectId: number, reviewId: number, file: File) {
    const owner = this.owner();
    if (!owner) throw new Error('Sign in to save photos.');
    const photo = { id: crypto.randomUUID(), owner, projectId, reviewId, file };
    await this.write(store => store.add(photo));
    this.state.update(items => [...items, photo]);
    void this.sync();
  }

  async sync() {
    if (this.syncing) {
      this.retryRequested = true;
      return;
    }
    const locks = navigator.locks;
    if (locks) {
      await locks.request('assets-control-maintenance-photos', () => this.flush());
    } else {
      await this.flush();
    }
  }

  private async flush() {
    if (this.syncing) return;
    this.syncing = true;
    try {
      const entries = await this.readAll();
      this.state.set(entries);
      const owner = this.owner();
      if (!owner || !navigator.onLine || !this.auth.isValidToken()) return;
      for (const photo of entries) {
        if (photo.owner !== owner) continue;
        if (this.owner() !== owner || !this.auth.isValidToken()) break;
        try {
          await firstValueFrom(this.api.addPhoto(photo.projectId, photo.reviewId, photo.file).pipe(timeout(90_000)));
        } catch (error) {
          if (error instanceof HttpErrorResponse && [400, 404, 413, 415, 422].includes(error.status)) continue;
          break;
        }
        await this.write(store => store.delete(photo.id));
        this.state.update(items => items.filter(item => item.id !== photo.id));
        this.lastUploaded.set({ projectId: photo.projectId, reviewId: photo.reviewId });
      }
    } catch {
      // Keep the persisted entries for the next attempt.
    } finally {
      this.syncing = false;
      if (this.retryRequested) {
        this.retryRequested = false;
        void this.sync();
      }
    }
  }

  private open() {
    return this.database ??= new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('assets-control-maintenance', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('photos', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        this.database = undefined;
        reject(request.error);
      };
    });
  }

  private async readAll() {
    const database = await this.open();
    return new Promise<PendingPhoto[]>((resolve, reject) => {
      const request = database.transaction('photos').objectStore('photos').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async write(action: (store: IDBObjectStore) => void) {
    const database = await this.open();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('photos', 'readwrite');
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
      action(transaction.objectStore('photos'));
    });
  }
}
