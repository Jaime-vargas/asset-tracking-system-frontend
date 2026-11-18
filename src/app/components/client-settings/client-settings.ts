import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { firstValueFrom } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TagDto } from '../../interfaces/tag.dto';
import { TagColor } from '../../interfaces/tag-color';
import { TagColorPicker } from '../tag-color-picker/tag-color-picker';
import { UiTag } from '../ui-tag/ui-tag';
import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { AuthService } from '../../services/auth-service';
import { BranchService } from '../../services/branch.service';
import { TagStore } from '../../store/tag.store';
import { FileCategoryStore } from '../../store/file-category.store';
import { FileCategoryDto } from '../../interfaces/file-category.dto';
import { FileCategoryForm } from '../forms/file-category-form/file-category-form/file-category-form';

@Component({
  selector: 'app-client-settings',
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
    FileCategoryForm,
    TagColorPicker,
    UiTag,
    NzFormModule,
    NzDividerComponent,
    NzIconDirective,
  ],
  providers: [TagStore],
  templateUrl: './client-settings.html',
  styleUrl: './client-settings.css',
})
export class ClientSettings {
  clientId = input.required<number>();
  detailsAvailable = input(false);
  editDetails = output<void>();
  changed = output<void>();
  protected tags = inject(TagStore);
  private categoriesApi = inject(BranchService);
  private categoryStore = inject(FileCategoryStore);

  private modal = inject(NzModalService);
  private notification = inject(NzNotificationService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  protected isAdmin = inject(AuthService).getUserRole() === 'ADMIN';
  categories = signal<FileCategoryDto[]>([]);
  categoriesLoading = signal(false);
  categoriesError = signal(false);
  siteName = this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(255)]);
  siteColor = this.fb.nonNullable.control<TagColor>('PURPLE');
  editingSite = signal<TagDto | null>(null);
  siteForm = this.fb.group({ name: this.siteName, color: this.siteColor });
  @ViewChild('siteEditor', { static: true }) siteEditor!: TemplateRef<void>;
  siteModal?: NzModalRef;
  @ViewChild('categoryForm', { static: true }) categoryForm!: TemplateRef<void>;
  categoryModal?: NzModalRef;

  constructor() {
    effect((onCleanup) => {
      const id = this.clientId();
      const sites = this.tags.loadTags(id).subscribe();
      const categories = this.loadCategories();
      onCleanup(() => {
        sites.unsubscribe();
        categories.unsubscribe();
      });
    });
    this.destroyRef.onDestroy(() => {
      this.categoryModal?.destroy();
      this.siteModal?.destroy();
    });
  }

  loadCategories() {
    this.categoriesLoading.set(true);
    this.categoriesError.set(false);
    return this.categoriesApi
      .getFileCategories(this.clientId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.categoriesLoading.set(false);
        },
        error: () => {
          this.categoriesLoading.set(false);
          this.categoriesError.set(true);
        },
      });
  }

  openSite() {
    this.cancelSiteEdit();
    this.showSiteEditor();
  }

  private showSiteEditor() {
    this.siteModal = this.modal.create({
      nzContent: this.siteEditor,
      nzFooter: null,
      nzWidth: 440,
      nzMaskClosable: false,
      nzOnCancel: () => !this.tags.creating(),
    });
  }

  closeSiteEditor() {
    if (this.tags.creating()) return;
    this.siteModal?.destroy();
    this.cancelSiteEdit();
  }

  editSite(site: TagDto) {
    if (!this.isAdmin) return;
    this.editingSite.set(site);
    this.siteForm.setValue({ name: site.name, color: site.color ?? 'PURPLE' });
    this.showSiteEditor();
  }

  cancelSiteEdit() {
    this.editingSite.set(null);
    this.siteForm.reset({ name: '', color: 'PURPLE' });
  }

  addSite() {
    const name = this.siteName.value.trim();
    if (!name || this.siteName.invalid || this.tags.creating() || this.tags.loading()) return;
    const site = this.editingSite();
    if (site && !this.isAdmin) return;
    const request = site
      ? this.tags.editTag(this.clientId(), site.id, name, this.siteColor.value)
      : this.tags.addTag(this.clientId(), name, this.siteColor.value);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.cancelSiteEdit();
      this.siteModal?.destroy();
      this.changed.emit();
    });
  }
  openCategory(category: FileCategoryDto | null = null) {
    if (category && !this.isAdmin) return;
    this.categoryStore.formMode.set(category ? 'edit' : 'add');
    this.categoryStore.selectedCategory.set(category);
    this.categoryModal = this.modal.create({
      nzContent: this.categoryForm,
      nzFooter: null,
      nzWidth: 440,
      nzMaskClosable: false,
    });
  }

  confirmDeleteSite(site: TagDto) {
    if (this.tags.creating()) return;
    this.modal.confirm({
      nzTitle: 'Delete site?',
      nzContent: `Delete "${site.name}"? Sites in use cannot be deleted.`,
      nzOkText: 'Delete',
      nzCancelText: 'Cancel',
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          await firstValueFrom(this.tags.deleteTag(this.clientId(), site.id));
          if (this.editingSite()?.id === site.id) this.cancelSiteEdit();
          this.changed.emit();
        } catch (error: any) {
          this.notification.error(
            'Site could not be deleted',
            error.error?.message ?? 'Please try again.',
          );
          throw error;
        }
      },
    });
  }

  confirmDeleteCategory(category: FileCategoryDto) {
    if (!this.isAdmin) return;
    this.modal.confirm({
      nzTitle: 'Delete category?',
      nzContent: `Delete "${category.name}"? Categories used by files cannot be deleted.`,
      nzOkText: 'Delete',
      nzCancelText: 'Cancel',
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          await firstValueFrom(this.categoriesApi.deleteFileCategory(this.clientId(), category.id));
          this.categories.update((categories) =>
            categories.filter((item) => item.id !== category.id),
          );
          this.changed.emit();
        } catch (error: any) {
          this.notification.error(
            'Category could not be deleted',
            error.error?.message ?? 'Please try again.',
          );
          throw error;
        }
      },
    });
  }

  categoriesChanged() {
    this.loadCategories();
    this.changed.emit();
  }
}
