import {Component, computed, inject, input, OnDestroy, OnInit, output, signal} from '@angular/core';
import {NzUploadChangeParam, NzUploadComponent} from "ng-zorro-antd/upload";
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {Subscription} from 'rxjs';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {AbstractUploadComponent} from '../../services/abstract-upload-component.directive';

@Component({
  selector: 'app-upload-button-component',
  imports: [
    NzUploadComponent,
    NzButtonComponent,
    NzIconModule
  ],
  templateUrl: './upload-button-component.html',
  styleUrl: './upload-button-component.css',
})
export class UploadButtonComponent extends AbstractUploadComponent{
}
