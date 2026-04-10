import {Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {Observable} from 'rxjs';
import {CommentRequestDTO} from '../interfaces/comment-request.dto';

@Injectable({providedIn: 'root'})
export class CommentService {

  constructor(private api: ApiUrlBaseService) {
  }

  postComment(reportID:number, comment: CommentRequestDTO) :Observable<CommentRequestDTO>{
    return this.api.post(`reports/${reportID}/comments`, comment);
  }

}
