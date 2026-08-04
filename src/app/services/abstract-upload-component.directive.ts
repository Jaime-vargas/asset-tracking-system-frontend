import {Directive, inject, input, output, signal} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {NzUploadChangeParam} from 'ng-zorro-antd/upload';

@Directive()
export abstract class AbstractUploadComponent {

  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private notification = inject(NzNotificationService);

  public uploadUrl = input.required<string>();
  public multipleFiles = input<boolean>(false);
  public acceptedFiles = input<string | undefined>(undefined);

  uploadSuccess = output<any>();
  manualUpload = output<any>();

  // In this variable the file in case of error will be saved
  private failedFile = signal<File | undefined>(undefined);

  onUploadChange(event: NzUploadChangeParam): void {
    let {file} = event;
    if(file.status === "done") {
      this.message.success("Updated successfully.");
      const response = file.response;
      this.uploadSuccess.emit(response);
    }
    if (file.status === "error") {
      const errorResponse = file.error;
      const errorMessage: string = errorResponse?.error?.message ? errorResponse?.error?.message : errorResponse?.error;
      console.error(errorResponse);
      // Message was set manually
      if (errorMessage.includes('FileAlreadyExists')) {
        this.failedFile.set(file.originFileObj);
        this.showReplaceModal()
      }else{
        this.showNotificationError(errorMessage + " File name: " + file.name);
      }
    }
  }

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

  replaceSubmit():void{
    const file = this.failedFile();
    if(!file) return;
    const formData = new FormData();
    formData.append('file', file as any);
    this.manualUpload.emit(formData);
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
