import {inject, Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {Observable} from 'rxjs';
import {CommentRequestDTO} from '../interfaces/comment-request.dto';
import {CommentDto} from '../interfaces/comment.dto';

@Injectable({providedIn: 'root'})
export class CommentService {

  private api = inject(ApiUrlBaseService);

  postComment(reportID:number, comment: CommentRequestDTO) :Observable<CommentDto>{
    return this.api.post(`reports/${reportID}/comments`, comment);
  }
}
