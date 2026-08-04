import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzDatePickerComponent} from 'ng-zorro-antd/date-picker';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzInputDirective, NzTextareaCountComponent} from 'ng-zorro-antd/input';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {ReportRequestDto} from '../../../interfaces/report/report-request.dto';
import {ReportStore} from '../../../store/report.store';
import {finalize} from 'rxjs';
import {SidebarStore} from '../../../store/sidebar.store';
import {HardwareStore} from '../../../store/hardware.store';
import {ReportDetailDto} from '../../../interfaces/report/report-detail.dto';

@Component({
  selector: 'app-report-form',
  imports: [
    NzDividerComponent,
    NzRowDirective,
    NzColDirective,
    NzDatePickerComponent,
    NzSelectComponent,
    NzOptionComponent,
    NzFormDirective,
    ReactiveFormsModule,
    NzFormControlComponent,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzInputDirective,
    NzTextareaCountComponent,
    NzButtonComponent,
    NzFlexDirective,
    NzIconDirective,
    FormsModule
  ],
  templateUrl: './report-form.html',
  styleUrl: './report-form.css',
})
export class ReportForm implements OnInit {

  private formBuilder = inject(NonNullableFormBuilder);
  private reportStore = inject(ReportStore);
  private sidebarStore = inject(SidebarStore);

  formMode = this.reportStore.formMode;

  // Internal signals
  buttonLoading = signal<boolean>(false);

  // Computed
  formTitle = computed(() =>
    this.formMode() === "add" ? "New Report" : "Update Report"
  );

  ngOnInit() {
    const report = this.reportStore.selectedReport();
    if (report === null) return;
    if(this.formMode() === "edit"){
      this.fillFieldsFromEntity(report);
    }
  }

  fillFieldsFromEntity(report: ReportDetailDto){
    this.reportForm.patchValue({
      title: report.title,
      reportDetails: report.reportDetails,
      priorityEnum: report.priority,
      dueDate: new Date(report.dueDate)
    });
  }

  protected reportForm = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    priorityEnum:this.formBuilder.control<string|null>(null, Validators.required),
    reportDetails:  ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]],
    dueDate: [new Date(), Validators.required]
  });

  disabledDate = (current: Date): boolean =>{
    return current < new Date();
  }

  submitForm(){
    if(this.reportForm.invalid) return;
    const dueDate = new Date(this.reportForm.value.dueDate!);
    dueDate.setHours(23,59,59,999);
    const requestReport: ReportRequestDto = {
      ...this.reportForm.getRawValue(),
      priorityEnum: this.reportForm.value.priorityEnum!,
      dueDate: dueDate.toISOString()
    }
    this.buttonLoading.set(true);
    switch (this.reportStore.formMode()){
      case 'add':
        this.addRequest(requestReport);
        break;
      case 'edit':
        this.updateRequest(requestReport);
        break;
    }
  }

  addRequest(reportDto: ReportRequestDto){
    const selectedHardwareId = this.reportStore.selectedHardwareId();
    if(selectedHardwareId === null) return;
    this.reportStore.saveReport(selectedHardwareId, reportDto)
      .pipe(
        finalize(()=> this.buttonLoading.set(false)))
      .subscribe({
        next: ()=> this.onClose(),
      });
  }

  updateRequest(reportDto: ReportRequestDto){
    const selectedReport = this.reportStore.selectedReport();
    if (selectedReport === null) return;
    this.reportStore.updateReport(selectedReport.id, reportDto).pipe(
      finalize(()=> this.buttonLoading.set(false)))
    .subscribe({
      next: ()=> this.onClose(),
    })
  }

  onClose(){
    this.reportForm.reset()
    this.sidebarStore.isOpen.set(false);
  }
}
