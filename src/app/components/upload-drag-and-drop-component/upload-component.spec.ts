import { provideNzIcons } from 'ng-zorro-antd/icon';
import { InboxOutline } from '@ant-design/icons-angular/icons';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadComponent } from './upload-component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';

describe('Photo upload preview', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        provideHttpClient(),
        provideNzIcons([InboxOutline]),
        {provide: NzMessageService, useValue: {success: vi.fn()}},
        {provide: NzNotificationService, useValue: {error: vi.fn()}},
        {provide: NzModalService, useValue: {confirm: vi.fn()}},
      ],
    }).compileComponents();
  });

  it('renders an existing photo without an image provider from its parent page', async () => {
    const fixture = TestBed.createComponent(UploadComponent);
    fixture.componentRef.setInput('uploadUrl', '/photos');
    fixture.componentRef.setInput('currentPhoto', '/uploads/camera-first.jpg');
    await fixture.whenStable();
    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image).not.toBeNull();
    expect(image.getAttribute('src')).toBe('/uploads/camera-first.jpg');
    fixture.componentRef.setInput('currentPhoto', '/uploads/camera-replacement.jpg');
    await fixture.whenStable();
    expect(image.getAttribute('src')).toBe('/uploads/camera-replacement.jpg');
  });

  it('switches from file selection to photo preview after uploading', async () => {
    const fixture = TestBed.createComponent(UploadComponent);
    fixture.componentRef.setInput('uploadUrl', '/photos');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('nz-upload')).not.toBeNull();
    fixture.componentRef.setInput('currentPhoto', '/uploads/new-camera.jpg');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('nz-upload')).toBeNull();
    expect(fixture.nativeElement.querySelector('img')?.getAttribute('src')).toBe('/uploads/new-camera.jpg');
  });
});
