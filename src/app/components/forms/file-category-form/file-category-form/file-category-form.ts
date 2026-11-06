import { TagColor } from '../../../../interfaces/tag-color';
import { TagColorPicker } from '../../../tag-color-picker/tag-color-picker';
import { finalize } from 'rxjs';
import { Component, computed, inject, OnInit, input, output, signal } from '@angular/core';
import { BranchStore } from '../../../../store/branch.store';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import {
  NzFormControlComponent,
  NzFormDirective,
  NzFormItemComponent,
  NzFormLabelComponent,
} from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzFlexDirective } from 'ng-zorro-antd/flex';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { FileCategoryStore } from '../../../../store/file-category.store';
import { BranchTableDto } from '../../../../interfaces/branch-table.dto';
import { FileCategoryDto } from '../../../../interfaces/file-category.dto';

@Component({
  selector: 'app-file-category-form',
  imports: [
    NzDividerComponent,
    NzFormDirective,
    ReactiveFormsModule,
    NzFormControlComponent,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzInputDirective,
    NzButtonComponent,
    NzFlexDirective,
    NzIconDirective,
    TagColorPicker,
  ],
  templateUrl: './file-category-form.html',
  styleUrl: './file-category-form.css',
})
export class FileCategoryForm implements OnInit {
  private fileCategoryStore = inject(FileCategoryStore);
  private branchStore = inject(BranchStore);
  private formBuilder = inject(FormBuilder);

  // Inputs / Outputs
  clientId = input.required<number>();
  close = output<void>();
  saved = output<void>();

  // Signals
  protected saveButtonLoading = signal<boolean>(false);

  // Computed variables
  formTitle = computed(() => {
    return this.fileCategoryStore.formMode() === 'add' ? 'New Category' : 'Update Category';
  });

  ngOnInit(): void {
    const category = this.fileCategoryStore.selectedCategory();
    if (category === null) return;
    this.fillFieldsFromEntity(category);
  }

  // Form
  protected categoryForm = this.formBuilder.group({
    color: this.formBuilder.nonNullable.control<TagColor>('PURPLE'),
    name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
  });

  fillFieldsFromEntity(category: FileCategoryDto) {
    this.categoryForm.patchValue({
      name: category.name,
      color: category.color ?? 'PURPLE',
    });
  }

  submitForm() {
    if (this.categoryForm.invalid || this.saveButtonLoading()) return;
    const fileCategoryDto = this.categoryForm.getRawValue();
    switch (this.fileCategoryStore.formMode()) {
      case 'add':
        this.saveRequest(fileCategoryDto);
        break;
      case 'edit':
        this.updateRequest(fileCategoryDto);
        break;
    }
  }

  saveRequest(fileCategoryDto: any) {
    this.saveButtonLoading.set(true);
    this.branchStore
      .saveFileCategory(this.clientId(), fileCategoryDto)
      .pipe(finalize(() => this.saveButtonLoading.set(false)))
      .subscribe({
        next: () => {
          this.saved.emit();
          this.onClose();
        },
        complete: () => {
          this.saveButtonLoading.set(false);
        },
      });
  }

  updateRequest(fileCategoryDto: any) {
    const categoryId = this.fileCategoryStore.selectedCategory()?.id;
    if (categoryId == null) return;
    this.saveButtonLoading.set(true);
    this.branchStore
      .updateFileCategory(this.clientId(), categoryId, fileCategoryDto)
      .pipe(finalize(() => this.saveButtonLoading.set(false)))
      .subscribe({
        next: () => {
          this.saved.emit();
          this.onClose();
        },
        complete: () => {
          this.saveButtonLoading.set(false);
        },
      });
  }

  onClose() {
    this.fileCategoryStore.selectedCategory.set(null);
    this.categoryForm.reset();
    this.close.emit();
  }
}
