import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { ClientDocumentsStore } from '../../store/client-documents.store';
import { TagStore } from '../../store/tag.store';
import { DocumentDto } from '../../interfaces/document.dto';
import { BranchTableDto } from '../../interfaces/branch-table.dto';
import { AuthService } from '../../services/auth-service';
import { FileCategoryForm } from '../forms/file-category-form/file-category-form/file-category-form';
import { FileCategoryStore } from '../../store/file-category.store';

@Component({
  selector: 'app-client-documents',
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzModalModule,
    NzFormModule,
    NzFlexModule,
    FileCategoryForm,
  ],
  templateUrl: './client-documents.html',
  styleUrl: './client-documents.css',
  providers: [ClientDocumentsStore, TagStore],
})
export class ClientDocuments {
  clientId = input.required<number>();
  projects = input<BranchTableDto[]>([]);
  initialProjectId = input<number | null>(null);
  projectFilterChange = output<number | null>();
  selectedProject = computed(() =>
    this.projects().find((project) => project.id === this.store.projectFilter()),
  );
  protected store = inject(ClientDocumentsStore);
  protected tagStore = inject(TagStore);
  private modal = inject(NzModalService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private categoryStore = inject(FileCategoryStore);
  protected isAdmin = inject(AuthService).getUserRole() === 'ADMIN';
  @ViewChild('documentForm', { static: true }) documentForm!: TemplateRef<void>;
  @ViewChild('categoryForm', { static: true }) categoryForm!: TemplateRef<void>;
  private modalRef?: NzModalRef;
  private categoryModalRef?: NzModalRef;
  editingDocument = signal<DocumentDto | null>(null);
  selectedFile = signal<File | null>(null);
  filtersOpen = signal(false);
  activeFilters = computed(
    () =>
      [this.store.categoryFilter(), this.store.siteFilter(), this.store.projectFilter()].filter(
        (value) => value !== null,
      ).length,
  );

  clearFilters() {
    this.store.search.set('');
    this.store.categoryFilter.set(null);
    this.store.siteFilter.set(null);
    this.selectProject(null);
  }

  selectProject(projectId: number | null) {
    this.store.projectFilter.set(projectId);
    this.projectFilterChange.emit(projectId);
  }
  protected newSiteName = this.formBuilder.nonNullable.control('', [
    Validators.required,
    Validators.maxLength(255),
  ]);
  protected form = this.formBuilder.group(
    {
      categoryId: this.formBuilder.control<number | null>(null, Validators.required),
      projectId: this.formBuilder.control<number | null>(null),
      scope: this.formBuilder.control<'ALL_CLIENT' | 'SELECTED_SITES' | null>(
        null,
        Validators.required,
      ),
      tagIds: this.formBuilder.nonNullable.control<number[]>([]),
    },
    {
      validators: (control) =>
        control.get('scope')?.value === 'SELECTED_SITES' && !control.get('tagIds')?.value.length
          ? { sitesRequired: true }
          : null,
    },
  );

  constructor() {
    effect(() => this.store.projectFilter.set(this.initialProjectId()));
    effect((onCleanup) => {
      const id = this.clientId();
      const documents = this.store.loadDocuments(id).subscribe();
      const categories = this.store.loadCategories().subscribe();
      const tags = this.tagStore.loadTags(id).subscribe();
      onCleanup(() => {
        documents.unsubscribe();
        categories.unsubscribe();
        tags.unsubscribe();
      });
    });
    this.form.controls.scope.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((scope) => {
        if (scope !== 'SELECTED_SITES') this.form.controls.tagIds.setValue([]);
      });
    this.destroyRef.onDestroy(() => {
      this.modalRef?.destroy();
      this.categoryModalRef?.destroy();
    });
  }

  refresh() {
    this.store.loadDocuments(this.clientId()).subscribe();
    this.tagStore.loadTags(this.clientId()).subscribe();
  }

  openDocument(document: DocumentDto | null = null) {
    this.editingDocument.set(document);
    this.selectedFile.set(null);
    this.newSiteName.reset();
    this.form.reset({
      categoryId: document?.categoryId ?? null,
      projectId: document?.projectId ?? null,
      scope: document?.scope === 'UNASSIGNED' ? null : (document?.scope ?? null),
      tagIds: document?.tags.map((tag) => tag.id) ?? [],
    });
    this.modalRef = this.modal.create({
      nzTitle: document ? 'Organize document' : 'Upload document',
      nzContent: this.documentForm,
      nzFooter: null,
      nzMaskClosable: false,
      nzOnCancel: () => !this.store.saving(),
    });
  }

  selectFile(event: Event) {
    this.selectedFile.set((event.target as HTMLInputElement).files?.[0] ?? null);
  }

  saveDocument() {
    if (this.form.invalid || this.store.saving() || this.tagStore.creating()) return;
    const values = this.form.getRawValue();
    if (values.categoryId === null || values.scope === null) return;
    this.store
      .saveDocument(
        this.clientId(),
        { ...values, categoryId: values.categoryId, scope: values.scope },
        this.selectedFile(),
        this.editingDocument()?.id ?? null,
      )
      .subscribe(() => this.modalRef?.destroy());
  }

  cancel() {
    if (!this.store.saving()) this.modalRef?.destroy();
  }

  addSite() {
    const name = this.newSiteName.value.trim();
    if (!name || this.newSiteName.invalid || this.tagStore.creating()) return;
    this.tagStore.addTag(this.clientId(), name).subscribe((tag) => {
      this.form.controls.tagIds.setValue([...this.form.controls.tagIds.value, tag.id]);
      this.newSiteName.reset();
    });
  }

  openCategory() {
    this.categoryStore.formMode.set('add');
    this.categoryStore.selectedCategory.set(null);
    this.categoryModalRef = this.modal.create({ nzContent: this.categoryForm, nzFooter: null });
  }

  categoryClosed() {
    this.categoryModalRef?.destroy();
    this.store.loadCategories().subscribe();
  }
}
