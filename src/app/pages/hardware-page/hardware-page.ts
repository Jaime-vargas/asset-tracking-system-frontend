import {Component, computed, signal} from '@angular/core';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {FormsModule} from '@angular/forms';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective, NzInputPrefixDirective, NzInputWrapperComponent} from 'ng-zorro-antd/input';
import {NzTableComponent, NzThMeasureDirective} from 'ng-zorro-antd/table';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {HardwareTableDto} from '../../interfaces/hardware-table.dto';
import {BranchService} from '../../services/branch.service';
import {UtilityService} from '../../services/utility.service';
import {HardwareService} from '../../services/hardware.service';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-hardware-page',
  imports: [
    NzButtonComponent,
    NzDividerComponent,
    DasboardBoxComponent,
    FormsModule,
    NzEmptyComponent,
    NzFlexDirective,
    NzIconDirective,
    NzInputDirective,
    NzInputPrefixDirective,
    NzInputWrapperComponent,
    NzTableComponent,
    NzTagComponent,
    NzThMeasureDirective,
    RouterLink
  ],
  templateUrl: './hardware-page.html',
  styleUrl: './hardware-page.css',
})
export class HardwarePage {

  constructor(private hardwareService: HardwareService,
              protected utilityService: UtilityService) {
    this.getAllHardwareData()
  }
// TABLE DATA
  hardwareData = signal<HardwareTableDto[]>([]);
  hardware = computed(()=> {
    const now = new Date(new Date());
    return this.hardwareData().map((hardware) => {
      const date = new Date(hardware.lastMaintenanceDate);
      const totalReports = hardware.reportsActive.length;
      const overdueReports = hardware.reportsActive.filter(report =>
        new Date(report.dueDate) < now).length
      return {
        ...hardware,
        lastMaintenanceDate: date.toLocaleDateString('en-CA'),
        reportsActive: totalReports - overdueReports,
        overdueReports,
      };
    })
  });
  // TABLE INPUT FILTERS
  typeFilter = signal<string>("");
  nameFilter = signal<string>("");
  modelFilter = signal<string>("");
  serialNumberFilter = signal<string>("");
  locationFilter = signal<string>("");
  lastMaintenanceFilter = signal<string>("");
  // TABLE FILTER
  hardwareTable = computed(() => {
    return this.hardware().filter(hardware => {
      return (
        hardware.type.toLowerCase().includes(this.typeFilter().toLowerCase()) &&
        hardware.name.toLowerCase().includes(this.nameFilter().toLowerCase()) &&
        hardware.model.toLowerCase().includes(this.modelFilter().toLowerCase()) &&
        hardware.serialNumber.toLowerCase().includes(this.serialNumberFilter().toLowerCase()) &&
        hardware.location.toLowerCase().includes(this.locationFilter().toLowerCase()) &&
        hardware.lastMaintenanceDate.toLowerCase().includes(this.lastMaintenanceFilter().toLowerCase())
      );
    });
  });

  getAllHardwareData(){
    this.hardwareService.getAllHardware().subscribe({
      next: (data) => {
        this.hardwareData.set(data);
      }
    })
  }

}
