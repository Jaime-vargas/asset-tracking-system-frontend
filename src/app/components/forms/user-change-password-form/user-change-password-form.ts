import {Component, inject, output, signal} from '@angular/core';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {UserPasswordUpdateRequestDto} from '../../../interfaces/users/user-password-update-request.dto';
import {UsersStore} from '../../../store/users.store';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective} from 'ng-zorro-antd/input';

@Component({
  selector: 'app-user-change-password-form',
  imports: [
    FormsModule,
    NzButtonComponent,
    NzColDirective,
    NzDividerComponent,
    NzFlexDirective,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzIconDirective,
    NzInputDirective,
    NzRowDirective,
    ReactiveFormsModule
  ],
  templateUrl: './user-change-password-form.html',
  styleUrl: './user-change-password-form.css',
})
export class UserChangePasswordForm {
  private formBuilder = inject(NonNullableFormBuilder);
  private usersStore = inject(UsersStore);

  saveButtonLoading = signal<boolean>(false)

  close = output();

  passwordChangeForm = this.formBuilder.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.pattern("(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}")]],
  })

  submitForm(){
    if(this.passwordChangeForm.invalid) return;
    this.saveButtonLoading.set(true);
    const newPasswordReq:UserPasswordUpdateRequestDto = this.passwordChangeForm.getRawValue();
    this.usersStore.updateUsersPassword(newPasswordReq).subscribe({
      next: () => this.onClose(),
      complete: ()=> this.saveButtonLoading.set(false)
    })
  }

  onClose(){
    this.passwordChangeForm.reset();
    this.close.emit();
  }
}
