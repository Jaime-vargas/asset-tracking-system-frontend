import { Component, computed, input } from '@angular/core';
import { tagColor } from '../../interfaces/tag-color';

@Component({
  selector: 'app-ui-tag, button[appUiTag]',
  template: '<ng-content />',
  styleUrl: './ui-tag.css',
  host: {
    '[style.background-color]': 'palette()?.background',
    '[style.color]': 'palette()?.text',
    '[style.border-color]': 'palette()?.border',
  },
})
export class UiTag {
  tone = input<string | null | undefined>();
  protected palette = computed(() => {
    const tone = this.tone();
    if (tone === 'ACCENT') {
      return { background: 'var(--app-accent-soft)', text: 'var(--app-accent)', border: 'var(--app-accent-border)' };
    }
    return tone ? tagColor(tone) : null;
  });
}
