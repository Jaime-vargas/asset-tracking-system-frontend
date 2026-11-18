import { NzModalService } from 'ng-zorro-antd/modal';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { SaveOutline } from '@ant-design/icons-angular/icons';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Subject, throwError } from 'rxjs';
import { BranchForm } from './branch-form';
import { BranchStore } from '../../../store/branch.store';
import { BranchService } from '../../../services/branch.service';
import { SidebarStore } from '../../../store/sidebar.store';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProjectDto } from '../../../interfaces/project.dto';

describe('Project editor',()=>{
  const project={id:7,name:'Installation',createdDate:'2026-01-20',reportsActive:[],totalHardware:0};
  let result:Subject<ProjectDto>;
  let api:{editBranch:ReturnType<typeof vi.fn>};
  beforeEach(async()=>{
    result=new Subject<ProjectDto>(); api={editBranch:vi.fn(()=>result)};
    await TestBed.configureTestingModule({imports:[BranchForm],providers:[
      provideNzIcons([SaveOutline]), {provide:NzModalService,useValue:{}},
      {provide:BranchService,useValue:api},
      {provide:NzMessageService,useValue:{success:vi.fn()}},
      {provide:NzNotificationService,useValue:{error:vi.fn()}},
    ]}).compileComponents();
  });
  function createEditor(){
    const store=TestBed.inject(BranchStore); store.formMode.set('edit');store.selectedBranch.set(project);store.branchList.set([project]);store.currentClientId.set(9);
    const sidebar=TestBed.inject(SidebarStore);sidebar.isOpen.set(true);
    const fixture=TestBed.createComponent(BranchForm);fixture.detectChanges();return {fixture,store,sidebar};
  }
  it('shows an immutable date and waits for successful save without duplicate requests',()=>{
    const {fixture,store,sidebar}=createEditor();
    fixture.componentInstance['branchForm'].controls.name.setValue('Maintenance');
    fixture.componentInstance.submitForm();fixture.componentInstance.submitForm();
    expect(api.editBranch).toHaveBeenCalledExactlyOnceWith(7,{name:'Maintenance'});
    expect(sidebar.isOpen()).toBe(true);
    expect(fixture.nativeElement.querySelector('time').getAttribute('datetime')).toBe('2026-01-20');
    expect(fixture.nativeElement.querySelector('input[type="date"]')).toBeNull();
    result.next({id:7,name:'Maintenance',createdDate:'2026-01-20'});result.complete();
    expect(sidebar.isOpen()).toBe(false);
    expect(store.branchList()[0].name).toBe('Maintenance');
    expect(store.branchList()[0].createdDate).toBe('2026-01-20');
  });
  it('keeps the editor and entered name after a failed save',()=>{
    api.editBranch.mockReturnValue(throwError(()=>({error:{message:'Try again'}})));
    const {fixture,sidebar}=createEditor();
    fixture.componentInstance['branchForm'].controls.name.setValue('Maintenance');
    fixture.componentInstance.submitForm();
    expect(sidebar.isOpen()).toBe(true);
    expect(fixture.componentInstance.saving()).toBe(false);
    expect(fixture.componentInstance['branchForm'].controls.name.value).toBe('Maintenance');
  });
});
