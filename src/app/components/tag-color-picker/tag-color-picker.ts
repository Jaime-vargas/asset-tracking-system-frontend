import { Component, input, output } from '@angular/core';
import { TAG_COLORS, TagColor, tagColor } from '../../interfaces/tag-color';
@Component({
  selector: 'app-tag-color-picker',
  template: `<div class="palette" role="group" aria-label="Tag color">
      @for (option of colors; track option.value) {
        <button
          type="button"
          [style.background-color]="option.solid"
          [class.selected]="color() === option.value"
          [attr.aria-pressed]="color() === option.value"
          [attr.aria-label]="option.label"
          [title]="option.label"
          (click)="colorChange.emit(option.value)"
        >
          @if (color() === option.value) {
            <span aria-hidden="true">✓</span>
          }
        </button>
      }
    </div>
    <p class="selection">{{ selectedColor().label }}</p>`,
  styles: `
    .palette {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      padding: 4px 0;
    }
    .palette button {
      display: grid;
      place-items: center;
      width: 27px;
      height: 27px;
      border: 2px solid white;
      border-radius: 50%;
      cursor: pointer;
      color: white;
      font-weight: 700;
    }
    .palette button.selected {
      outline: 2px solid var(--app-text);
      outline-offset: 2px;
    }
    .palette button:focus-visible {
      outline: 3px solid var(--app-accent);
      outline-offset: 3px;
    }
    .selection {
      font-size: 10px;
      color: var(--app-muted);
      margin: 7px 0 0;
    }
  `,
})
export class TagColorPicker {
  colors = TAG_COLORS;
  color = input<TagColor>('PURPLE');
  colorChange = output<TagColor>();
  selectedColor = () => tagColor(this.color());
}
