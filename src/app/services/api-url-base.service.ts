import {HttpClient, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiUrlBaseService {

  baseUrl = '/api/v1';
  imageBaseUrl = '/';
  //baseUrl = 'http://localhost:3000/api/v1';
  //imageBaseUrl = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  // TODO. Fix base url for multipart
  getMultipart<T>(endpoint: string): Observable<Blob> {
    return this.http.get(`${this.imageBaseUrl}${endpoint}`,
      {
        responseType: 'blob'
      });
  }

  getMultipartXLS (endpoint: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/${endpoint}`,{
      responseType: 'blob',
      observe: 'response'
    });
  }

  get<T>(endpoint: string) {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`);
  }

  post<T>(endpoint: string, body: any) {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  put<T>(endpoint: string, body: any | null) {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  delete<T>(endpoint: string) {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }

}
