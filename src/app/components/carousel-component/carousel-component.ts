import {Component, ElementRef, input, output, Output, ViewChild} from '@angular/core';
import {NzFlexDirective} from "ng-zorro-antd/flex";
import {NzImageDirective, NzImageGroupComponent} from "ng-zorro-antd/image";
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {FileEntityDto} from '../../interfaces/fileEntityDto';
import {NzPopconfirmDirective} from 'ng-zorro-antd/popconfirm';

@Component({
  selector: 'app-carousel-component',
  imports: [
    NzFlexDirective,
    NzImageGroupComponent,
    NzImageDirective,
    NzButtonComponent,
    NzIconDirective,
    NzPopconfirmDirective
  ],
  templateUrl: './carousel-component.html',
  styleUrl: './carousel-component.css',
})
export class CarouselComponent {

  images = input.required<FileEntityDto[]>();
  showDeleteButton = input<boolean>(false);
  imageSize = 180;

  // Outputs
  deleteEvent = output<number>();

  defaultImgPlaceholder: string = '/defaultImgPlaceholder.png';

  // ANIMATION FUNCTIONS
  @ViewChild('carousel') carousel!: ElementRef;
  scrollLeft() {
    this.carousel.nativeElement.scrollBy({
      left: -this.imageSize,
      behavior: 'smooth'
    });
  }
  scrollRight() {
    this.carousel.nativeElement.scrollBy({
      left: this.imageSize,
      behavior: 'smooth'
    });
  }

  protected readonly console = console;
}
