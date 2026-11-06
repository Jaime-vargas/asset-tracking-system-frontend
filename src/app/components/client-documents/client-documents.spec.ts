import { provideNzIcons } from 'ng-zorro-antd/icon';
import { FolderOpenOutline, FileTextOutline, ReloadOutline, PlusOutline, SearchOutline, EllipsisOutline } from '@ant-design/icons-angular/icons';
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
      tags: [{ id: 12, name: 'TecomÃ¡n', clientId: 9 }],
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
    name: document.filename.replace(/[.][^.]+$/, ''),
    currentVersion: 1,
    nextVersion: 2,
    versionCount: 1,
    canDeleteCurrent: true,
    canDeleteAll: true,
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
    uploadVersion: ReturnType<typeof vi.fn>;
    getVersions: ReturnType<typeof vi.fn>;
    deleteDocument: ReturnType<typeof vi.fn>;
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
      getDocuments: vi.fn().mockImplementation((_clientId: number, projectId: number | null) => of(documents.filter((document) => document.projectId === projectId))),
      uploadDocument: vi.fn().mockReturnValue(of(documents[1])),
      updateDocument: vi.fn().mockReturnValue(of(documents[0])),
      uploadVersion: vi.fn().mockReturnValue(of({...documents[0], currentVersion: 2})),
      deleteDocument: vi.fn().mockReturnValue(of(null)),
      getVersions: vi.fn().mockReturnValue(of([{versionNumber: 1, filename: 'Manuals_manual_v1.pdf', current: true, downloadAvailable: true}])),
    };
    modalRef = { destroy: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [ClientDocuments],
      providers: [
        provideNzIcons([FolderOpenOutline, FileTextOutline, ReloadOutline, PlusOutline, SearchOutline, EllipsisOutline]),
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

  async function createLibrary(projectId: number | null = null) {
    const fixture = TestBed.createComponent(ClientDocuments);
    fixture.componentRef.setInput('clientId', 9);
    fixture.componentRef.setInput('projectId', projectId);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('combines category and site tag filters and allows clearing them', async () => {
    api.getDocuments.mockReturnValue(
      of(documents.map((document) =>
        document.id === 1 ? { ...document, projectId: null, categoryId: 2, category: 'Plans' } : { ...document, projectId: null },
      )),
    );
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
    const category = [
      ...(fixture.nativeElement.querySelectorAll(
        'button.category-filter',
      ) as NodeListOf<HTMLButtonElement>),
    ].find((button) => button.textContent?.includes('Manuals'))!;
    category.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(store.categoryFilter()).toBe(1);
    expect(store.filteredDocuments().map((document) => document.id)).toEqual([2]);
    expect(fixture.nativeElement.textContent).not.toContain('manual.pdf');
    fixture.componentInstance.clearFilters();
    expect(store.filteredDocuments()).toHaveLength(4);
    store.siteFilter.set(11);
    store.siteFilter.set(-1);
    expect(store.filteredDocuments().map((document) => document.id)).toEqual([4]);
  });

  it('shows only client documents in the client library', async () => {
    const fixture = await createLibrary();
    const store = fixture.debugElement.injector.get(ClientDocumentsStore);
    expect(api.getDocuments).toHaveBeenCalledWith(9, null);
    expect(store.filteredDocuments().map((document) => document.id)).toEqual([1]);
    expect(fixture.nativeElement.textContent).not.toContain('colima.pdf');
  });

  it('keeps project documents in their context when clearing filters or uploading', async () => {
    const fixture = await createLibrary(7);
    const store = fixture.debugElement.injector.get(ClientDocumentsStore);
    expect(api.getDocuments).toHaveBeenCalledWith(9, 7);
    expect(store.filteredDocuments().map((document) => document.id)).toEqual([2, 3, 4]);
    store.categoryFilter.set(99);
    fixture.componentInstance.clearFilters();
    expect(store.projectId()).toBe(7);
    expect(store.filteredDocuments()).toHaveLength(3);
    fixture.componentInstance.openDocument();
    fixture.componentInstance.onFileSelected(new File(['document'], 'evidence.pdf'));
    fixture.componentInstance['form'].patchValue({categoryId: 1, scope: 'ALL_CLIENT'});
    fixture.componentInstance.saveDocument();
    expect(api.uploadDocument).toHaveBeenCalledWith(9, expect.any(File), expect.objectContaining({projectId: 7}));
  });

  it('uses the existing file icons and the selected category color', async () => {
    const fixture = await createLibrary();
    const store = fixture.debugElement.injector.get(ClientDocumentsStore);
    store.categories.set([{ id: 1, name: 'Manuals', color: 'GREEN' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img.document-icon').getAttribute('src')).toBe(
      '/file-icons/pdf.webp',
    );
    expect(
      fixture.nativeElement.querySelector('.file-metadata .tag-chip').style
        .backgroundColor,
    ).toBe('rgb(233, 246, 238)');
  });

  it('marks missing files without offering a working download', async () => {
    const fixture = await createLibrary(7);
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
    component.onFileSelected(new File(['document'], 'plan.pdf', { type: 'application/pdf' }));
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
    component.onFileSelected(new File(['document'], 'plan.pdf'));
    component['form'].patchValue({ categoryId: 1, scope: 'ALL_CLIENT' });
    component.saveDocument();
    expect(modalRef.destroy).not.toHaveBeenCalled();
    expect(component.selectedFile()?.name).toBe('plan.pdf');
    expect(fixture.debugElement.injector.get(ClientDocumentsStore).saving()).toBe(false);
  });
  it('previews a fixed category prefix and lets only the base name change', async () => {
    const fixture = await createLibrary();
    const component = fixture.componentInstance;
    const store = fixture.debugElement.injector.get(ClientDocumentsStore);
    store.categories.set([{id:1,name:'Manuals'},{id:2,name:'Plano'}]);
    component.openDocument();
    component.onFileSelected(new File(['PDF'], 'colima_CCTV-2026.pdf', {type:'application/pdf'}));
    component['form'].controls.categoryId.setValue(2);
    component['form'].controls.scope.setValue('ALL_CLIENT');
    expect(component.filenamePreview()).toBe('Plano_colima_CCTV-2026_v1.pdf');
    component['form'].controls.name.setValue('tecoman_CCTV');
    expect(component.filenamePreview()).toBe('Plano_tecoman_CCTV_v1.pdf');
    component['form'].controls.categoryId.setValue(1);
    expect(component.filenamePreview()).toBe('Manuals_tecoman_CCTV_v1.pdf');
    component.saveDocument();
    expect(api.uploadDocument).toHaveBeenCalledWith(9,expect.any(File),expect.objectContaining({name:'tecoman_CCTV',categoryId:1}));
  });

  it('uploads a new version of the existing document and preserves it after errors', async () => {
    api.uploadVersion.mockReturnValue(throwError(()=>new HttpErrorResponse({status:409,error:{message:'Another version was uploaded'}})));
    const fixture = await createLibrary();
    const component = fixture.componentInstance;
    component.openNewVersion(documents[0]);
    component.onFileSelected(new File(['PDF v2'],'different-source.pdf',{type:'application/pdf'}));
    expect(component['form'].controls.name.value).toBe('manual');
    expect(component.filenamePreview()).toBe('Manuals_manual_v2.pdf');
    component.saveDocument();
    expect(api.uploadVersion).toHaveBeenCalledWith(9,1,expect.any(File),{expectedVersion:1,name:'manual'});
    expect(modalRef.destroy).not.toHaveBeenCalled();
    expect(component.selectedFile()?.name).toBe('different-source.pdf');
    expect(fixture.debugElement.injector.get(ClientDocumentsStore).saving()).toBe(false);
  });

  it('loads downloadable history for the chosen document', async () => {
    const fixture = await createLibrary();
    fixture.componentInstance.openHistory(documents[0]);
    expect(api.getVersions).toHaveBeenCalledWith(9,1);
    expect(fixture.debugElement.injector.get(ClientDocumentsStore).versions()[0].versionNumber).toBe(1);
    expect(fixture.debugElement.injector.get(ClientDocumentsStore).versions()[0].downloadAvailable).toBe(true);
  });

  it('requires an explicit choice for a versioned document and restores the returned version', async () => {
    const fixture = await createLibrary();
    const component = fixture.componentInstance;
    const store = fixture.debugElement.injector.get(ClientDocumentsStore);
    const current = {...documents[0], currentVersion: 3, nextVersion: 4, versionCount: 2};
    store.documents.set([current]);
    const previous = {...documents[0], currentVersion: 1, nextVersion: 4};
    api.deleteDocument.mockReturnValue(of(previous));
    component.openDelete(current);
    component.confirmDelete();
    expect(api.deleteDocument).not.toHaveBeenCalled();
    component.deleteMode.set('current');
    component.confirmDelete();
    expect(api.deleteDocument).toHaveBeenCalledWith(9, current, false);
    expect(store.documents()).toEqual([previous]);
    component.openNewVersion(previous);
    expect(component.nextVersion()).toBe(4);
  });

  it('removes the document after deleting its entire history', async () => {
    const fixture = await createLibrary();
    const component = fixture.componentInstance;
    const store = fixture.debugElement.injector.get(ClientDocumentsStore);
    component.openDelete(documents[0]);
    component.confirmDelete();
    expect(api.deleteDocument).toHaveBeenCalledWith(9, documents[0], true);
    expect(store.documents()).toEqual([]);
  });

  it('keeps the dialog and document when deletion fails', async () => {
    const fixture = await createLibrary();
    const component = fixture.componentInstance;
    const store = fixture.debugElement.injector.get(ClientDocumentsStore);
    api.deleteDocument.mockReturnValue(throwError(() => new HttpErrorResponse({status: 409})));
    component.openDelete(documents[0]);
    component.confirmDelete();
    expect(modalRef.destroy).not.toHaveBeenCalled();
    expect(store.documents()).toEqual([documents[0]]);
    expect(store.deleting()).toBe(false);
  });

  it('blocks deletion choices without permission', async () => {
    const component = (await createLibrary()).componentInstance;
    const current = {...documents[0], versionCount: 2, canDeleteAll: false};
    component.openDelete(current);
    component.deleteMode.set('all');
    component.confirmDelete();
    expect(api.deleteDocument).not.toHaveBeenCalled();
    component.openDelete({...current, canDeleteCurrent: false});
    expect(component.deletingDocument()).toBe(current);
  });

  it('builds category shortcuts from the client catalog with counts scoped to the current library', async () => {
    const fixture = await createLibrary(7);
    const component = fixture.componentInstance;
    const store = fixture.debugElement.injector.get(ClientDocumentsStore);
    store.categories.set([{id:1,name:'Manuals',color:'GREEN'},{id:2,name:'Plans',color:'ORANGE'}]);
    fixture.detectChanges();
    expect(component.categorySections().map(category => [category.name,category.count])).toEqual([['Manuals',3]]);
    expect(fixture.nativeElement.querySelector('.category-navigation').textContent).not.toContain('Plans');
    expect(component.libraryDocuments()).toHaveLength(3);
    component.selectCategory(2);
    expect(component.selectedSection()).toBe('Plans');
    expect(store.filteredDocuments()).toEqual([]);
    component.openDocument();
    expect(component['form'].controls.categoryId.value).toBe(2);
    expect(component['form'].controls.projectId.value).toBe(7);
    component.selectCategory(null);
    expect(component.selectedSection()).toBe('All files');
    expect(store.filteredDocuments()).toHaveLength(3);
  });

  it('selects a category shortcut without clearing an existing site or search', async () => {
    const fixture = await createLibrary();
    const store = fixture.debugElement.injector.get(ClientDocumentsStore);
    store.siteFilter.set(11); store.search.set('manual');
    const category = fixture.nativeElement.querySelector('.category-link:not(:first-child)') as HTMLButtonElement;
    category.click(); fixture.detectChanges(); await fixture.whenStable();
    expect(store.categoryFilter()).toBe(1);
    expect(store.siteFilter()).toBe(11);
    expect(store.search()).toBe('manual');
    expect(category.getAttribute('aria-pressed')).toBe('true');
  });

});
