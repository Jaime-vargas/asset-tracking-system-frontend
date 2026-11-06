import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { TagColorPicker } from './tag-color-picker';

describe('Preset tag colors', () => {
  it('offers only preset colors and emits the selected color', () => {
    const fixture = TestBed.createComponent(TagColorPicker);
    fixture.componentRef.setInput('color', 'PURPLE');
    fixture.detectChanges();
    const selected: string[] = [];
    fixture.componentInstance.colorChange.subscribe((value) => selected.push(value));
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(8);
    fixture.nativeElement.querySelector('button[aria-label="Blue"]').click();
    expect(selected).toEqual(['BLUE']);
    fixture.componentRef.setInput('color', 'BLUE');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Blue"]').getAttribute('aria-pressed'),
    ).toBe('true');
  });
});
