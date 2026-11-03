import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {catchError, EMPTY, finalize, tap} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {DocumentService} from '../services/document.service';
import {BranchService} from '../services/branch.service';
import {DocumentDto, DocumentRequestDto} from '../interfaces/document.dto';
import {FileCategoryDto} from '../interfaces/file-category.dto';

@Injectable({providedIn: 'root'})
export class ClientDocumentsStore {
  private documentService = inject(DocumentService);
  private branchService = inject(BranchService);
  private notification = inject(NzNotificationService);

  documents = signal<DocumentDto[]>([]);
  categories = signal<FileCategoryDto[]>([]);
  loading = signal(false);
  loadError = signal(false);
  saving = signal(false);
  downloadingId = signal<number | null>(null);
  search = signal('');
  categoryFilter = signal<number | null>(null);
  projectFilter = signal<number | null>(null);
  siteFilter = signal<number | null>(null);

  filteredDocuments = computed(() => this.documents().filter(document => {
    const site = this.siteFilter();
    const matchesSite = site === null
      || (site === 0 && document.scope === 'ALL_CLIENT')
      || (site === -1 && document.scope === 'UNASSIGNED')
      || (site > 0 && (document.scope === 'ALL_CLIENT' || document.tags.some(tag => tag.id === site)));
    return matchesSite && document.filename.toLowerCase().includes(this.search().trim().toLowerCase())
      && (this.categoryFilter() === null || document.categoryId === this.categoryFilter())
      && (this.projectFilter() === null || document.projectId === this.projectFilter());
  }));

  loadDocuments(clientId: number) {
    this.documents.set([]);
    this.loading.set(true);
    this.loadError.set(false);
    return this.documentService.getDocuments(clientId).pipe(
      tap(documents => this.documents.set(documents)),
      catchError((error: HttpErrorResponse) => { this.loadError.set(true); return this.responseError(error); }),
      finalize(() => this.loading.set(false))
    );
  }

  loadCategories() {
    return this.branchService.getFileCategories().pipe(
      tap(categories => this.categories.set(categories)),
      catchError((error: HttpErrorResponse) => this.responseError(error))
    );
  }

  saveDocument(clientId: number, request: DocumentRequestDto, file: File | null, documentId: number | null) {
    if (documentId === null && file === null) return EMPTY;
    this.saving.set(true);
    const response = documentId !== null
      ? this.documentService.updateDocument(clientId, documentId, request)
      : this.documentService.uploadDocument(clientId, file!, request);
    return response.pipe(
      tap(document => this.documents.update(documents => documentId !== null
        ? documents.map(existing => existing.id === document.id ? document : existing)
        : [document, ...documents])),
      catchError((error: HttpErrorResponse) => this.responseError(error)),
      finalize(() => this.saving.set(false))
    );
  }

  download(clientId: number, documentId: number, filename: string) {
    if (this.downloadingId() !== null) return;
    this.downloadingId.set(documentId);
    this.documentService.downloadDocument(clientId, documentId).pipe(
      finalize(() => this.downloadingId.set(null))
    ).subscribe({
      next: response => {
        if (!response.body) return;
        const url = URL.createObjectURL(response.body);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: (error: HttpErrorResponse) => this.responseError(error)
    });
  }

  private responseError(error: HttpErrorResponse) {
    this.notification.error('Request Failed', error.error?.message ?? 'Could not load or save the document.', {nzDuration: 0});
    return EMPTY;
  }
}
