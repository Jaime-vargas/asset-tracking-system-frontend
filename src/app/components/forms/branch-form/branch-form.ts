import {Component, computed, effect, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {BranchService} from '../../../services/branch.service';
import {SidebarStore} from '../../../store/sidebar.store';
import {BranchStore} from '../../../store/branch.store';
import {BranchTableDto} from '../../../interfaces/branch-table.dto';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective} from 'ng-zorro-antd/input';

@Component({
  selector: 'app-branch-form',
  imports: [
    NzButtonComponent,
    NzDividerComponent,
    NzFlexDirective,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzIconDirective,
    NzInputDirective,
    ReactiveFormsModule,
  ],
  templateUrl: './branch-form.html',
  styleUrl: './branch-form.css',
})
export class BranchForm implements OnInit {

  private branchStore = inject(BranchStore);
  private formBuilder = inject(FormBuilder);
  private sidebarStore = inject(SidebarStore);

  currentClientId = this.branchStore.currentClientId;
  formMode = this.branchStore.formMode;
  selectedBranch = this.branchStore.selectedBranch;

  // Computed variables
  formTitle = computed(() =>
    this.formMode() === "add" ? "New Branch" : "Update Branch"
  )

  ngOnInit() {
    const branch = this.selectedBranch();
    if (branch === null) return;
    this.fillFieldsFromEntity(branch)
  }

  // Form
  protected branchForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
  })

  fillFieldsFromEntity(branch: BranchTableDto) {
    this.branchForm.patchValue({
      name: branch.name,
    })
  }

  submitForm() {
    if (this.branchForm.invalid) return;
    const branch = this.branchForm.getRawValue(); /* FIX-create BranchRequestDTO */
    switch (this.formMode()) {
      case 'add':
        this.addRequest(branch);
        break;
      case 'edit':
        this.editRequest(branch);
        break;
    }
  }

  addRequest(branch: any){
    const clientId = this.currentClientId();
    if (clientId === null) return;
    this.branchStore.addBranch(clientId, branch);
    this.onClose()
  }

  editRequest(branch: any){
    const selectedBranch = this.selectedBranch();
    if (selectedBranch === null) return;
    this.branchStore.editBranch(selectedBranch.id, branch);
    this.onClose()
  }

  onClose() {
    this.branchForm.reset();
    this.selectedBranch.set(null);
    this.sidebarStore.isOpen.set(false);
  }
}
