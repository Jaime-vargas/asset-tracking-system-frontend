import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { HardwareTransfer } from './hardware-transfer';
import { HardwareService } from '../../services/hardware.service';
import { HardwareStore } from '../../store/hardware.store';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { ExportOutline, ImportOutline, DownloadOutline, CloudUploadOutline } from '@ant-design/icons-angular/icons';
import { ImportTemplate } from '../../interfaces/importResponse.type';

describe('Client hardware transfers', () => {
  let api: {exportClientHardware: ReturnType<typeof vi.fn>; getClientImportTemplate: ReturnType<typeof vi.fn>; importClientCameras: ReturnType<typeof vi.fn>};
  const download = vi.fn();
  beforeEach(async () => {
    download.mockReset();
    api = {exportClientHardware: vi.fn().mockReturnValue(of(new HttpResponse({body: new Blob(['export'])}))), getClientImportTemplate: vi.fn(), importClientCameras: vi.fn()};
    await TestBed.configureTestingModule({imports:[HardwareTransfer],providers:[
      provideNzIcons([ExportOutline, ImportOutline, DownloadOutline, CloudUploadOutline]),
      {provide:HardwareService,useValue:api},
      {provide:HardwareStore,useValue:{downloadFromBlob:download,getFileNameFromHeader:()=> 'cameras.xlsx'}},
      {provide:NzNotificationService,useValue:{error:vi.fn()}},
    ]}).compileComponents();
  });
  function createTransfer(){
    const fixture=TestBed.createComponent(HardwareTransfer);fixture.componentRef.setInput('clientId',9);fixture.componentRef.setInput('initialSiteId',11);fixture.detectChanges();return fixture;
  }
  it('exports the selected client site or all sites independently of table pagination',()=>{
    const fixture=createTransfer();const component=fixture.componentInstance;
    component.openExport('xls');component.exportHardware();
    expect(api.exportClientHardware).toHaveBeenCalledWith(9,'xls',11);
    expect(download).toHaveBeenCalledOnce();expect(component.exportOpen()).toBe(false);
    component.openExport('photo-report');component.exportSiteId.set(0);component.exportHardware();
    expect(api.exportClientHardware).toHaveBeenLastCalledWith(9,'photo-report',null);
  });
  it('requires a site and file, and blocks duplicate imports until the response arrives',()=>{
    const pending=new Subject<ImportTemplate>();api.importClientCameras.mockReturnValue(pending);
    const fixture=createTransfer();const component=fixture.componentInstance;const imported=vi.fn();component.imported.subscribe(imported);
    component.openImport();component.importCameras();expect(api.importClientCameras).not.toHaveBeenCalled();
    component.importSiteId.set(null);component.importFile.set(new File(['xlsx'],'cameras.xlsx'));component.importCameras();expect(api.importClientCameras).not.toHaveBeenCalled();
    component.importSiteId.set(12);component.importCameras();component.importCameras();
    expect(api.importClientCameras).toHaveBeenCalledOnce();expect(component.importOpen()).toBe(true);
    const result={processed:2,successful:1,errorsCount:1,errors:['Row 2: invalid data']};pending.next(result);pending.complete();
    expect(imported).toHaveBeenCalledWith(12);expect(component.result()).toEqual(result);expect(component.importOpen()).toBe(false);
  });
  it('preserves the selected export scope after an error',()=>{
    api.exportClientHardware.mockReturnValue(throwError(()=>({error:{message:'No cameras in this site'}})));
    const component=createTransfer().componentInstance;component.openExport('qr-codes');component.exportHardware();
    expect(component.exportOpen()).toBe(true);expect(component.exporting()).toBe(false);expect(component.exportSiteId()).toBe(11);expect(download).not.toHaveBeenCalled();
  });
  it('keeps the imported file and site when the request fails',()=>{
    api.importClientCameras.mockReturnValue(throwError(()=>({error:{message:'Please retry'}})));
    const component=createTransfer().componentInstance;component.openImport();const file=new File(['xlsx'],'cameras.xlsx');component.importFile.set(file);component.importCameras();
    expect(component.importOpen()).toBe(true);expect(component.importing()).toBe(false);expect(component.importFile()).toBe(file);expect(component.importSiteId()).toBe(11);
  });
});
