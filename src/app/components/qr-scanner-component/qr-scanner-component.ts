import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {BrowserMultiFormatReader} from '@zxing/browser';

@Component({
  selector: 'app-qr-scanner-component',
  imports: [],
  templateUrl: './qr-scanner-component.html',
  styleUrl: './qr-scanner-component.css',
})

export class QrScannerComponent implements AfterViewInit {

  @ViewChild('video', { static: true })
  video!: ElementRef<HTMLVideoElement>;

  qrResult = signal<string>('');
  devices = signal('devices');

  private codeReader = new BrowserMultiFormatReader();

  async ngAfterViewInit(): Promise<void> {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    });

    this.video.nativeElement.srcObject = stream;
    this.video.nativeElement.play();

    try {
      const result =
        await this.codeReader.decodeFromVideoDevice(
          undefined,
          this.video.nativeElement,
          (result, error) => {

            if (result) {

              this.qrResult.set(result.getText());

              console.log(result.getText());

            }

          }
        );

    } catch (error) {
      console.error('Error al escanear', error);
    }
  }

}
