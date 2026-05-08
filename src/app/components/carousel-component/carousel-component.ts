import {Component, ElementRef, input, ViewChild} from '@angular/core';
import {NzFlexDirective} from "ng-zorro-antd/flex";
import {NzImageDirective, NzImageGroupComponent} from "ng-zorro-antd/image";
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {PhotoDto} from '../../interfaces/photo.dto';

@Component({
  selector: 'app-carousel-component',
  imports: [
    NzFlexDirective,
    NzImageGroupComponent,
    NzImageDirective,
    NzButtonComponent,
    NzIconDirective
  ],
  templateUrl: './carousel-component.html',
  styleUrl: './carousel-component.css',
})
export class CarouselComponent {
  images = input.required<PhotoDto[]>();
  imageSize = 180;

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
}
