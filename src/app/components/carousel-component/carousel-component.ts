import { Component, input, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzPopconfirmDirective } from 'ng-zorro-antd/popconfirm';
import { FileEntityDto } from '../../interfaces/fileEntityDto';

@Component({
  selector: 'app-carousel-component',
  imports: [NzImageModule, NzButtonComponent, NzIconDirective, NzPopconfirmDirective],
  templateUrl: './carousel-component.html',
  styleUrl: './carousel-component.css',
})
export class CarouselComponent {
  images = input.required<Pick<FileEntityDto, 'id' | 'filename' | 'filePath'>[]>();
  showDeleteButton = input(false);
  deleteEvent = output<number>();
  protected readonly defaultImgPlaceholder = '/defaultImgPlaceholder.png';
}
