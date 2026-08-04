import {Component} from '@angular/core';
import {NzUploadComponent} from "ng-zorro-antd/upload";
import {NzIconModule} from 'ng-zorro-antd/icon';
import {AbstractUploadComponent} from '../../services/abstract-upload-component.directive';

@Component({
  selector: 'app-upload-button-component',
  imports: [
    NzUploadComponent,
    NzIconModule
  ],
  templateUrl: './upload-button-component.html',
  styleUrl: './upload-button-component.css',
})
export class UploadButtonComponent extends AbstractUploadComponent{
}
