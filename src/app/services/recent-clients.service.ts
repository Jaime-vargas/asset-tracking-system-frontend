import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth-service';

@Injectable({ providedIn: 'root' })
export class RecentClientsService {
  private auth = inject(AuthService);

  getIds(): number[] {
    try {
      const key = this.storageKey();
      const ids: unknown = key ? JSON.parse(localStorage.getItem(key) ?? '[]') : [];
      return Array.isArray(ids) ? ids.filter((id) => Number.isSafeInteger(id) && id > 0) : [];
    } catch {
      return [];
    }
  }

  record(clientId: number) {
    try {
      const key = this.storageKey();
      if (!key) return;
      const ids = this.getIds().filter((id) => id !== clientId);
      localStorage.setItem(key, JSON.stringify([clientId, ...ids]));
    } catch {
      // The directory still works when browser storage is unavailable.
    }
  }

  private storageKey() {
    const username = this.auth.getAllUserDataOnToken(localStorage.getItem('token'))?.username;
    return username ? 'recent-clients:' + username : null;
  }
}
