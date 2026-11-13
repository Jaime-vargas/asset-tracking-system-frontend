import { Component, computed, DestroyRef, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { HttpErrorResponse } from '@angular/common/http';
import { MaintenancePhotoQueue } from '../../services/maintenance-photo-queue.service';
import { firstValueFrom } from 'rxjs';
import { HardwareTableDto } from '../../interfaces/hardware/hardware-table.dto';
import { HardwareService } from '../../services/hardware.service';
import { MaintenanceChecklist, MaintenanceDetails, MaintenanceDraft, MaintenanceReview, MaintenanceService } from '../../services/maintenance.service';
import { CarouselComponent } from '../carousel-component/carousel-component';
import { RelatedEquipmentPicker } from '../related-equipment-picker/related-equipment-picker';
import { UploadButtonComponent } from '../upload-button-component/upload-button-component';

const initialChecklist = {
  cabling: 'PENDING',
  comments: 'Funcionando correctamente',
} satisfies Pick<MaintenanceChecklist, 'cabling' | 'comments'>;

interface GalleryPhoto {
  id: number;
  filename: string;
  filePath: string;
}

@Component({
  selector: 'app-project-maintenance',
  imports: [FormsModule, NzButtonModule, NzIconDirective, NzInputModule, NzModalModule, NzSelectModule, RelatedEquipmentPicker, UploadButtonComponent, CarouselComponent],
  templateUrl: './project-maintenance.html',
  styleUrl: './project-maintenance.css',
})
export class ProjectMaintenance {
  readonly projectId = input.required<number>();
  readonly clientId = input.required<number>();
  readonly equipmentLinked = output<void>();

  private readonly queue = inject(MaintenancePhotoQueue);
  private readonly api = inject(MaintenanceService);
  private readonly hardware = inject(HardwareService);
  private readonly modal = inject(NzModalService);
  private destroyed = false;

  protected readonly draft = signal<MaintenanceDraft | null>(null);
  readonly hasDraft = computed(() => this.draft() !== null);
  readonly canCreate = computed(() => !this.loading() && !this.busy() && !this.loadFailed() && !this.hasDraft());
  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  protected readonly busy = signal(false);
  protected readonly notice = signal('');
  protected readonly details = signal<MaintenanceDetails>({ title: '', maintenanceDate: '' });
  protected readonly pickerOpen = signal(false);
  protected readonly candidates = signal<HardwareTableDto[]>([]);
  protected readonly selectedIds = signal<number[]>([]);
  protected readonly pickerError = signal('');

  protected readonly openEquipment = signal<number | null>(null);
  protected readonly activeReview = computed(() => this.draft()?.reviews.find(review => review.id === this.openEquipment()));
  protected readonly checklist = signal<MaintenanceChecklist | null>(null);
  protected readonly reviewError = signal('');
  protected readonly photoError = signal('');
  protected readonly reviewPhotos = signal<GalleryPhoto[]>([]);
  private readonly pendingPhotos = signal(0);
  protected readonly savingPhotos = computed(() => this.pendingPhotos() > 0);
  protected readonly queuedCount = computed(() => {
    const owner = this.queue.owner();
    const projectId = this.projectId();
    return this.queue.pending().filter(photo => 'projectId' in photo && photo.owner === owner && photo.projectId === projectId).length;
  });

  protected retryPhotos() {
    void this.queue.sync();
  }

  protected readonly confirmedCount = computed(() => this.draft()?.reviews.filter(review => review.confirmed).length ?? 0);

  constructor() {
    effect(() => {
      const projectId = this.projectId();
      this.draft.set(null);
      this.pickerOpen.set(false);
      untracked(() => this.closeReview());
      void this.loadDraft(projectId);
    });
    effect(() => {
      const sent = this.queue.lastUploaded();
      if (!sent) return;
      untracked(() => {
        if (sent.projectId !== this.projectId()) return;
        this.draft.update(draft => draft && {
          ...draft,
          reviews: draft.reviews.map(review => review.id === sent.reviewId ? { ...review, confirmed: false } : review),
        });
        this.cacheDraft(this.projectId(), this.draft());
        if (this.openEquipment() === sent.reviewId) void this.loadPhotos(sent.projectId, sent.reviewId);
      });
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.clearPhotos();
    });
  }

  protected async loadDraft(projectId = this.projectId()) {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.notice.set('');
    try {
      const draft = await firstValueFrom(this.api.get(projectId));
      if (!this.isCurrent(projectId)) return;
      this.draft.set(draft);
      this.cacheDraft(projectId, draft);
      if (draft) this.details.set({ title: draft.title, maintenanceDate: draft.maintenanceDate });
    } catch (error) {
      if (this.isCurrent(projectId)) {
        const saved = this.canUseOffline(error) ? this.cachedDraft(projectId) : null;
        if (saved) {
          this.draft.set(saved);
          this.details.set({ title: saved.title, maintenanceDate: saved.maintenanceDate });
          this.notice.set('Offline copy. Photos will be sent when the connection returns.');
          return;
        }
        this.loadFailed.set(true);
        this.notice.set('Maintenance report could not be loaded.');
      }
    } finally {
      if (this.isCurrent(projectId)) this.loading.set(false);
    }
  }

  async openDraft() {
    if (!this.canCreate()) return;
    await this.run(async projectId => {
      const draft = await firstValueFrom(this.api.create(projectId));
      if (!this.isCurrent(projectId)) return;
      this.draft.set(draft);
      this.cacheDraft(projectId, draft);
      this.details.set({ title: draft.title, maintenanceDate: draft.maintenanceDate });
    }, this.notice, 'Maintenance report could not be created.');
  }

  protected updateDetails(changes: Partial<MaintenanceDetails>) {
    this.details.update(details => ({ ...details, ...changes }));
  }

  protected async saveDetails() {
    const draft = this.draft();
    const details = this.details();
    if (!draft || this.busy()) return;
    if (!details.title.trim() || !details.maintenanceDate) {
      this.notice.set('Enter a title and maintenance date.');
      return;
    }
    if (draft.title === details.title && draft.maintenanceDate === details.maintenanceDate) return;
    await this.run(async projectId => {
      const saved = await firstValueFrom(this.api.updateDetails(projectId, details));
      if (!this.isCurrent(projectId)) return;
      this.draft.set(saved);
      this.details.set({ title: saved.title, maintenanceDate: saved.maintenanceDate });
    }, this.notice, 'Report details could not be saved.');
  }

  protected async openPicker() {
    this.selectedIds.set([]);
    this.candidates.set([]);
    this.pickerOpen.set(true);
    await this.run(async projectId => {
      const devices = await firstValueFrom(this.hardware.getClientHardware(this.clientId()));
      if (!this.isCurrent(projectId)) return;
      const linked = new Set(this.draft()?.reviews.map(review => review.hardwareId));
      this.candidates.set(devices.filter(device => !linked.has(device.id)));
    }, this.pickerError, 'Client equipment could not be loaded.');
  }

  protected async addSelectedEquipment() {
    if (!this.selectedIds().length) return;
    await this.run(async projectId => {
      const draft = await firstValueFrom(this.api.addEquipment(projectId, this.selectedIds(), initialChecklist));
      if (!this.isCurrent(projectId)) return;
      this.draft.set(draft);
      this.cacheDraft(projectId, draft);
      this.pickerOpen.set(false);
      this.equipmentLinked.emit();
    }, this.pickerError, 'Equipment could not be added.');
  }

  protected openReview(review: MaintenanceReview) {
    this.clearPhotos();
    this.photoError.set('');
    this.reviewError.set('');
    this.openEquipment.set(review.id);
    const { cleaning, viewAdjustment, cabling, comments } = review;
    this.checklist.set({ cleaning, viewAdjustment, cabling, comments });
    void this.loadPhotos(this.projectId(), review.id);
  }

  protected editChecklist(changes: Partial<MaintenanceChecklist>) {
    this.checklist.update(checklist => checklist && { ...checklist, ...changes });
  }

  protected async finishReview(confirm: boolean) {
    const review = this.activeReview();
    const checklist = this.checklist();
    if (!review || !checklist || this.savingPhotos()) return;
    if (!confirm && !navigator.onLine) {
      this.closeReview();
      return;
    }
    await this.run(async projectId => {
      const { cleaning, viewAdjustment, cabling, comments } = review;
      if (cleaning !== checklist.cleaning || viewAdjustment !== checklist.viewAdjustment ||
          cabling !== checklist.cabling || comments !== checklist.comments) {
        const updated = await firstValueFrom(this.api.updateReview(projectId, review.id, checklist));
        if (!this.isCurrent(projectId)) return;
        this.replaceReview(updated);
      }
      if (confirm) {
        const updated = await firstValueFrom(this.api.confirmReview(projectId, review.id));
        if (!this.isCurrent(projectId)) return;
        this.replaceReview(updated);
      }
      this.closeReview();
    }, this.reviewError, 'The checklist could not be saved.');
  }

  protected confirmRemoveEquipment(review: MaintenanceReview) {
    this.modal.confirm({
      nzTitle: 'Remove equipment?',
      nzContent: `Remove ${review.hardwareName} and its checklist and photos from this draft?`,
      nzOkText: 'Remove equipment',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzOnOk: () => this.run(async projectId => {
        await firstValueFrom(this.api.removeEquipment(projectId, review.id));
        if (!this.isCurrent(projectId)) return;
        this.draft.update(draft => draft && { ...draft, reviews: draft.reviews.filter(item => item.id !== review.id) });
      }, this.notice, 'Equipment could not be removed.'),
    });
  }

  protected readonly selectPhoto = (file: NzUploadFile): false => {
    const review = this.activeReview();
    const image = file.originFileObj ?? file;
    if (review && image instanceof File) void this.addPhoto(review, image);
    return false;
  };

  protected capturePhoto(review: MaintenanceReview, picker: HTMLInputElement) {
    const file = picker.files?.[0];
    picker.value = '';
    if (file) void this.addPhoto(review, file);
  }

  protected async removePhoto(photoId: number) {
    const review = this.activeReview();
    if (!review || this.savingPhotos()) return;
    await this.run(async projectId => {
      await firstValueFrom(this.api.removePhoto(projectId, review.id, photoId));
      if (!this.isReviewCurrent(projectId, review.id)) return;
      this.markPending(review.id);
      this.reviewPhotos.update(photos => photos.filter(photo => {
        if (photo.id !== photoId) return true;
        URL.revokeObjectURL(photo.filePath);
        return false;
      }));
    }, this.photoError, 'Photo could not be deleted.');
  }

  private async addPhoto(review: MaintenanceReview, file: File) {
    const projectId = this.projectId();
    this.photoError.set('');
    this.pendingPhotos.update(count => count + 1);
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024) {
        this.photoError.set('Choose a JPEG, PNG or WebP photo up to 20 MB.');
        return;
      }
      await this.queue.enqueue(projectId, review.id, file);
    } catch {
      if (this.isReviewCurrent(projectId, review.id)) {
        this.photoError.set('The photo could not be saved on this device.');
      }
    } finally {
      this.pendingPhotos.update(count => count - 1);
    }
  }

  private async loadPhotos(projectId: number, reviewId: number) {
    this.pendingPhotos.update(count => count + 1);
    try {
      const photos = await firstValueFrom(this.api.listPhotos(projectId, reviewId));
      const results = await Promise.allSettled(photos.map(photo =>
        this.appendPhoto(projectId, reviewId, photo.id, photo.filename),
      ));
      if (results.some(result => result.status === 'rejected')) throw new Error('Photo download failed');
    } catch (error) {
      if (!this.canUseOffline(error) && this.isReviewCurrent(projectId, reviewId)) this.photoError.set('Some photos could not be loaded.');
    } finally {
      this.pendingPhotos.update(count => count - 1);
    }
  }

  private async appendPhoto(projectId: number, reviewId: number, id: number, filename: string) {
    const blob = await firstValueFrom(this.api.downloadPhoto(projectId, reviewId, id));
    if (!this.isReviewCurrent(projectId, reviewId)) return;
    const filePath = URL.createObjectURL(blob);
    this.reviewPhotos.update(photos => {
      if (photos.some(photo => photo.id === id)) {
        URL.revokeObjectURL(filePath);
        return photos;
      }
      return [...photos, { id, filename, filePath }].sort((a, b) => a.id - b.id);
    });
  }

  private closeReview() {
    this.openEquipment.set(null);
    this.checklist.set(null);
    this.clearPhotos();
  }

  private clearPhotos() {
    this.reviewPhotos().forEach(photo => URL.revokeObjectURL(photo.filePath));
    this.reviewPhotos.set([]);
  }

  private replaceReview(review: MaintenanceReview) {
    this.draft.update(draft => draft && { ...draft, reviews: draft.reviews.map(item => item.id === review.id ? review : item) });
    this.cacheDraft(this.projectId(), this.draft());
  }

  private markPending(reviewId: number) {
    const review = this.activeReview();
    if (review?.id === reviewId) this.replaceReview({ ...review, confirmed: false });
  }

  private canUseOffline(error: unknown) {
    return error instanceof HttpErrorResponse && error.status === 0;
  }

  private cacheDraft(projectId: number, draft: MaintenanceDraft | null) {
    const owner = this.queue.owner();
    if (!owner) return;
    try {
      const key = 'maintenance-offline:' + owner + ':' + projectId;
      if (draft) localStorage.setItem(key, JSON.stringify(draft));
      else localStorage.removeItem(key);
    } catch {
      // Online edits remain stored on the server.
    }
  }

  private cachedDraft(projectId: number): MaintenanceDraft | null {
    const owner = this.queue.owner();
    if (!owner) return null;
    try {
      return JSON.parse(localStorage.getItem('maintenance-offline:' + owner + ':' + projectId) ?? 'null');
    } catch {
      return null;
    }
  }

  private isCurrent(projectId: number) {
    return !this.destroyed && this.projectId() === projectId;
  }

  private isReviewCurrent(projectId: number, reviewId: number) {
    return this.isCurrent(projectId) && this.openEquipment() === reviewId;
  }

  private async run(action: (projectId: number) => Promise<void>, error: typeof this.notice, message: string) {
    if (this.busy()) return;
    const projectId = this.projectId();
    this.busy.set(true);
    error.set('');
    try {
      await action(projectId);
    } catch {
      if (this.isCurrent(projectId)) error.set(message);
    } finally {
      if (!this.destroyed) this.busy.set(false);
    }
  }
}
