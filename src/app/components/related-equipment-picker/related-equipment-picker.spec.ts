import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NzSelectComponent } from 'ng-zorro-antd/select';
import { HardwareTableDto } from '../../interfaces/hardware/hardware-table.dto';
import { MultiSelectDone } from '../multi-select-done/multi-select-done';
import { RelatedEquipmentPicker } from './related-equipment-picker';

describe('RelatedEquipmentPicker', () => {
  it('combines type and site and adds all matches without dropping other selections', async () => {
    await TestBed.configureTestingModule({ imports: [RelatedEquipmentPicker] }).compileComponents();
    const fixture = TestBed.createComponent(RelatedEquipmentPicker);
    const rows = [
      { id: 1, name: 'Camera 1', type: 'Camera', tagId: 10, tagName: 'Colima' },
      { id: 2, name: 'Camera 2', type: 'Camera', tagId: 20, tagName: 'Tecoman' },
      { id: 3, name: 'Server', type: 'Computer', tagId: 10, tagName: 'Colima' },
    ] as HardwareTableDto[];
    fixture.componentRef.setInput('equipment', rows);
    fixture.componentRef.setInput('selectedIds', [2]);
    fixture.detectChanges();

    const [type, site] = fixture.debugElement.queryAll(By.directive(NzSelectComponent));
    type.triggerEventHandler('ngModelChange', 'Camera');
    site.triggerEventHandler('ngModelChange', 10);
    fixture.detectChanges();

    const picker = fixture.debugElement.query(By.directive(MultiSelectDone)).componentInstance as MultiSelectDone;
    expect(picker.options().filter(option => !option.hidden).map(option => option.id)).toEqual([1]);
    const button = fixture.nativeElement.querySelector('.selection-tools button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual([2, 1]);
    expect(button.disabled).toBe(true);
  });
});
