import {Component, computed, input, output, OnInit, OnDestroy} from '@angular/core';
import {NzModalComponent, NzModalModule, } from 'ng-zorro-antd/modal';
import {NzUploadChangeParam, NzUploadComponent} from 'ng-zorro-antd/upload';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzImageDirective} from 'ng-zorro-antd/image';
import {UploadService} from '../../services/upload.service';
import {Subscription} from 'rxjs';

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

export class UploadComponent implements OnInit, OnDestroy {

  constructor(
    private uploadService : UploadService
) {}

  private subscriptions: Subscription = new Subscription();
  // Subscribe for allowing knows if file was uploaded successfully
  ngOnInit() {
    this.subscriptions.add(
      this.uploadService.uploadSuccess$.subscribe(()=>{
        this.uploadSuccess.emit();
      })
    )
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  fallbackImage = input<string>("");
  url = input.required<string>();
  currentPhoto = input.required<string | undefined>();
  isDisabled = input.required<boolean>();

  uploadSuccess = output<void>();

  uploadUrl(){
    return this.uploadService.setEndpoint(this.url());
  }

  onUploadChange(event: NzUploadChangeParam): void {
    this.uploadService.onUploadChange(event);
  }
}
