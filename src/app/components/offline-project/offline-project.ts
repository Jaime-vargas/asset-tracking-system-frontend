import { DatePipe } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { OfflineFile, OfflineProject, OfflineProjectService } from '../../services/offline-project.service';

@Component({
  selector: 'app-offline-project',
  imports: [DatePipe, NzButtonModule],
  templateUrl: './offline-project.html',
  styles: [`
    :host { display: block; margin-block: 12px; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    ul { padding-inline-start: 20px; }
    li { overflow-wrap: anywhere; }
    p { margin-block: 8px; }
  `],
})
export class OfflineProjectComponent {
  readonly clientId = input.required<number>();
  readonly projectId = input.required<number>();
  private readonly offline = inject(OfflineProjectService);
  protected readonly snapshot = signal<OfflineProject | null>(null);
  protected readonly expanded = signal(!navigator.onLine);
  protected readonly busy = signal(false);
  protected readonly message = signal('');

  constructor() {
    effect(onCleanup => {
      const clientId = this.clientId();
      const projectId = this.projectId();
      let current = true;
      this.snapshot.set(null);
      onCleanup(() => { current = false; });
      void this.offline.read(clientId, projectId).then(snapshot => {
        if (current) this.snapshot.set(snapshot ?? null);
      }).catch(() => {
        if (current) this.message.set('Saved projects could not be opened on this device.');
      });
    });
  }

  protected async download() {
    const client = this.clientId();
    const project = this.projectId();
    this.busy.set(true);
    this.message.set('Preparing project…');
    try {
      const snapshot = await this.offline.download(client, project, message => this.message.set(message));
      if (client === this.clientId() && project === this.projectId()) this.snapshot.set(snapshot);
      this.message.set('');
    } catch {
      this.message.set('Download could not finish. Check your connection and available storage, then retry.');
    } finally {
      this.busy.set(false);
    }
  }

  protected async remove() {
    try {
      await this.offline.remove(this.clientId(), this.projectId());
      this.snapshot.set(null);
      this.expanded.set(false);
      this.message.set('');
    } catch {
      this.message.set('The offline copy could not be removed.');
    }
  }

  protected openFile(file: OfflineFile) {
    const url = URL.createObjectURL(file.bytes);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
