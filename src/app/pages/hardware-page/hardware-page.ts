import { Component } from '@angular/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-hardware-page',
  imports: [
    NzDividerComponent,
    NzTypographyComponent,
    DasboardBoxComponent,
    NzButtonComponent,
    NzIconDirective,
    NzFlexDirective,
    NgOptimizedImage
  ],
  templateUrl: './hardware-page.html',
  styleUrl: './hardware-page.css',
})
export class HardwarePage {

  defaultCameraImage:string = '/defaultCamera.webp';
}
