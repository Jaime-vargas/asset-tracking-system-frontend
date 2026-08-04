import {inject, Injectable, signal} from '@angular/core';
import {BranchTableDto} from '../interfaces/branch-table.dto';
import {BranchService} from '../services/branch.service';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {NzMessageService} from 'ng-zorro-antd/message';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {ImportTemplate} from '../interfaces/importResponse.type';
import {NzModalService} from 'ng-zorro-antd/modal';
import {FileEntityDto} from '../interfaces/fileEntityDto';
import {catchError, EMPTY, tap} from 'rxjs';
import {FileCategoryDto} from '../interfaces/file-category.dto';

@Injectable({providedIn: "root"})
export class BranchStore {

  private branchService = inject(BranchService);
  private messageService = inject(NzMessageService);
  private notification = inject(NzNotificationService);
  private modal = inject(NzModalService);

  // THIS STORE WILL BE USED TO HANDLE THE STATUS OF BRANCHES. IN ORDER TO HAVE ALL CENTRALIZED.
  // Every branch depends on a clientId
  public currentClientId = signal<number | null>(null);

  // Table
  public tableLoading = signal<boolean>(false);

  // Entity
  public branchList = signal<BranchTableDto[]>([]);
  public selectedBranch = signal<BranchTableDto | null>(null);

  // Project files
  public projectFiles = signal<FileEntityDto[]>([]);
  public fileUploadList = signal<(File)[]>([])
  public fileCategoryList = signal<FileCategoryDto[]>([]);

  // Form
  public formMode = signal<"add" | "edit" | null>(null);

  // Communication with service layer
  public loadBranches(){
    const clientId = this.currentClientId();
    if (clientId === null) return
    this.tableLoading.set(true);
    this.branchService.getBranches(clientId).subscribe({
      next: (data: BranchTableDto[]) => this.branchList.set(data),
      error: (err: HttpErrorResponse) => this.responseError(err),
      complete: () => this.tableLoading.set(false),
    });
  }

  public addBranch(clientId: number, newBranch: BranchTableDto) {
    this.branchService.addBranch(clientId, newBranch).subscribe({
      next: (data: BranchTableDto) =>
        /* FIX-response incomplete (id, name), make response brings BranchTableDto object */
        this.branchList.update(currList => [...currList, {...data, reportsActive:[], totalHardware: 0}]),
      error: (err: HttpErrorResponse) => this.responseError(err),
      complete: () => this.messageService.success('Branch created successfully.')
    })
  }

  public editBranch(branchId: number, branch: BranchTableDto) {
    this.branchService.editBranch(branchId, branch).subscribe({
      next: (data: BranchTableDto) =>
        this.branchList.update(currList => currList.map(
          branch => branch.id === branchId ? {...branch, name: data.name} : branch)), // Only name is updated, because response don't include all table data.
      error: (err: HttpErrorResponse) => this.responseError(err),
      complete: () => this.messageService.success('Branch edited successfully.')
    })
  }

  /** Import/export XLS */
  public getImportCamerasUrl(branchId: number):string {
    return this.branchService.getImportCamerasUrl(branchId);
  }

  public importSuccess(response:ImportTemplate){
    const errors = response.errors.length
      ? `<ul style="height: 500px; overflow: scroll">${response.errors.map(e => `<li>${e}</li>`).join('')}</ul>`
      : '<p>No errors.</p>';
    this.modal.info({
      nzTitle: 'Import Result',
      nzContent: `
      <p><strong>Processed:</strong> ${response.processed}</p>
      <p><strong>Successful:</strong> ${response.successful}</p>
      <p><strong>Errors:</strong> ${response.errorsCount}</p>
      <hr>
      ${errors}
    `,
      nzWidth:800,
      nzMaskClosable: true
      }
    )
  }

  public getImportTemplate() {
    this.branchService.getImportTemplate().subscribe({
      next: (response: HttpResponse<Blob>) => {
        const blob = response.body!;
        const fileName = this.getFileNameFromHeader(response)
        this.downloadFromBlob(blob, fileName);
      },
      error: (err: HttpErrorResponse) => this.responseError(err),
      complete:() => this.messageService.success('Template generated successfully.'),
    })
  }

  public exportCamerasToXLS (branchId: number) {
    this.branchService.exportCamerasToXLS(branchId).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const blob = response.body!;
        const fileName = this.getFileNameFromHeader(response)
        this.downloadFromBlob(blob, fileName);
      },
      error: (err: HttpErrorResponse) => this.responseError(err),
      complete:() => this.messageService.success('Cameras exported successfully.'),
    })
  }

  getFileNameFromHeader(httpResponse: HttpResponse<any>):string{
    const disposition = httpResponse.headers.get('Content-Disposition');
    const match = disposition?.match(/filename="?([^"]+)"?/);
    if (match){
      return match[1];
    }
    return 'document.xlsx';
  }

  downloadFromBlob(blob:Blob, fileName:string){
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    a.download = fileName;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /** Project Files */
  getFilesByBranchId(branchId:number){
    return this.branchService.getFilesByBranchId(branchId).pipe(
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;})
    );
  }

  // TODO. File Categories will be moved to it's own Store
  getFilesCategories(){
    return this.branchService.getFileCategories().subscribe({
      next: (data: FileCategoryDto[]) => this.fileCategoryList.set(data),
      error: (err: HttpErrorResponse) => this.responseError(err),
    });
  }

  saveFileCategory(fileCategoryDto: FileCategoryDto){
    return this.branchService.saveFileCategory(fileCategoryDto).pipe(
      tap(updated => this.fileCategoryList.update(curr =>
        [...curr, updated])),
      tap(() => this.messageService.success('Category saved successfully.')),
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;})
    );
  }

  updateFileCategory(categoryId:number, fileCategoryDto: FileCategoryDto){
    return this.branchService.updateFileCategory(categoryId, fileCategoryDto).pipe(
      tap(updated => this.fileCategoryList.update(curr =>
        curr.map(category => category.id === updated.id ? updated : category ))),
      tap(() => this.messageService.success('Category updated successfully.')),
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;})
    );
  }

  uploadFileList(currentBranchId: number, categoryId: number){
    const category = {
      categoryId: categoryId
    }
    const categoryBlob = new Blob([JSON.stringify(category)],{type: 'application/json'});
    this.fileUploadList().forEach(file => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('data', categoryBlob)
      this.branchService.addFile(currentBranchId,formData).subscribe({
        next: (file => this.projectFiles.update(curr => [...curr, file])),
        error: (err: HttpErrorResponse) => this.responseError(err),
        complete: () => this.messageService.success('File uploaded successfully. ' + file.name)
      })
    })
  };

  responseError(error: HttpErrorResponse) {
    this.notification.error(
      'Request Failed',
      error?.error?.message || error?.message,
      {nzDuration: 0}
    )
  }
}
