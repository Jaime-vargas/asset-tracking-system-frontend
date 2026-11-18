import { Component, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { FolderOpenOutline, CalendarOutline, SettingOutline, FileTextOutline, DesktopOutline } from '@ant-design/icons-angular/icons';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { ClientBranchesPage } from './client-branches-page';
import { BranchStore } from '../../store/branch.store';
import { ClientStore } from '../../store/client.store';
import { ClientDocuments } from '../../components/client-documents/client-documents';
import { ClientHardware } from '../../components/client-hardware/client-hardware';

@Component({selector:'app-client-documents',template:''})
class DocumentsStub { clientId=input<number>(); revision=input<number>(); }
@Component({selector:'app-client-hardware',template:''})
class HardwareStub { clientId=input<number>(); revision=input<number>(); }

describe('Client project navigation', () => {
  const projects = [
    {id:1,name:'Installation',createdDate:'2026-01-20',reportsActive:[],totalHardware:0},
    {id:2,name:'Maintenance',createdDate:'2026-02-15',reportsActive:[],totalHardware:0},
    {id:3,name:'Inspection',createdDate:'2026-03-10',reportsActive:[],totalHardware:0},
  ];
  beforeEach(async () => {
    vi.stubGlobal('ResizeObserver', class {observe() {} unobserve() {} disconnect() {}});
    vi.stubGlobal('matchMedia', () => ({matches:false,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}));
    await TestBed.configureTestingModule({imports:[ClientBranchesPage],providers:[
      provideRouter([]), provideHttpClient(), provideNzIcons([FolderOpenOutline,CalendarOutline,SettingOutline,FileTextOutline,DesktopOutline]),
      {provide:ActivatedRoute,useValue:{snapshot:{params:{clientId:'9',clientSlug:'yazaki'}},queryParamMap:of(convertToParamMap({tab:'projects'}))}},
      {provide:BranchStore,useValue:{currentClientId:signal(null),branchList:signal(projects),tableLoading:signal(false),loadError:signal(false),loadBranches:vi.fn()}},
      {provide:ClientStore,useValue:{clientList:signal([{id:9,name:'Yazaki',photo:null}]),summary:signal(null),tableLoading:signal(false),loadClientSummary:()=>of({id:9,name:'Yazaki'})}},
    ]}).overrideComponent(ClientBranchesPage,{remove:{imports:[ClientDocuments,ClientHardware]},add:{imports:[DocumentsStub,HardwareStub]}}).compileComponents();
  });
  async function createPage(){
    const fixture=TestBed.createComponent(ClientBranchesPage);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges(); return fixture;
  }
  it('makes each compact card one link, showing creation dates newest first', async () => {
    const fixture=await createPage();
    const cards=[...fixture.nativeElement.querySelectorAll('a.project-card')] as HTMLAnchorElement[];
    expect(cards.map(card=>card.querySelector('h3')?.textContent)).toEqual(['Inspection','Maintenance','Installation']);
    expect(cards[0].getAttribute('href')).toContain('/branches/3/inspection/hardware');
    expect(cards[0].querySelector('time')?.getAttribute('datetime')).toBe('2026-03-10');
    expect(fixture.nativeElement.querySelector('.project-card button')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('View documents');
  });
  it('filters inclusive creation dates, supports oldest first and clears the range', async () => {
    const fixture=await createPage();
    const from=fixture.nativeElement.querySelector('input[aria-label="Created from"]') as HTMLInputElement;
    const to=fixture.nativeElement.querySelector('input[aria-label="Created to"]') as HTMLInputElement;
    from.value='2026-02-15'; from.dispatchEvent(new Event('input'));
    to.value='2026-03-10'; to.dispatchEvent(new Event('input'));
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.componentInstance.filteredBranches().map(project=>project.id)).toEqual([3,2]);
    fixture.componentInstance.projectOrder.set('oldest');
    expect(fixture.componentInstance.filteredBranches().map(project=>project.id)).toEqual([2,3]);
    fixture.componentInstance.createdFrom.set('2026-04-01'); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('start date');
    expect(fixture.componentInstance.filteredBranches()).toHaveLength(0);
    fixture.componentInstance.clearProjectFilters();
    expect(fixture.componentInstance.filteredBranches()).toHaveLength(3);
  });
  it('keeps named tab URLs aligned with Documents, Projects, Hardware', async () => {
    const fixture=await createPage();
    expect([...fixture.nativeElement.querySelectorAll('.workspace-nav button')].map((tab:any)=>tab.textContent.trim())).toEqual(['Documents','Projects','Hardware']);
    expect(fixture.componentInstance.activeTab()).toBe(1);
    const navigate=vi.spyOn(TestBed.inject(Router),'navigate').mockResolvedValue(true);
    fixture.componentInstance.changeTab(2);
    expect(navigate).toHaveBeenCalledWith([],expect.objectContaining({queryParams:{tab:'hardware',project:null}}));
  });
});
