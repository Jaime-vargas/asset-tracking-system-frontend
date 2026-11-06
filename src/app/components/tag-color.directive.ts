import { Directive, computed, input } from '@angular/core';
import { tagColor } from '../interfaces/tag-color';

@Directive({
  selector: '[appTagColor]',
  host: {
    '[style.background-color]': 'palette().background',
    '[style.color]': 'palette().text',
    '[style.border-color]': 'palette().border',
  },
})
export class TagColorDirective {
  appTagColor = input<string | null | undefined>('PURPLE');
  protected palette = computed(() => tagColor(this.appTagColor()));
}
