import {Component, computed, input, output} from '@angular/core';
import {NzModalComponent, NzModalModule, } from 'ng-zorro-antd/modal';
import {NzUploadChangeParam, NzUploadComponent} from 'ng-zorro-antd/upload';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzImageDirective} from 'ng-zorro-antd/image';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {UploadService} from '../../services/upload.service';

@Component({
  selector: 'app-upload-component',
  imports: [
    NzModalModule,
    NzUploadComponent,
    NzFlexDirective,
    NzIconDirective,
    NzImageDirective
  ],
  standalone: true,
  templateUrl: './upload-component.html',
  styleUrl: './upload-component.css',
})

export class UploadComponent {

  constructor(
    private uploadService : UploadService
) {

  }

  url = input.required<string>();  // TEMP input.required<string>()
  currentPhoto = input.required<string | undefined>();
  isDisabled = input.required<boolean>();

  uploadSuccess = output<void>();

  uploadUrl (){
    return this.uploadService.uploadUrl(this.url());
  }

  onUploadChange(event: NzUploadChangeParam){
    if(this.uploadService.onUploadChange(event)){
      this.uploadSuccess.emit();
    }
  }
}
