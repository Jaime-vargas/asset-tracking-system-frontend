import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable, timeout } from 'rxjs';
import { DocumentDto } from '../interfaces/document.dto';
import { HardwareTableDto } from '../interfaces/hardware/hardware-table.dto';
import { ReportDetailDto } from '../interfaces/report/report-detail.dto';
import { ApiUrlBaseService } from './api-url-base.service';
import { AuthService } from './auth-service';
import { DocumentService } from './document.service';
import { HardwareService } from './hardware.service';
import { MaintenanceDraft, MaintenanceService } from './maintenance.service';
import { ReportsService } from './report.service';

export interface OfflineFile {
  name: string;
  group: string;
  bytes: Blob;
}

export interface OfflineProject {
  savedAt: string;
  hardware: HardwareTableDto[];
  reports: ReportDetailDto[];
  maintenance: MaintenanceDraft | null;
  files: OfflineFile[];
}

@Injectable({ providedIn: 'root' })
export class OfflineProjectService {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiUrlBaseService);
  private readonly documents = inject(DocumentService);
  private readonly hardware = inject(HardwareService);
  private readonly reports = inject(ReportsService);
  private readonly maintenance = inject(MaintenanceService);

  async download(clientId: number, projectId: number, progress: (message: string) => void) {
    const key = this.key(clientId, projectId);
    const [hardware, rows, maintenance, projectDocuments, clientDocuments] = await Promise.all([
      this.request(this.hardware.getHardwareByBranchId(projectId)),
      this.request(this.reports.getProjectReports(projectId)),
      this.request(this.maintenance.get(projectId)),
      this.request(this.documents.getDocuments(clientId, projectId)),
      this.request(this.documents.getDocuments(clientId)),
    ]);
    const reports: ReportDetailDto[] = [];
    const files: OfflineFile[] = [];
    for (const row of rows) {
      progress('Downloading report ' + row.id + '…');
      const report = await this.request(this.reports.getReportById(row.id));
      reports.push(report);
      for (const photo of report.photos) {
        const bytes = await this.request(this.api.getMultipart('api/v1/evidence/' + photo.id));
        files.push({ name: photo.filename, group: 'Report #' + report.id, bytes });
      }
    }
    for (const review of maintenance?.reviews ?? []) {
      progress('Downloading maintenance photos for ' + review.hardwareName + '…');
      const photos = await this.request(this.maintenance.listPhotos(projectId, review.id));
      for (const photo of photos) {
        const bytes = await this.request(this.maintenance.downloadPhoto(projectId, review.id, photo.id));
        files.push({ name: photo.filename, group: 'Maintenance · ' + review.hardwareName, bytes });
      }
    }
    const addDocuments = async (documents: DocumentDto[], group: string) => {
      for (const document of documents) {
        progress('Downloading ' + document.filename + '…');
        const response = await this.request(this.documents.downloadVersion(clientId, document.id, document.currentVersion));
        if (!response.body) throw new Error('Missing document content');
        files.push({ name: document.filename, group, bytes: response.body });
      }
    };
    await addDocuments(projectDocuments, 'Project documents');
    await addDocuments(clientDocuments, 'Client documents');
    if (key !== this.key(clientId, projectId)) throw new Error('Session changed');
    const snapshot: OfflineProject = { savedAt: new Date().toISOString(), hardware, reports, maintenance, files };
    await this.access('readwrite', store => store.put(snapshot, key));
    return snapshot;
  }

  async read(clientId: number, projectId: number) {
    const key = this.key(clientId, projectId);
    return this.access<OfflineProject | undefined>('readonly', store => store.get(key));
  }

  remove(clientId: number, projectId: number) {
    const key = this.key(clientId, projectId);
    return this.access('readwrite', store => store.delete(key));
  }

  private request<T>(request: Observable<T>) {
    return firstValueFrom(request.pipe(timeout(120_000)));
  }

  private key(clientId: number, projectId: number) {
    if (!this.auth.isValidToken()) throw new Error('Sign in to access offline projects');
    const username = this.auth.getAllUserDataOnToken(localStorage.getItem('token'))?.username;
    if (!username) throw new Error('Sign in to access offline projects');
    return JSON.stringify([username, clientId, projectId]);
  }

  private async access<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>) {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('assets-control-offline-projects', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('projects');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<T>((resolve, reject) => {
        const transaction = database.transaction('projects', mode);
        const request = operation(transaction.objectStore('projects'));
        transaction.oncomplete = () => resolve(request.result);
        transaction.onabort = () => reject(transaction.error);
      });
    } finally {
      database.close();
    }
  }
}
