import { inject, Injectable } from '@angular/core';
import { ApiUrlBaseService } from './api-url-base.service';

export type Cabling = 'PENDING' | 'CORRECT' | 'HAS_ISSUE';

export interface MaintenanceDetails {
  title: string;
  maintenanceDate: string;
}

export interface MaintenanceChecklist {
  cleaning: boolean;
  viewAdjustment: boolean | null;
  cabling: Cabling;
  comments: string;
}

export interface MaintenanceReview extends MaintenanceChecklist {
  id: number;
  hardwareId: number;
  hardwareName: string;
  site: string;
  camera: boolean;
  confirmed: boolean;
}

export interface MaintenanceDraft extends MaintenanceDetails {
  id: number;
  projectId: number;
  createdBy: string;
  reviews: MaintenanceReview[];
}

interface MaintenancePhoto {
  id: number;
  filename: string;
  contentType: string;
}

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly api = inject(ApiUrlBaseService);

  get(projectId: number) {
    return this.api.get<MaintenanceDraft | null>(this.path(projectId));
  }

  create(projectId: number) {
    return this.api.post<MaintenanceDraft>(this.path(projectId), null);
  }

  updateDetails(projectId: number, details: MaintenanceDetails) {
    return this.api.put<MaintenanceDraft>(this.path(projectId), details);
  }

  addEquipment(projectId: number, hardwareIds: number[], defaults: Pick<MaintenanceChecklist, 'cabling' | 'comments'>) {
    return this.api.post<MaintenanceDraft>(`${this.path(projectId)}/equipment`, { hardwareIds, ...defaults });
  }

  updateReview(projectId: number, reviewId: number, checklist: MaintenanceChecklist) {
    return this.api.put<MaintenanceReview>(this.reviewPath(projectId, reviewId), checklist);
  }

  confirmReview(projectId: number, reviewId: number) {
    return this.api.put<MaintenanceReview>(`${this.reviewPath(projectId, reviewId)}/confirmation`, null);
  }

  removeEquipment(projectId: number, reviewId: number) {
    return this.api.delete<void>(this.reviewPath(projectId, reviewId));
  }

  listPhotos(projectId: number, reviewId: number) {
    return this.api.get<MaintenancePhoto[]>(`${this.reviewPath(projectId, reviewId)}/photos`);
  }

  downloadPhoto(projectId: number, reviewId: number, photoId: number) {
    return this.api.getMultipart(`api/v1/${this.reviewPath(projectId, reviewId)}/photos/${photoId}`);
  }

  addPhoto(projectId: number, reviewId: number, file: File) {
    const body = new FormData();
    body.append('file', file);
    return this.api.post<MaintenancePhoto>(`${this.reviewPath(projectId, reviewId)}/photos`, body);
  }

  removePhoto(projectId: number, reviewId: number, photoId: number) {
    return this.api.delete<void>(`${this.reviewPath(projectId, reviewId)}/photos/${photoId}`);
  }

  private path(projectId: number) {
    return `projects/${projectId}/maintenance-report`;
  }

  private reviewPath(projectId: number, reviewId: number) {
    return `${this.path(projectId)}/equipment/${reviewId}`;
  }
}
