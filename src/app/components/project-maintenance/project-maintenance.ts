import { formatDate } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { HardwareTableDto } from '../../interfaces/hardware/hardware-table.dto';
import { RelatedEquipmentPicker } from '../related-equipment-picker/related-equipment-picker';
import { UploadComponent } from '../upload-drag-and-drop-component/upload-component';
import { AuthService } from '../../services/auth-service';

const equipment = [
  { id: 1, name: 'Camera 001', site: 'Colima', type: 'Camera' },
  { id: 2, name: 'Camera 002', site: 'Tecomán', type: 'Camera' },
  { id: 3, name: 'Server 01', site: 'Colima', type: 'Server' },
];

interface EvidencePhoto {
  name: string;
  url: string;
}

interface EquipmentReview {
  equipmentId: number;
  cleaning: boolean;
  viewAdjustment: boolean;
  cabling: 'Pending' | 'Correct' | 'Has an issue';
  comments: string;
  photos: EvidencePhoto[];
  confirmed: boolean;
}

interface MaintenanceDraft {
  title: string;
  date: string;
  reviews: EquipmentReview[];
}

@Component({
  selector: 'app-project-maintenance',
  imports: [FormsModule, NzButtonModule, NzIconDirective, NzInputModule, NzModalModule, NzSelectModule, RelatedEquipmentPicker, UploadComponent],
  templateUrl: './project-maintenance.html',
  styleUrl: './project-maintenance.css',
})
export class ProjectMaintenance {
  readonly projectId = input.required<number>();
  readonly clientId = input.required<number>();

  private readonly user = inject(AuthService).getAllUserDataOnToken(localStorage.getItem('token'));
  protected readonly author = this.user?.fullName;
  private readonly storageKey = computed(() =>
    `maintenance-preview:${this.user?.username ?? this.author}:${this.clientId()}:${this.projectId()}`,
  );

  protected readonly draft = linkedSignal(() => this.loadDraft(this.storageKey()));
  readonly editing = linkedSignal({ source: this.storageKey, computation: () => false });
  protected readonly openEquipment = signal<number | null>(null);
  protected readonly notice = signal('');
  protected readonly pickerOpen = signal(false);
  protected readonly selectedIds = signal<number[]>([]);
  protected readonly photoError = signal('');
  private readonly pendingPhotos = signal(0);
  protected readonly savingPhotos = computed(() => this.pendingPhotos() > 0);
  protected readonly activeReview = computed(() =>
    this.draft().reviews.find(review => review.equipmentId === this.openEquipment()),
  );
  protected readonly candidates = computed<HardwareTableDto[]>(() => this.availableEquipment().map(device => ({
    id: device.id,
    type: device.type,
    name: device.name,
    model: '',
    serialNumber: '',
    location: '',
    lastMaintenanceDate: '',
    reportsActive: [],
    clientId: this.clientId(),
    clientName: '',
    branchId: null,
    branchName: null,
    tagId: device.site === 'Colima' ? 1 : 2,
    tagName: device.site,
  })));
  protected readonly confirmedCount = computed(() => this.draft().reviews.filter(review => review.confirmed).length);
  protected readonly availableEquipment = computed(() =>
    equipment.filter(device => !this.draft().reviews.some(review => review.equipmentId === device.id)),
  );

  protected deviceFor(id: number) {
    return equipment.find(device => device.id === id);
  }

  protected removePhoto(review: EquipmentReview, index: number) {
    this.updateReview(review.equipmentId, { photos: review.photos.filter((_, position) => position !== index) });
  }

  protected updateDetails(details: Partial<Pick<MaintenanceDraft, 'title' | 'date'>>) {
    this.draft.update(draft => ({ ...draft, ...details }));
    this.notice.set('');
  }

  protected openDraft() {
    const { title, date } = this.draft();
    this.updateDetails({
      title: title.trim() ? title : 'Maintenance report',
      date: date || formatDate(new Date(), 'yyyy-MM-dd', 'en-US'),
    });
    this.editing.set(true);
  }

  protected openPicker() {
    this.selectedIds.set([]);
    this.pickerOpen.set(true);
  }

  protected addSelectedEquipment() {
    for (const id of this.selectedIds()) this.addEquipment(id);
    this.pickerOpen.set(false);
  }

  protected openReview(id: number) {
    this.photoError.set('');
    this.openEquipment.set(id);
  }

  protected confirmReview() {
    const review = this.activeReview();
    if (!review || this.savingPhotos()) return;
    this.updateReview(review.equipmentId, { confirmed: true });
    this.openEquipment.set(null);
  }

  private addEquipment(id: number) {
    if (!this.availableEquipment().some(device => device.id === id)) return;
    this.draft.update(draft => ({
      ...draft,
      reviews: [...draft.reviews, {
        equipmentId: id,
        cleaning: true,
        viewAdjustment: false,
        cabling: 'Pending',
        comments: 'Funcionando correctamente',
        photos: [],
        confirmed: false,
      }],
    }));
    this.notice.set('');
  }

  protected removeEquipment(id: number) {
    this.draft.update(draft => ({
      ...draft,
      reviews: draft.reviews.filter(review => review.equipmentId !== id),
    }));
    if (this.openEquipment() === id) this.openEquipment.set(null);
    this.notice.set('');
  }

  protected updateReview(id: number, changes: Partial<EquipmentReview>) {
    this.draft.update(draft => ({
      ...draft,
      reviews: draft.reviews.map(review =>
        review.equipmentId === id ? { ...review, confirmed: false, ...changes } : review,
      ),
    }));
    this.notice.set('');
  }

  protected readonly selectPhoto = (file: NzUploadFile): false => {
    const review = this.activeReview();
    const image = file.originFileObj ?? file;
    if (review && image instanceof File) void this.addPhoto(review.equipmentId, image);
    return false;
  };

  protected capturePhoto(id: number, picker: HTMLInputElement) {
    const file = picker.files?.[0];
    picker.value = '';
    if (file) void this.addPhoto(id, file);
  }

  private async addPhoto(id: number, file: File) {
    if (!file.type.startsWith('image/')) {
      this.photoError.set('Choose an image file.');
      return;
    }
    const key = this.storageKey();
    this.photoError.set('');
    this.pendingPhotos.update(count => count + 1);
    try {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const review = this.activeReview();
      if (this.storageKey() === key && review?.equipmentId === id) {
        this.updateReview(id, { photos: [...review.photos, { name: file.name, url }] });
      }
    } catch {
      this.photoError.set('The selected photo could not be read.');
    } finally {
      this.pendingPhotos.update(count => count - 1);
    }
  }

  protected saveDraft() {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(this.draft()));
      this.notice.set('Draft saved in this browser.');
    } catch {
      this.notice.set('The browser could not save this draft. Remove large photos and try again.');
    }
  }

  private loadDraft(key: string): MaintenanceDraft {
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored) as MaintenanceDraft;
    } catch {
      return { title: '', date: '', reviews: [] };
    }
    return { title: '', date: '', reviews: [] };
  }
}
