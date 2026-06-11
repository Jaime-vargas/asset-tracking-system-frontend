import {Component, computed, input, OnDestroy, OnInit, output} from '@angular/core';
import {NzUploadChangeParam, NzUploadComponent} from "ng-zorro-antd/upload";
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {UploadService} from '../../services/upload.service';
import {Subscription} from 'rxjs';
import {NzIconModule} from 'ng-zorro-antd/icon';

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
export class UploadButtonComponent implements OnInit, OnDestroy{
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

  url = input.required<string>();

  uploadSuccess = output<void>();

  uploadUrl(){
    return this.uploadService.setEndpoint(this.url());
  }

  onUploadChange(event: NzUploadChangeParam): void {
    this.uploadService.onUploadChange(event);
  }

}
