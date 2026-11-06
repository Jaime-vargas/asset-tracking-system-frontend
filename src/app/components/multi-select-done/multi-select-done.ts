import { Component, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-multi-select-done',
  imports: [FormsModule, NzButtonModule, NzSelectModule],
  template: `
    <nz-select nzMode="multiple" nzShowSearch [nzPlaceHolder]="label()"
      [nzMaxTagCount]="3" [nzLoading]="loading()" [nzDisabled]="disabled()"
      [nzOpen]="open()" (nzOpenChange)="open.set($event)"
      [nzDropdownRender]="footer" [ngModel]="value()" (ngModelChange)="value.set($event)">
      @for (option of options(); track option.id) {
        <nz-option [nzValue]="option.id" [nzLabel]="option.name" [nzHide]="option.hidden ?? false" />
      }
    </nz-select>
    <ng-template #footer>
      <div class="footer">
        <button nz-button nzType="primary" type="button" (click)="open.set(false)">Done</button>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    nz-select { width: 100%; }
    .footer { display: flex; justify-content: flex-end; padding: 8px; }
  `],
})
export class MultiSelectDone {
  options = input.required<readonly { id: number; name: string; hidden?: boolean }[]>();
  label = input.required<string>();
  loading = input(false);
  disabled = input(false);
  value = model<number[]>([]);
  protected open = signal(false);
}
