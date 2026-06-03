import {Component, EventEmitter, inject, output, signal} from '@angular/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {form} from '@angular/forms/signals';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {ClientTableDto} from '../../../interfaces/client-table.dto';
import {withI18nSupport} from '@angular/platform-browser';
import {ApiUrlBaseService} from '../../../services/api-url-base.service';
import { NzImageModule } from 'ng-zorro-antd/image';

@Component({
  selector: 'app-client-form',
  imports: [
    NzDividerComponent,
    NzFlexDirective,
    NzButtonComponent,
    NzIconDirective,
    NzFormDirective,
    ReactiveFormsModule,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzInputDirective,
    NzImageModule
  ],
  templateUrl: './client-form.html',
  styleUrl: './client-form.css',
})
export class ClientForm {
  constructor(protected apiUrlBaseService: ApiUrlBaseService) {}

  private fb = inject(FormBuilder);
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
  });

  image = signal<string>('')

  cancel = output<void>();

  onEdit(client: ClientTableDto){
    if(client.photo.filePath){
      this.image.set(this.apiUrlBaseService.imageBaseUrl + client.photo.filePath);
    }
    this.form.patchValue({
      name: client.name,
      }
    )
  }
  onCancel() {
    this.image.set('')
    this.form.reset();
    this.cancel.emit();
  }

}
