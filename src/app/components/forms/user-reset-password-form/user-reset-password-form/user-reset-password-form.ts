import {Component, computed, inject, OnInit, output, signal} from '@angular/core';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {UsersStore} from '../../../../store/users.store';

@Component({
  selector: 'app-user-reset-password-form',
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
  templateUrl: './user-reset-password-form.html',
  styleUrl: './user-reset-password-form.css',
})
export class UserResetPasswordForm implements OnInit {
  private formBuilder = inject(NonNullableFormBuilder);
  private usersStore = inject(UsersStore);

  selectedUser = this.usersStore.selectedUser;

  formTitle = signal<string>('')
  saveButtonLoading = signal<boolean>(false)

  close = output();

  userId!:number;

  ngOnInit(): void {
    const selectedUser = this.usersStore.selectedUser();
    if (selectedUser === null) return;
    this.userId = selectedUser.id
    const fullName = selectedUser.fullName;

    this.formTitle.set('Reset Password to: ' + fullName);
  }

  passwordResetForm = this.formBuilder.group({
    newPassword: ['', [Validators.required, Validators.pattern("(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}")]],
  })

  submitForm(){
    if (this.passwordResetForm.invalid) return;
    const resetPassword = this.passwordResetForm.getRawValue();
    this.saveButtonLoading.set(true);
    this.usersStore.resetUserPassword(this.userId, resetPassword).subscribe({
      next: () => this.onClose(),
      complete: () => this.saveButtonLoading.set(false)
    });
  }

  onClose(){
    this.passwordResetForm.reset();
    this.selectedUser.set(null);
    this.close.emit();
  }

}
