import {Component, computed, signal} from '@angular/core';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {FormsModule} from '@angular/forms';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective, NzInputPrefixDirective, NzInputWrapperComponent} from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select'
import {NzTableComponent, NzThMeasureDirective} from 'ng-zorro-antd/table';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {HardwareTableDto} from '../../interfaces/hardware-dto/hardware-table.dto';
import {UtilityService} from '../../services/utility.service';
import {HardwareService} from '../../services/hardware.service';
import {RouterLink} from '@angular/router';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {ne_NP} from 'ng-zorro-antd/i18n';
import {ReportCountTagsComponent} from '../../components/report-count-tags-component/report-count-tags-component';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';

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
    NzSelectModule,
    NzTableComponent,
    NzThMeasureDirective,
    RouterLink,
    NzSelectComponent,
    NzOptionComponent,
    ReportCountTagsComponent,
    NzTypographyComponent,
    NzRowDirective,
    NzColDirective
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
  hardwareView = computed(()=> {
    return this.hardwareData().map((hardware) => {
      return {
        ...hardware,
        lastMaintenanceDate: new Date(hardware.lastMaintenanceDate),
      };
    })
  });

  // TABLE INPUT FILTERS

  clientList = computed(()=> {
    return new Set(this.hardwareData().map((hardware) => {
      return hardware.clientName;
    }))
  });

  branchList = computed(() => {
    return new Set(this.hardwareView().map((hardware) => {
      return hardware.branchName;
    }))
  });
  branchFilter = signal("");
  typeFilter = signal<string>("");
  nameFilter = signal<string>("");
  modelFilter = signal<string>("");
  serialNumberFilter = signal<string>("");
  locationFilter = signal<string>("");
  lastMaintenanceFilter = signal<string>("");
  // TABLE FILTER
  filteredHardware = computed(() => {
    return this.hardwareView().filter(hardware => {
      return (
        (!this.branchFilter() || hardware.branchName === this.branchFilter()) &&
        hardware.type.toLowerCase().includes(this.typeFilter().toLowerCase()) &&
        hardware.name.toLowerCase().includes(this.nameFilter().toLowerCase()) &&
        hardware.model.toLowerCase().includes(this.modelFilter().toLowerCase()) &&
        hardware.serialNumber.toLowerCase().includes(this.serialNumberFilter().toLowerCase()) &&
        hardware.location.toLowerCase().includes(this.locationFilter().toLowerCase()) &&
        hardware.lastMaintenanceDate.toDateString().toLowerCase().includes(this.lastMaintenanceFilter().toLowerCase())
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
