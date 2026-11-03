import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ClientDocuments } from './client-documents';
import { ClientDocumentsStore } from '../../store/client-documents.store';
import { DocumentService } from '../../services/document.service';
import { TagService } from '../../services/tag.service';
import { BranchService } from '../../services/branch.service';
import { AuthService } from '../../services/auth-service';
import { FileCategoryStore } from '../../store/file-category.store';
import { DocumentDto } from '../../interfaces/document.dto';

describe('Client document library', () => {
  const documents: DocumentDto[] = [
    {
      id: 1,
      filename: 'manual.pdf',
      scope: 'ALL_CLIENT',
      tags: [],
      projectId: null,
      projectName: null,
    },
    {
      id: 2,
      filename: 'colima.pdf',
      scope: 'SELECTED_SITES',
      tags: [{ id: 11, name: 'Colima', clientId: 9 }],
      projectId: 7,
      projectName: 'Maintenance',
    },
    {
      id: 3,
      filename: 'tecoman.pdf',
      scope: 'SELECTED_SITES',
      tags: [{ id: 12, name: 'Tecomán', clientId: 9 }],
      projectId: 7,
      projectName: 'Maintenance',
    },
    {
      id: 4,
      filename: 'legacy.pdf',
      scope: 'UNASSIGNED',
      tags: [],
      projectId: 7,
      projectName: 'Maintenance',
    },
  ].map((document) => ({
    ...document,
    contentType: 'application/pdf',
    size: 10,
    uploadedAt: '2026-11-03T12:00:00Z',
    categoryId: 1,
    category: 'Manuals',
    user: 'Tester',
    downloadAvailable: document.id !== 4,
  })) as DocumentDto[];
  let api: {
    getDocuments: ReturnType<typeof vi.fn>;
    uploadDocument: ReturnType<typeof vi.fn>;
    updateDocument: ReturnType<typeof vi.fn>;
  };
  let modalRef: { destroy: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
      })),
    );
    api = {
      getDocuments: vi.fn().mockReturnValue(of(documents)),
      uploadDocument: vi.fn().mockReturnValue(of(documents[1])),
      updateDocument: vi.fn().mockReturnValue(of(documents[0])),
    };
    modalRef = { destroy: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [ClientDocuments],
      providers: [
        { provide: DocumentService, useValue: api },
        {
          provide: BranchService,
          useValue: { getFileCategories: () => of([{ id: 1, name: 'Manuals' }]) },
        },
        {
          provide: TagService,
          useValue: { getClientTags: () => of([{ id: 11, name: 'Colima', clientId: 9 }]) },
        },
        { provide: AuthService, useValue: { getUserRole: () => 'USER' } },
        {
          provide: FileCategoryStore,
          useValue: { formMode: signal('add'), selectedCategory: signal(null) },
        },
        { provide: NzNotificationService, useValue: { error: vi.fn() } },
        { provide: NzModalService, useValue: { create: vi.fn().mockReturnValue(modalRef) } },
      ],
    })
      .overrideComponent(ClientDocuments, {
        add: {
          providers: [
            { provide: NzModalService, useValue: { create: vi.fn().mockReturnValue(modalRef) } },
          ],
        },
      })
      .compileComponents();
  });

  async function createLibrary() {
    const fixture = TestBed.createComponent(ClientDocuments);
    fixture.componentRef.setInput('clientId', 9);
    fixture.componentRef.setInput('projects', []);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('shows common documents with a selected site and filters by document tags', async () => {
    const fixture = await createLibrary();
    const store = fixture.debugElement.injector.get(ClientDocumentsStore);
    expect(fixture.nativeElement.textContent).toContain('manual.pdf');
    const site = [
      ...(fixture.nativeElement.querySelectorAll(
        'button.tag-filter',
      ) as NodeListOf<HTMLButtonElement>),
    ].find((button) => button.textContent?.includes('Colima'))!;
    site.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(store.filteredDocuments().map((document) => document.id)).toEqual([1, 2]);
    store.projectFilter.set(7);
    expect(store.filteredDocuments().map((document) => document.id)).toEqual([2]);
    store.siteFilter.set(-1);
    expect(store.filteredDocuments().map((document) => document.id)).toEqual([4]);
  });

  it('opens with a project filter and reports clearing it to the workspace', async () => {
    const fixture = await createLibrary();
    fixture.componentRef.setInput('initialProjectId', 7);
    fixture.detectChanges();
    await fixture.whenStable();
    const store = fixture.debugElement.injector.get(ClientDocumentsStore);
    expect(store.filteredDocuments().map((document) => document.id)).toEqual([2, 3, 4]);
    const changed = vi.fn();
    fixture.componentInstance.projectFilterChange.subscribe(changed);
    fixture.componentInstance.clearFilters();
    expect(changed).toHaveBeenCalledWith(null);
    expect(store.filteredDocuments()).toHaveLength(4);
  });

  it('marks missing files without offering a working download', async () => {
    const fixture = await createLibrary();
    const missing = [
      ...(fixture.nativeElement.querySelectorAll(
        'button.document-name',
      ) as NodeListOf<HTMLButtonElement>),
    ].find((button) => button.textContent?.includes('legacy.pdf'))!;
    expect(missing.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('File unavailable');
  });

  it('requires explicit scope and sites before uploading', async () => {
    const fixture = await createLibrary();
    const component = fixture.componentInstance;
    component.openDocument();
    component.selectedFile.set(new File(['document'], 'plan.pdf', { type: 'application/pdf' }));
    component['form'].controls.categoryId.setValue(1);
    component.saveDocument();
    expect(api.uploadDocument).not.toHaveBeenCalled();
    component['form'].controls.scope.setValue('SELECTED_SITES');
    component.saveDocument();
    expect(api.uploadDocument).not.toHaveBeenCalled();
    component['form'].controls.tagIds.setValue([11]);
    component.saveDocument();
    expect(api.uploadDocument).toHaveBeenCalledWith(
      9,
      expect.any(File),
      expect.objectContaining({ scope: 'SELECTED_SITES', tagIds: [11] }),
    );
    expect(modalRef.destroy).toHaveBeenCalledOnce();
  });

  it('keeps the selection and modal open after an upload error', async () => {
    api.uploadDocument.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'Conflict' } })),
    );
    const fixture = await createLibrary();
    const component = fixture.componentInstance;
    component.openDocument();
    component.selectedFile.set(new File(['document'], 'plan.pdf'));
    component['form'].patchValue({ categoryId: 1, scope: 'ALL_CLIENT' });
    component.saveDocument();
    expect(modalRef.destroy).not.toHaveBeenCalled();
    expect(component.selectedFile()?.name).toBe('plan.pdf');
    expect(fixture.debugElement.injector.get(ClientDocumentsStore).saving()).toBe(false);
  });
});
