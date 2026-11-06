import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { CloudUploadOutline } from '@ant-design/icons-angular/icons';
import { DocumentFilePicker } from './document-file-picker';

describe('Document file selection',()=>{
  beforeEach(async()=>{await TestBed.configureTestingModule({imports:[DocumentFilePicker],providers:[provideNzIcons([CloudUploadOutline])]}).compileComponents();});
  function picker(){const fixture=TestBed.createComponent(DocumentFilePicker);fixture.detectChanges();return fixture;}
  it('accepts a single dropped file and prevents browser navigation',()=>{
    const fixture=picker();const changed=vi.fn();fixture.componentInstance.fileChange.subscribe(changed);
    const file=new File(['PDF'],'plan.pdf');const event=new Event('drop',{bubbles:true,cancelable:true});
    Object.defineProperty(event,'dataTransfer',{value:{files:[file]}});
    fixture.nativeElement.querySelector('.file-drop-zone').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);expect(changed).toHaveBeenCalledWith(file);
  });
  it('keeps the choose-file button and accepts a file from the input',()=>{
    const fixture=picker();const changed=vi.fn();fixture.componentInstance.fileChange.subscribe(changed);
    const input=fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const click=vi.spyOn(input,'click').mockImplementation(()=>{});
    fixture.nativeElement.querySelector('button').click();expect(click).toHaveBeenCalledOnce();
    const file=new File(['PDF'],'plan.pdf');Object.defineProperty(input,'files',{value:[file]});
    input.dispatchEvent(new Event('change'));expect(changed).toHaveBeenCalledWith(file);
  });
  it('requires the configured extension for dropped files', () => {
    const fixture = picker();
    fixture.componentRef.setInput('extension', '.xlsx');
    fixture.detectChanges();
    const changed = vi.fn();
    fixture.componentInstance.fileChange.subscribe(changed);
    const zone = fixture.nativeElement.querySelector('.file-drop-zone');
    for (const name of ['plan.pdf', 'cameras.XLSX']) {
      const event = new Event('drop', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'dataTransfer', { value: { files: [new File(['data'], name)] } });
      zone.dispatchEvent(event);
    }
    expect(changed).toHaveBeenNthCalledWith(1, null);
    expect(changed).toHaveBeenNthCalledWith(2, expect.objectContaining({ name: 'cameras.XLSX' }));
  });

  it('rejects multiple files and ignores drops while saving',()=>{
    const fixture=picker();const changed=vi.fn();fixture.componentInstance.fileChange.subscribe(changed);
    const files=[new File(['a'],'a.pdf'),new File(['b'],'b.pdf')];
    const event=new Event('drop',{bubbles:true,cancelable:true});Object.defineProperty(event,'dataTransfer',{value:{files}});
    fixture.nativeElement.querySelector('.file-drop-zone').dispatchEvent(event);fixture.detectChanges();
    expect(changed).not.toHaveBeenCalled();expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('one file');
    fixture.componentRef.setInput('disabled',true);fixture.detectChanges();
    const blocked=new Event('drop',{bubbles:true,cancelable:true});Object.defineProperty(blocked,'dataTransfer',{value:{files:[files[0]]}});
    fixture.nativeElement.querySelector('.file-drop-zone').dispatchEvent(blocked);expect(changed).not.toHaveBeenCalled();
  });
});
