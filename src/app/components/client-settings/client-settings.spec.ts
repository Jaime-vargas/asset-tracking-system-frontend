import { SaveOutline } from '@ant-design/icons-angular/icons';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ClientSettings } from './client-settings';
import { BranchService } from '../../services/branch.service';
import { TagService } from '../../services/tag.service';
import { AuthService } from '../../services/auth-service';
import { FileCategoryStore } from '../../store/file-category.store';
describe('Client settings', () => {
  const categories = { getFileCategories: vi.fn(), deleteFileCategory: vi.fn() };
  const tags = { getClientTags: vi.fn(), addTag: vi.fn(), editTag: vi.fn(), deleteTag: vi.fn() };
  const modal = { confirm: vi.fn(), create: vi.fn(() => ({ destroy: vi.fn() })) };
  let role = 'ADMIN';
  beforeEach(async () => {
    vi.clearAllMocks();
    role = 'ADMIN';
    categories.getFileCategories.mockReturnValue(of([{ id: 31, name: 'Manuals' }]));
    tags.getClientTags.mockReturnValue(of([{ id: 11, clientId: 9, name: 'Colima' }]));
    tags.addTag.mockReturnValue(of({ id: 12, clientId: 9, name: 'Tecomán' }));
    await TestBed.configureTestingModule({
      imports: [ClientSettings],
      providers: [
        provideNzIcons([SaveOutline]),
        { provide: BranchService, useValue: categories },
        { provide: TagService, useValue: tags },
        { provide: AuthService, useValue: { getUserRole: () => role } },
        { provide: NzNotificationService, useValue: { error: vi.fn() } },
        { provide: NzModalService, useValue: modal },
      ],
    })
      .overrideComponent(ClientSettings, {
        add: { providers: [{ provide: NzModalService, useValue: modal }] },
      })
      .compileComponents();
  });
  async function createSettings() {
    const fixture = TestBed.createComponent(ClientSettings);
    fixture.componentRef.setInput('clientId', 9);
    fixture.componentRef.setInput('detailsAvailable', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }
  it('loads the current client catalog and creates a site for that client', async () => {
    const fixture = await createSettings();
    const changed = vi.fn();
    fixture.componentInstance.changed.subscribe(changed);
    expect(categories.getFileCategories).toHaveBeenCalledWith(9);
    expect(tags.getClientTags).toHaveBeenCalledWith(9);
    fixture.componentInstance.openSite();
    fixture.componentInstance.siteName.setValue(' Tecomán ');
    const editor = fixture.componentInstance.siteEditor.createEmbeddedView(undefined);
    editor.detectChanges();
    const editorRoot = editor.rootNodes.find((node: Node) => node.nodeType === 1) as HTMLElement;
    const submit = new Event('submit', { bubbles: true, cancelable: true });
    editorRoot.querySelector('.site-form')!.dispatchEvent(submit);
    expect(submit.defaultPrevented).toBe(true);
    expect(tags.addTag).toHaveBeenCalledWith(9, 'Tecomán', 'PURPLE');
    expect(changed).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.siteName.value).toBe('');
    editor.destroy();
  });
  it('opens category editing without changing the chosen category identity', async () => {
    const fixture = await createSettings();
    fixture.nativeElement.querySelector('button[aria-label="Edit category Manuals"]').click();
    const categoryStore = TestBed.inject(FileCategoryStore);
    expect(categoryStore.selectedCategory()?.id).toBe(31);
    expect(categoryStore.formMode()).toBe('edit');
    expect(modal.create).toHaveBeenCalledOnce();
  });
  it('lets standard users create labels while hiding profile and label editing', async () => {
    role = 'USER';
    const fixture = await createSettings();
    const settings = fixture.nativeElement as HTMLElement;
    expect(settings.textContent).not.toContain('Edit details');
    expect(settings.querySelector('button[aria-label="Edit category Manuals"]')).toBeNull();
    expect(settings.querySelector('button[aria-label="Edit site Colima"]')).toBeNull();
    fixture.componentInstance.openCategory({ id: 31, name: 'Manuals' });
    expect(modal.create).not.toHaveBeenCalled();
    fixture.componentInstance.openCategory();
    fixture.componentInstance.openSite();
    expect(modal.create).toHaveBeenCalledTimes(2);
  });
  it('saves site edits with the selected preset color', async () => {
    tags.editTag.mockReturnValue(of({ id: 11, clientId: 9, name: 'Colima North', color: 'BLUE' }));
    const fixture = await createSettings();
    fixture.componentInstance.editSite({ id: 11, clientId: 9, name: 'Colima' });
    fixture.componentInstance.siteName.setValue('Colima North');
    fixture.componentInstance.siteColor.setValue('BLUE');
    fixture.componentInstance.addSite();
    expect(tags.editTag).toHaveBeenCalledWith(9, 11, 'Colima North', 'BLUE');
    expect(fixture.componentInstance.editingSite()).toBeNull();
  });
  it('requires confirmation and keeps a category after a blocked deletion', async () => {
    const fixture = await createSettings();
    categories.deleteFileCategory.mockReturnValue(
      throwError(() => ({ error: { message: 'Category is used' } })),
    );
    fixture.componentInstance.confirmDeleteCategory({ id: 31, name: 'Manuals' });
    expect(categories.deleteFileCategory).not.toHaveBeenCalled();
    const confirm = modal.confirm.mock.calls[0][0] as any;
    await expect(confirm.nzOnOk()).rejects.toBeDefined();
    expect(fixture.componentInstance.categories().map((item) => item.id)).toEqual([31]);
  });
  it('removes an unused site after confirmation', async () => {
    tags.deleteTag.mockReturnValue(of(undefined));
    const fixture = await createSettings();
    fixture.componentInstance.confirmDeleteSite({ id: 11, clientId: 9, name: 'Colima' });
    expect(tags.deleteTag).not.toHaveBeenCalled();
    const confirm = modal.confirm.mock.calls[0][0] as any;
    await confirm.nzOnOk();
    expect(tags.deleteTag).toHaveBeenCalledWith(9, 11);
  });
  it('shows a retry state if the category request fails', async () => {
    categories.getFileCategories.mockReturnValue(throwError(() => new Error('Unavailable')));
    const fixture = await createSettings();
    expect(fixture.nativeElement.textContent).toContain('Categories could not be loaded');
  });
});
