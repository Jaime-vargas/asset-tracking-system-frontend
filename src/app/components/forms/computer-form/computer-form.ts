import { Component, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize, forkJoin, of } from 'rxjs';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ComputerRequestDto, ComputerStorageDto } from '../../../interfaces/hardware/computer.dto';
import { TagDto } from '../../../interfaces/tag.dto';
import { HardwareService } from '../../../services/hardware.service';
import { TagService } from '../../../services/tag.service';

@Component({
  selector: 'app-computer-form',
  imports: [FormsModule, NzModalModule, NzButtonModule],
  templateUrl: './computer-form.html',
  styleUrl: './computer-form.css',
})
export class ComputerForm implements OnInit {
  clientId = input.required<number>();
  computerId = input<number | null>(null);
  saved = output<void>();
  closed = output<void>();

  private api = inject(HardwareService);
  private tags = inject(TagService);
  private destroyRef = inject(DestroyRef);

  protected sites = signal<TagDto[]>([]);
  protected loading = signal(false);
  protected loadError = signal(false);
  protected saving = signal(false);
  protected saveError = signal('');
  protected model: ComputerRequestDto = {
    name: '', brand: '', model: '', serialNumber: '', location: null, tagId: null,
    computerType: 'DESKTOP', hostname: null, operatingSystem: null, processor: null,
    ramGb: null, ntpServer: null, storage: [], networkInterfaces: [], credentials: [],
  };
  protected raidOptions: { value: NonNullable<ComputerStorageDto['raidLevel']>; minimum: number }[] = [
    { value: 'RAID_0', minimum: 2 }, { value: 'RAID_1', minimum: 2 },
    { value: 'RAID_5', minimum: 3 }, { value: 'RAID_6', minimum: 4 },
    { value: 'RAID_10', minimum: 4 },
  ];

  ngOnInit() {
    this.load();
  }

  protected load() {
    const id = this.computerId();
    this.loading.set(true);
    this.loadError.set(false);
    forkJoin({
      sites: this.tags.getClientTags(this.clientId()),
      computer: id === null ? of(null) : this.api.getComputer(id),
    }).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false))).subscribe({
      next: ({ sites, computer }) => {
        this.sites.set(sites);
        if (computer) {
          const { name, brand, model, serialNumber, location, tagId, computerType, hostname,
            operatingSystem, processor, ramGb, ntpServer, storage, networkInterfaces, credentials } = computer;
          this.model = { name, brand, model, serialNumber, location, tagId, computerType, hostname,
            operatingSystem, processor, ramGb, ntpServer, storage, networkInterfaces, credentials };
        }
      },
      error: () => this.loadError.set(true),
    });
  }

  protected addStorage() {
    this.model.storage.push({ storageType: 'SSD', diskCount: 1, diskCapacityGb: null, raidLevel: null });
  }

  protected setRaid(storage: ComputerStorageDto, level: ComputerStorageDto['raidLevel']) {
    storage.raidLevel = level;
    storage.diskCount = this.raidOptions.find(option => option.value === level)?.minimum ?? 1;
  }

  protected addInterface() {
    this.model.networkInterfaces.push({ name: null, macAddress: '', ipAddress: null, subnetPrefix: null, gateway: null });
  }

  protected addCredential() {
    this.model.credentials.push({ label: '', username: null, password: null });
  }

  protected save(form: NgForm) {
    if (this.saving() || form.invalid || this.model.tagId === null) return;
    const id = this.computerId();
    this.saving.set(true);
    this.saveError.set('');
    const request = id === null ? this.api.createComputer(this.clientId(), this.model)
      : this.api.updateComputer(id, this.model);
    request.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.saving.set(false))).subscribe({
      next: () => this.saved.emit(),
      error: error => this.saveError.set(error.error?.message ?? 'Computer could not be saved. Please try again.'),
    });
  }
}
