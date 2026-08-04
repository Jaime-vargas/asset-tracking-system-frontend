import {Component, computed, inject, OnInit, signal, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DashboardBoxComponent} from '../../components/dasboard-box-component/dashboard-box.component';
import {FormsModule} from '@angular/forms';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective, NzInputPrefixDirective, NzInputWrapperComponent} from 'ng-zorro-antd/input';
import {NzImageModule} from 'ng-zorro-antd/image';
import {HardwareTableDto} from '../../interfaces/hardware/hardware-table.dto';
import {RouteContextService} from '../../services/route-context.service';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {BreadcrumbComponent} from '../../components/breadcrumb-component/breadcrumb-component';
import {UtilityService} from '../../services/utility.service';
import {TableComponent} from '../../components/table-component/table-component';
import {TableData} from '../../interfaces/table/table-data';
import {
  TableColumnsBranchHardwareService
} from '../../services/table-columns-service/table-columns-branch-hardware.service';
import {NzDropdownDirective, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzMenuDirective, NzMenuItemComponent} from 'ng-zorro-antd/menu';
import {SidebarStore} from '../../store/sidebar.store';
import {EditSideBar} from '../../components/edit-side-bar/edit-side-bar';
import {HardwareStore} from '../../store/hardware.store';
import {CameraForm} from '../../components/forms/camera-form/camera-form.component';
import {BranchStore} from '../../store/branch.store';
import {UploadButtonComponent} from '../../components/upload-button-component/upload-button-component';
import {ImportTemplate} from '../../interfaces/importResponse.type';
import {TableColumnsBranchFiles} from '../../services/table-columns-service/table-columns-branch-files.service';
import {NzSegmentedComponent, NzSegmentedItemComponent} from 'ng-zorro-antd/segmented';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {UploadComponent} from '../../components/upload-drag-and-drop-component/upload-component';
import {NzUploadFile} from 'ng-zorro-antd/upload';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {FileCategoryDto} from '../../interfaces/file-category.dto';
import {FileCategoryForm} from '../../components/forms/file-category-form/file-category-form/file-category-form';
import {FileCategoryStore} from '../../store/file-category.store';
import {ApiUrlBaseService} from '../../services/api-url-base.service';
import {AuthService} from '../../services/auth-service';

@Component({
  selector: 'app-branch-hardware-device-page',
  imports: [
    DashboardBoxComponent,
    FormsModule,
    NzButtonComponent,
    NzIconDirective,
    NzImageModule,
    NzInputDirective,
    NzInputPrefixDirective,
    NzInputWrapperComponent,
    NzRowDirective,
    NzColDirective,
    BreadcrumbComponent,
    TableComponent,
    NzDropdownDirective,
    NzDropdownMenuComponent,
    NzFlexDirective,
    NzMenuDirective,
    NzMenuItemComponent,
    EditSideBar,
    CameraForm,
    UploadButtonComponent,
    NzSegmentedComponent,
    NzSegmentedItemComponent,
    NzTypographyComponent,
    UploadComponent,
    NzOptionComponent,
    NzSelectComponent,
    NzFormLabelComponent,
    NzDividerComponent,
    FileCategoryForm
  ],
  standalone: true,
  templateUrl: './branch-hardware-page.html',
  styleUrl: './branch-hardware-page.css',
})
export class BranchHardwarePage implements OnInit {

  private apiService = inject(ApiUrlBaseService);
  protected authService = inject(AuthService);
  protected branchStore = inject(BranchStore);
  protected fileCategoryStore = inject(FileCategoryStore);
  protected hardwareStore = inject(HardwareStore);
  protected modalService = inject(NzModalService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private routeContext = inject(RouteContextService);
  private sidebarStore = inject(SidebarStore);
  protected tableColumnsBranchFiles = inject(TableColumnsBranchFiles);
  protected tableBranchHardwareService = inject(TableColumnsBranchHardwareService);
  private utilityService = inject(UtilityService);

  // Sidebar
  openSideBar = this.sidebarStore.isOpen;

  currentBranchId!:number;
  currentRole!:string;

  selectedHardware = this.hardwareStore.selectedHardware;
  hardwareList = this.hardwareStore.hardwareList;
  formMode = this.hardwareStore.formMode;

  // Filters
  typeFilter = signal<string>("");
  nameFilter = signal<string>("");
  modelFilter = signal<string>("");
  serialNumberFilter = signal<string>("");
  locationFilter = signal<string>("");
  lastMaintenanceFilter = signal<string>("");

  // Computed variables
  breadcrumb = computed<{label:string | null, link?:(string|number|null)[]}[]>(() =>
    [{label: 'Clients',
      link: ['/clients']},
      {label: this.routeContext.clientSlug(),
        link: ['/clients', this.routeContext.clientId(), this.routeContext.clientSlug()]},
      {label: this.routeContext.branchSlug()}
    ]);

  filteredHardware = computed(() => {
    return this.hardwareList().filter(hardware => {
      return (
        hardware.type.toLowerCase().includes(this.typeFilter().toLowerCase()) &&
        hardware.name.toLowerCase().includes(this.nameFilter().toLowerCase()) &&
        hardware.model.toLowerCase().includes(this.modelFilter().toLowerCase()) &&
        hardware.serialNumber.toLowerCase().includes(this.serialNumberFilter().toLowerCase()) &&
        hardware.location.toLowerCase().includes(this.locationFilter().toLowerCase()) &&
        hardware.lastMaintenanceDate.toLowerCase().includes(this.lastMaintenanceFilter().toLowerCase())
      );
    });
  });

  tableData = computed<TableData[]>(() => {
    return this.filteredHardware().map(hardware => {
      return {
        ...hardware,
        lastMaintenanceDate: this.utilityService.isValidDate(hardware.lastMaintenanceDate),
        actions: [
          {label: 'View', type: 'link', link:['/clients',this.routeContext.clientId(), this.routeContext.clientSlug(),
              'branches',this.routeContext.branchId(),this.routeContext.branchSlug(),
              'hardware',hardware.id,this.utilityService.slugify(hardware.name)]},
          {label: "Edit", type: 'edit', onClick: (hardware: HardwareTableDto)=> this.openEditSidebar(hardware)},
        ]
      }
    })
  });

  categoryFilter = computed(() => [
    { id: 0, name: 'All Files' },
    ...this.branchStore.fileCategoryList().map(c => ({
      id: c.id,
      name: c.name,
    }))
  ])
  selectedCategoryFilter = signal<string>('');
  handleValueChange(selectedCategory: string | number){
    selectedCategory = selectedCategory.toString();
    if (selectedCategory === 'All Files') this.selectedCategoryFilter.set('');
    else this.selectedCategoryFilter.set(selectedCategory);
  }

  filteredBranchFiles = computed(() => {
    const category = this.selectedCategoryFilter();
    return this.branchFiles().filter(file => {
      return category === '' || file.category === category;
    });
  })

  branchFiles = computed(()=>{
    return this.branchStore.projectFiles().map(file => {
      const type = this.utilityService.getType(file.contentType);
      return {
        ...file,
        fileType: type,
        contentType: type.type,
        size: this.utilityService.formatSize(file.size),
        actions: [
          {label: "Download", type: 'download', link: "", onClick: ()=> this.downloadFile(this.apiService.imageBaseUrl + file.filePath)}
        ]
      }
    })
  })

  downloadFile(url: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.target = '_blank'; // opcional
    a.click();
  }

  // File Categories Modal
  // TODO. Implement this on a Category Store
  @ViewChild('saveUpdateModal',{static:true})
  saveUpdateModal!: TemplateRef<void>
  modalRef?: NzModalRef;
  saveCategory(){
    this.fileCategoryStore.formMode.set("add");
    this.modalRef = this.modalService.create({
      nzContent: this.saveUpdateModal,
      nzFooter: null,
      nzMaskClosable: false,
    })
  }

  updateCategory(category: FileCategoryDto){
    this.fileCategoryStore.formMode.set("edit");
    this.fileCategoryStore.selectedCategory.set(category);
    this.modalRef = this.modalService.create({
      nzContent: this.saveUpdateModal,
      nzFooter: null,
      nzMaskClosable: false,
    })
  }

  //Image Before Upload
  selectedUploadCategory = signal<number | null >(null)
  beforeUpload = (file:NzUploadFile, fileList: NzUploadFile[]) => {
    if(file instanceof File) this.branchStore.fileUploadList.update(curr => [...curr, file]);
    if( this.branchStore.fileUploadList().length === fileList.length) this.uploadFileList();
    return false;
  }

  @ViewChild('uploadModal',{static:true})
  uploadModal!: TemplateRef<void>;
  uploadFileList(){
    this.modalService.create({
      nzContent: this.uploadModal,
      nzOnOk: () => this.Upload(),
      nzOnCancel: () => this.onCancelUpload(),
    });
  }

  Upload(){
    const categoryId = this.selectedUploadCategory();
    if(categoryId === null) return;
    this.branchStore.uploadFileList(this.currentBranchId, categoryId)
    this.selectedUploadCategory.set(null);
    this.branchStore.fileUploadList.set([]);
  }

  onCancelUpload(){
    this.selectedUploadCategory.set(null);
    this.branchStore.fileUploadList.set([]);
  }

  ngOnInit() {
    this.routeContext.setFromRoute(this.route);
    this.hardwareStore.currentBranchId.set(this.routeContext.branchId());

    this.hardwareStore.loadHardware();

    const currentBranchId = this.routeContext.branchId();
    if(currentBranchId === null) return;
    this.currentBranchId = currentBranchId;

    this.currentRole = this.authService.getUserRole();

    this.branchStore.getFilesByBranchId(currentBranchId).subscribe({
      next: data =>
        this.branchStore.projectFiles.set(data)
    });

    this.branchStore.getFilesCategories();
  }

  openEditSidebar(hardware: HardwareTableDto){
    this.hardwareStore.getCameraEditData(hardware.id);
    this.formMode.set("edit");
    this.openSideBar.set(true);
  }

  openNewSidebar(){
    this.selectedHardware.set(null);
    this.formMode.set("add");
    this.openSideBar.set(true);
  }

  importSuccess(response:ImportTemplate){
    this.branchStore.importSuccess(response);
    this.hardwareStore.loadHardware();
  }

}
