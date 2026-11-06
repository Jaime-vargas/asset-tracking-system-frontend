import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { DocumentFilePicker } from '../document-file-picker/document-file-picker';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { UtilityService } from '../../services/utility.service';
import { TagColorDirective } from '../tag-color.directive';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { UiTag } from '../ui-tag/ui-tag';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { ClientDocumentsStore } from '../../store/client-documents.store';
import { TagStore } from '../../store/tag.store';
import { DocumentDto } from '../../interfaces/document.dto';
import { AuthService } from '../../services/auth-service';
import { FileCategoryForm } from '../forms/file-category-form/file-category-form/file-category-form';
import { FileCategoryStore } from '../../store/file-category.store';

@Component({
  selector: 'app-client-documents',
  imports: [
    DatePipe,
    NzIconModule,
    NzDropdownModule,
    NzMenuModule,
    NzRadioModule,
    DocumentFilePicker,
    TagColorDirective,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    UiTag,
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
  revision = input(0);
  projectId = input<number | null>(null);
  protected store = inject(ClientDocumentsStore);
  protected utility = inject(UtilityService);
  protected tagStore = inject(TagStore);
  private modal = inject(NzModalService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private categoryStore = inject(FileCategoryStore);
  protected isAdmin = inject(AuthService).getUserRole() === 'ADMIN';
  @ViewChild('documentForm', { static: true }) documentForm!: TemplateRef<void>;
  @ViewChild('categoryForm', { static: true }) categoryForm!: TemplateRef<void>;
  @ViewChild('versionHistory', { static: true }) versionHistory!: TemplateRef<void>;
  @ViewChild('deleteConfirmation', { static: true }) deleteConfirmation!: TemplateRef<void>;
  deletingDocument = signal<DocumentDto | null>(null);
  deleteMode = signal<'current' | 'all' | null>(null);
  private deleteModal?: NzModalRef;
  private historyModal?: NzModalRef;
  private historyRequest?: Subscription;
  historyDocument = signal<DocumentDto | null>(null);
  editorMode = signal<'create' | 'organize' | 'version'>('create');
  private modalRef?: NzModalRef;
  private categoryModalRef?: NzModalRef;
  editingDocument = signal<DocumentDto | null>(null);
  selectedFile = signal<File | null>(null);
  activeFilters = computed(() => [this.store.categoryFilter(), this.store.siteFilter()]
    .filter(value => value !== null).length);
  libraryDocuments = computed(() => this.store.documents().filter(document => document.projectId === this.projectId()));
  categorySections = computed(() => this.store.categories().map(category => ({...category,
    count: this.libraryDocuments().filter(document => document.categoryId === category.id).length,
  }))
    .filter(category => category.count > 0)
    .sort((first, second) => first.name.localeCompare(second.name)));
  selectedSection = computed(() => this.store.categories().find(category => category.id === this.store.categoryFilter())?.name ?? 'All files');

  selectCategory(categoryId: number | null) { this.store.categoryFilter.set(categoryId); }

  categoryColor(categoryId: number | null) {
    return this.store.categories().find((category) => category.id === categoryId)?.color;
  }

  clearFilters() {
    this.store.search.set('');
    this.store.categoryFilter.set(null);
    this.store.siteFilter.set(null);
  }

  protected sitesOpen = signal(false);
  protected siteEditorOpen = signal(false);

  protected closeSiteEditor() {
    this.siteEditorOpen.set(false);
    this.newSiteName.reset();
  }

  protected newSiteName = this.formBuilder.nonNullable.control('', [
    Validators.required,
    Validators.maxLength(255),
  ]);
  protected form = this.formBuilder.group(
    {
      name: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(255), (control) => {
        const value: string = control.value ?? '';
        return !value.trim() || ['.', '..'].includes(value.trim()) || [...value].some((character) =>
          '<>:"/\\|?*'.includes(character) || character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
        ) ? { filename: true } : null;
      }]),
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

  private selectedCategoryId = toSignal(this.form.controls.categoryId.valueChanges, {initialValue: null});
  private enteredName = toSignal(this.form.controls.name.valueChanges, {initialValue: ''});
  categoryPrefix = computed(() => {
    const name = this.store.categories().find((category) => category.id === this.selectedCategoryId())?.name
      ?? this.editingDocument()?.category ?? '';
    return [...name.trim()].map((character) => '<>:"/\\|?*'.includes(character)
      || character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127 ? '-' : character).join('')
      || (this.editorMode() === 'version' ? 'Document' : '');
  });
  nextVersion = computed(() => this.editorMode() === 'version'
    ? (this.editingDocument()?.nextVersion ?? (this.editingDocument()?.currentVersion ?? 1) + 1)
    : (this.editingDocument()?.currentVersion ?? 1));
  fileExtension = computed(() => this.extension(this.selectedFile()?.name ?? this.editingDocument()?.filename ?? ''));
  filenamePreview = computed(() => this.categoryPrefix() && this.enteredName().trim()
    ? `${this.categoryPrefix()}_${this.enteredName().trim()}_v${this.nextVersion()}${this.fileExtension()}` : '');
  private extension(name: string) {
    const dot = name.lastIndexOf('.');
    return dot > 0 && dot < name.length - 1 ? name.slice(dot) : '';
  }
  private stem(name: string) { return name.slice(0, name.length - this.extension(name).length); }

  constructor() {
    effect((onCleanup) => {
      this.revision();
      const id = this.clientId();
      this.store.projectId.set(this.projectId());
      const documents = this.store.loadDocuments(id, this.projectId()).subscribe();
      const categories = this.store.loadCategories(this.clientId()).subscribe();
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
      this.historyRequest?.unsubscribe();
      this.historyModal?.destroy();
      this.deleteModal?.destroy();
    });
  }

  refresh() {
    this.store.loadDocuments(this.clientId(), this.projectId()).subscribe();
    this.tagStore.loadTags(this.clientId()).subscribe();
  }

  openDocument(document: DocumentDto | null = null) {
    this.openEditor(document, document ? 'organize' : 'create');
  }
  openNewVersion(document: DocumentDto) { this.openEditor(document, 'version'); }
  private openEditor(document: DocumentDto | null, mode: 'create' | 'organize' | 'version') {
    this.editorMode.set(mode);
    this.editingDocument.set(document);
    this.selectedFile.set(null);
    this.sitesOpen.set(false);
    this.closeSiteEditor();
    this.form.reset({
      name: document?.name ?? (document ? this.stem(document.filename) : ''),
      categoryId: document ? document.categoryId : this.store.categoryFilter(),
      projectId: this.projectId(),
      scope: document?.scope === 'UNASSIGNED' ? null : (document?.scope ?? null),
      tagIds: document?.tags.map((tag) => tag.id) ?? [],
    });
    this.modalRef = this.modal.create({
      nzTitle: mode === 'version' ? 'Update file' : document ? 'Organize document' : 'Upload document',
      nzContent: this.documentForm,
      nzFooter: null,
      nzMaskClosable: false,
      nzOnCancel: () => !this.store.saving(),
    });
  }

  selectFile(event: Event) {
    this.onFileSelected((event.target as HTMLInputElement).files?.[0] ?? null);
  }
  onFileSelected(file: File | null) {
    this.selectedFile.set(file);
    if (file && this.editorMode() === 'create') this.form.controls.name.setValue(this.stem(file.name));
  }

  saveDocument() {
    if (this.store.saving() || this.tagStore.creating() || this.form.controls.name.invalid
        || !this.filenamePreview() || this.filenamePreview().length > 255) return;
    const document = this.editingDocument();
    const file = this.selectedFile();
    const name = this.form.controls.name.value.trim();
    if (this.editorMode() === 'version') {
      if (!document || !file) return;
      this.store.saveVersion(this.clientId(), document.id, file, {expectedVersion: document.currentVersion ?? 1, name})
        .subscribe(() => this.modalRef?.destroy());
      return;
    }
    if (this.form.invalid || (!document && !file)) return;
    const values = this.form.getRawValue();
    if (values.categoryId === null || values.scope === null) return;
    this.store.saveDocument(this.clientId(),
      {...values, name, categoryId: values.categoryId, scope: values.scope}, file, document?.id ?? null,
    ).subscribe(() => this.modalRef?.destroy());
  }

  openHistory(document: DocumentDto) {
    this.historyDocument.set(document);
    this.loadHistory();
    this.historyModal = this.modal.create({
      nzTitle: 'Version history', nzContent: this.versionHistory, nzFooter: null, nzWidth: 720,
      nzOnCancel: () => { this.historyRequest?.unsubscribe(); },
    });
  }
  loadHistory() {
    const document = this.historyDocument();
    if (!document) return;
    this.historyRequest?.unsubscribe();
    this.historyRequest = this.store.loadVersions(this.clientId(), document.id).subscribe();
  }
  closeHistory() { this.historyRequest?.unsubscribe(); this.historyModal?.destroy(); }

  openDelete(document: DocumentDto) {
    if (!document.canDeleteCurrent && !document.canDeleteAll) return;
    this.deletingDocument.set(document);
    this.deleteMode.set(document.versionCount > 1 ? null : document.canDeleteAll ? 'all' : 'current');
    this.deleteModal = this.modal.create({
      nzTitle: 'Delete document', nzContent: this.deleteConfirmation, nzFooter: null,
      nzMaskClosable: false, nzOnCancel: () => !this.store.deleting(),
    });
  }

  cancelDelete() { if (!this.store.deleting()) this.deleteModal?.destroy(); }

  confirmDelete() {
    const document = this.deletingDocument();
    const mode = this.deleteMode();
    if (!document || !mode || this.store.deleting()
        || (mode === 'all' ? !document.canDeleteAll : !document.canDeleteCurrent)) return;
    this.store.deleteDocument(this.clientId(), document, mode === 'all')
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.deleteModal?.destroy();
        this.deletingDocument.set(null);
        if (this.historyDocument()?.id === document.id) this.closeHistory();
      });
  }

  cancel() {
    if (!this.store.saving()) this.modalRef?.destroy();
  }

  addSite() {
    const name = this.newSiteName.value.trim();
    if (!this.isAdmin || !name || this.newSiteName.invalid || this.tagStore.creating()) return;
    this.tagStore.addTag(this.clientId(), name).subscribe((tag) => {
      this.form.controls.tagIds.setValue([...this.form.controls.tagIds.value, tag.id]);
      this.closeSiteEditor();
    });
  }

  openCategory() {
    this.categoryStore.formMode.set('add');
    this.categoryStore.selectedCategory.set(null);
    this.categoryModalRef = this.modal.create({ nzContent: this.categoryForm, nzFooter: null });
  }

  categoryClosed() {
    this.categoryModalRef?.destroy();
    this.store.loadCategories(this.clientId()).subscribe();
  }
}
