import {Injectable, signal} from '@angular/core';
import {NzUploadChangeParam} from 'ng-zorro-antd/upload';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ApiUrlBaseService} from './api-url-base.service';
import {Subject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class UploadService {

  constructor(private apiUrlBaseService : ApiUrlBaseService,
              private message : NzMessageService,
              private modal: NzModalService,
              private notification : NzNotificationService) {
  }

  private endpoint:string = "";
  replaceExisting = signal<boolean>(false);

  // In this variable the file in case of error will be saved
  failedFile = signal<File | undefined>(undefined);

  private uploadSuccessSubject =
    new Subject<void>();
  uploadSuccess$ =
    this.uploadSuccessSubject.asObservable();

  setEndpoint(url: string){
    this.endpoint = url;
    return `${this.apiUrlBaseService.baseUrl}/${url}`;
  }

  // This function helps to monitoring status of uploaded files
  onUploadChange(event: NzUploadChangeParam):void{
    let {file} = event;
    if (file.status === "error") {
      const errorResponse = file.error;
      const errorMessage: string = errorResponse?.error?.message;
      // Message was set manually
      if (errorMessage.includes('FileAlreadyExists')) {
        this.failedFile.set(file.originFileObj);
        this.showReplaceModal()
      }else{
        this.showNotificationError(errorMessage);
      }
    }else if(file.status === "done") {
      this.message.success("File uploaded successfully: " + file.name);
      this.uploadSuccessSubject.next();
    }
  }

  replaceSubmit():void{
    this.replaceExisting.set(true);
    const file = this.failedFile();
    if(!file) return
    this.manualUpload(file)
  }

  manualUpload(file:File): void {
    const formData = new FormData();
    formData.append('file', file as any);
    this.apiUrlBaseService.post(`${this.endpoint}?replaceExisting=${this.replaceExisting()}`, formData).subscribe({  // CHECK
      next: () => {
        this.message.success('File replaced successfully');
        this.replaceExisting.set(false);
        this.failedFile.set(undefined);
        this.uploadSuccessSubject.next();
      },
      error: (err) => {
        this.replaceExisting.set(false);
        this.failedFile.set(undefined);
        this.notification.error(
          'Upload failed',
          err?.error.message,
          { nzDuration: 0 }
        );
      }
    });
  }

  // If a file exists this modal ask if replace
  showReplaceModal(): void {
    this.modal.confirm({
      nzTitle: 'A photo already exists!',
      nzContent: 'Are you sure you want to upload?',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOnOk: () => {this.replaceSubmit()},
      nzCancelText: 'Cancel',
      nzOnCancel: () => {}
    });
  }

  // error notification
  showNotificationError(errorMessage: string) {
    this.notification.error(
      'Upload failed',
      errorMessage,
      { nzDuration: 0}
    )
  }


}
