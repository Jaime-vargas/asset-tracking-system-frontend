import {inject, Injectable, signal} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {CommentService} from '../services/comment.service';
import {CommentRequestDTO} from '../interfaces/comment-request.dto';
import {catchError, EMPTY, tap} from 'rxjs';
import {CommentDto} from '../interfaces/comment.dto';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class CommentStore{

  private commentService = inject(CommentService);
  private messageService = inject(NzMessageService);
  private notificationService = inject(NzNotificationService);

  commentSavedTrigger = signal<CommentDto|null>(null);

  saveComment(reportId:number, comment: CommentRequestDTO){
    return this.commentService.postComment(reportId, comment).pipe(
      tap(comment => this.commentSavedTrigger.set(comment)),
      tap(()=> this.messageService.success('Comment saved successfully.')),
      catchError((error: HttpErrorResponse) => {
        this.responseError(error);
        return EMPTY;
      })
    );
  }

  responseError(error: HttpErrorResponse) {
    this.notificationService.error(
      'Request Failed',
      error?.error?.message,
      {nzDuration: 0}
    )
  }
}
