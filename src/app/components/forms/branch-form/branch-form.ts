import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
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
    DatePipe,
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

  private destroyRef = inject(DestroyRef);
  saving = signal(false);
  private branchStore = inject(BranchStore);
  private formBuilder = inject(FormBuilder);
  private sidebarStore = inject(SidebarStore);

  currentClientId = this.branchStore.currentClientId;
  formMode = this.branchStore.formMode;
  selectedBranch = this.branchStore.selectedBranch;

  // Computed variables
  formTitle = computed(() =>
    this.formMode() === "add" ? "New Project" : "Update Project"
  )

  ngOnInit() {
    const branch = this.selectedBranch();
    if (branch === null) return;
    this.fillFieldsFromEntity(branch);
  }

  // Form
  protected branchForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
  })

  fillFieldsFromEntity(branch: BranchTableDto) {
    this.branchForm.patchValue({
      name: branch.name,
    })
  }

  submitForm() {
    if (this.branchForm.invalid || this.saving()) return;
    const name = this.branchForm.controls.name.value.trim();
    if (name.length < 3) return;
    const clientId = this.currentClientId();
    const project = this.selectedBranch();
    if (this.formMode() === 'add' ? clientId === null : project === null) return;
    const request = this.formMode() === 'add'
      ? this.branchStore.addBranch(clientId!, { name })
      : this.branchStore.editBranch(project!.id, { name });
    this.saving.set(true);
    request.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.saving.set(false)),
    ).subscribe(() => {
      this.saving.set(false);
      this.onClose();
    });
  }

  onClose() {
    if (this.saving()) return;
    this.branchForm.reset();
    this.selectedBranch.set(null);
    this.sidebarStore.isOpen.set(false);
  }
}
