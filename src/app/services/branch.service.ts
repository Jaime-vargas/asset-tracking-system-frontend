import {inject, Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {Observable} from 'rxjs';
import {BranchTableDto} from '../interfaces/branch-table.dto';
import {FileEntityDto} from '../interfaces/fileEntityDto';
import {FileCategoryDto} from '../interfaces/file-category.dto';

@Injectable({providedIn: 'root'})
export class BranchService {

  private api = inject(ApiUrlBaseService);

  getBranches(clientId:number):Observable<BranchTableDto[]>{
    return this.api.get(`clients/${clientId}/branches`);
  }

  addBranch(clientId:number, branch: any):Observable<BranchTableDto>{
    return this.api.post(`clients/${clientId}/branches`, branch);
  }

  editBranch(branchid: number, branch: any):Observable<BranchTableDto>{
    return this.api.put(`branches/${branchid}`, branch);
  }

  /** Import/export endpoints */
  getImportTemplate(){
    return this.api.getMultipartXLS(`branches/import-template`);
  }

  exportCamerasToXLS(branchId: number){
    return this.api.getMultipartXLS(`branches/${branchId}/export-cameras`)
  }

  getImportCamerasUrl(branchId: number){
    return `${this.api.baseUrl}/branches/${branchId}/import-cameras`;
  }

  /** Project files */
  getFilesByBranchId(branchId:number):Observable<FileEntityDto[]>{
    return this.api.get(`branches/${branchId}/files`) ;
  }

  addFile(branchId: number, fileRequest: FormData ):Observable<FileEntityDto>{
    return this.api.post(`branches/${branchId}/files`, fileRequest);
  }

  getFileCategories():Observable<FileCategoryDto[]>{
    return this.api.get(`file-categories`);
  }

  saveFileCategory(fileCategory: FileCategoryDto):Observable<FileCategoryDto>{
    return this.api.post(`file-categories`, fileCategory);
  }

  updateFileCategory(categoryId: number, fileCategory: FileCategoryDto):Observable<FileCategoryDto>{
    return this.api.put(`file-categories/${categoryId}`, fileCategory);
  }

}
