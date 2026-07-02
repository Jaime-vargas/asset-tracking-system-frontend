import {Component, input, output, inject, signal} from '@angular/core';
import {NzModalModule, NzModalService,} from 'ng-zorro-antd/modal';
import {NzUploadChangeParam, NzUploadComponent} from 'ng-zorro-antd/upload';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzImageDirective} from 'ng-zorro-antd/image';

import {NzMessageService} from 'ng-zorro-antd/message';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {AbstractUploadComponent} from '../../services/abstract-upload-component.directive';

@Component({
  selector: 'app-upload-drag-and-drop-component',
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

export class UploadComponent extends AbstractUploadComponent{
  currentPhoto = input.required<string | null>();
  fallbackImage = input.required<string>();
  isDisabled = input<boolean>(false);
}
