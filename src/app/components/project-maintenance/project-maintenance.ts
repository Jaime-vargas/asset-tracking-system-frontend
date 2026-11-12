import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [FormsModule],
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
  protected readonly editing = signal(false);
  protected readonly openEquipment = signal<number | null>(null);
  protected readonly notice = signal('');
  protected readonly savingPhotos = signal(false);
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

  protected addEquipment(id: number, picker: HTMLSelectElement) {
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
    picker.value = '';
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

  protected async addPhotos(review: EquipmentReview, picker: HTMLInputElement) {
    const files = Array.from(picker.files ?? []).filter(file => file.type.startsWith('image/'));
    picker.value = '';
    if (!files.length) return;
    this.savingPhotos.set(true);
    try {
      const photos = await Promise.all(files.map(file => new Promise<EvidencePhoto>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, url: String(reader.result) });
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      })));
      this.updateReview(review.equipmentId, { photos: [...review.photos, ...photos] });
    } catch {
      this.notice.set('The selected photos could not be read.');
    } finally {
      this.savingPhotos.set(false);
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
