import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {UsersStore} from '../../../store/users.store';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {UserEntityResponseDto} from '../../../interfaces/users/user-entity-response.dto';
import {SidebarStore} from '../../../store/sidebar.store';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {UserEntityUpdateRequestDto} from '../../../interfaces/users/user-entity-update-request.dto';
import {UserEntityRequestDto} from '../../../interfaces/users/user-entity-request.dto';

@Component({
  selector: 'app-user-form',
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
    ReactiveFormsModule,
    NzOptionComponent,
    NzSelectComponent
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm implements OnInit {

  private formBuilder = inject(NonNullableFormBuilder);
  private usersStore = inject(UsersStore);
  private sidebarStore = inject(SidebarStore);

  selectedUser = this.usersStore.selectedUser;
  usersRoleList = this.usersStore.usersRoleList;
  formMode = this.usersStore.formMode;
  saveButtonLoading = signal<boolean>(false);

  /** Formulary */
  protected newUserForm = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.pattern("(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}")]],
    fullName: ['', Validators.required],
    role: ['', Validators.required],
  })

  protected editUserForm = this.formBuilder.group({
    username: ['', Validators.required],
    fullName: ['', Validators.required],
    role: ['', Validators.required],
  })

  selectedUserForm = signal<FormGroup>(this.newUserForm);

  constructor() {
    effect(() => {
      this.usersRoleList();
      const user = this.selectedUser();
      if (user === null) return;
      this.selectedUserForm.set(this.editUserForm);
      this.fillFieldsFromEntity(user);
    });
  }

  ngOnInit(): void {
    this.usersStore.getUsersRoleList();
  }

  /** Computed */
  formTitle = computed(() =>
    this.formMode() === "add" ? "New User" : "Update User"
  )

  fillFieldsFromEntity(user: UserEntityResponseDto){
    const role = this.usersRoleList().find(role => role.label === user.role);
    this.editUserForm.patchValue({
      username: user.username,
      fullName: user.fullName,
      role: role?.name
    })
  }

  submitForm(){
    if(this.selectedUserForm().invalid) return;
    switch (this.formMode()) {
      case 'add':
        this.addRequest()
        break;
      case 'edit':
        this.editRequest()
      break;
    }
  }

  addRequest(){
    const newUser: UserEntityRequestDto = this.newUserForm.getRawValue();
    this.saveButtonLoading.set(true);
    this.usersStore.saveUser(newUser).subscribe({
      next: () => this.onClose(),
      complete: () => this.saveButtonLoading.set(false)
    });
  }

  editRequest(){
    const user: UserEntityUpdateRequestDto = this.editUserForm.getRawValue();
    const selectedUser = this.usersStore.selectedUser();
    if (selectedUser === null) return;
    this.saveButtonLoading.set(true);
    this.usersStore.updateUser(selectedUser.id, user).subscribe({
      next: () => { this.onClose()},
      complete: () => { this.saveButtonLoading.set(false) },
      }
    );
  }

  onClose(){
    this.editUserForm.reset();
    this.newUserForm.reset();
    this.selectedUser.set(null);
    this.sidebarStore.isOpen.set(false);
  }
}
