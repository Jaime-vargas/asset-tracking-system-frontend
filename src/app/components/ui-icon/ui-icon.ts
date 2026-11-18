import { Component, input } from '@angular/core';
@Component({
  selector: 'app-ui-icon', template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
@switch (name()) {
@case ('search') { <circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/> }
@case ('refresh') { <path d="M20 7v5h-5M4 17v-5h5M5.5 8a7 7 0 0 1 12-3L20 8M4 16l2.5 3a7 7 0 0 0 12-3"/> }
@case ('arrow') { <path d="M5 12h14m-6-6 6 6-6 6"/> }
@case ('report') { <path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6"/> }
@case ('grid') { <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/> }
@case ('camera') { <rect x="3" y="6" width="12" height="12" rx="2"/><path d="m15 10 6-3v10l-6-3z"/> }
@case ('site') { <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/> }
@case ('client') { <path d="M4 21V7l8-4v18M12 9h8v12M2 21h20M7 8v2M7 13v2M16 12v2M16 17v2"/> }
@default { <rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/> }
}
</svg>`, styles: `:host{display:inline-flex;align-items:center;flex-shrink:0}svg{width:18px;height:18px}`
})
export class UiIcon {
  name = input('device');
}
