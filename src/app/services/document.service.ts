import {inject, Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {DocumentDto, DocumentRequestDto, DocumentVersionDto, DocumentVersionRequestDto} from '../interfaces/document.dto';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class DocumentService {
  private api = inject(ApiUrlBaseService);

  getDocuments(clientId: number, projectId: number | null = null): Observable<DocumentDto[]> {
    return this.api.get(`clients/${clientId}/documents${projectId === null ? "" : "?projectId=" + projectId}`);
  }

  uploadDocument(clientId: number, file: File, request: DocumentRequestDto): Observable<DocumentDto> {
    const body = new FormData();
    body.append('file', file);
    body.append('data', new Blob([JSON.stringify(request)], {type: 'application/json'}));
    return this.api.post(`clients/${clientId}/documents`, body);
  }

  updateDocument(clientId: number, documentId: number, request: DocumentRequestDto): Observable<DocumentDto> {
    return this.api.put(`clients/${clientId}/documents/${documentId}`, request);
  }

  deleteDocument(clientId: number, document: DocumentDto, allVersions: boolean): Observable<DocumentDto | null> {
    return this.api.delete(`clients/${clientId}/documents/${document.id}?allVersions=${allVersions}&expectedVersion=${document.currentVersion}`);
  }

  getVersions(clientId: number, documentId: number): Observable<DocumentVersionDto[]> {
    return this.api.get(`clients/${clientId}/documents/${documentId}/versions`);
  }

  uploadVersion(clientId: number, documentId: number, file: File, request: DocumentVersionRequestDto): Observable<DocumentDto> {
    const body = new FormData();
    body.append('file', file);
    body.append('data', new Blob([JSON.stringify(request)], {type: 'application/json'}));
    return this.api.post(`clients/${clientId}/documents/${documentId}/versions`, body);
  }

  downloadVersion(clientId: number, documentId: number, version: number) {
    return this.api.getMultipartXLS(`clients/${clientId}/documents/${documentId}/versions/${version}/download`);
  }

  downloadDocument(clientId: number, documentId: number) {
    return this.api.getMultipartXLS(`clients/${clientId}/documents/${documentId}/download`);
  }
}
