import {inject, Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {DocumentDto, DocumentRequestDto} from '../interfaces/document.dto';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class DocumentService {
  private api = inject(ApiUrlBaseService);

  getDocuments(clientId: number): Observable<DocumentDto[]> {
    return this.api.get(`clients/${clientId}/documents`);
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

  downloadDocument(clientId: number, documentId: number) {
    return this.api.getMultipartXLS(`clients/${clientId}/documents/${documentId}/download`);
  }
}
