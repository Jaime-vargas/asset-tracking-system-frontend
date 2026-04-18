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

  // TABLE INPUT FILTERS
  clientList = computed(()=> {
    return new Set(this.hardwareData().map((hardware) => {
      return hardware.clientName;
    }))
  });
  branchList = computed(() => {
    const clientName = this.clientFilter();
    return new Set(this.hardwareData().filter((hardware) =>
      (!clientName || hardware.clientName === clientName)).map((hardware) =>
      hardware.branchName))
  });
  typeList = computed(() =>
    new Set(this.hardwareData().map((hardware) =>
    hardware.type))
  );
  clientFilter = signal<string>("");
  branchFilter = signal("");
  typeFilter = signal<string>("");
  nameFilter = signal<string>("");
  modelFilter = signal<string>("");
  serialNumberFilter = signal<string>("");
  locationFilter = signal<string>("");
  lastMaintenanceFilter = signal<string>("");
  // TABLE FILTER
  filteredHardware = computed(() => {
    return this.hardwareData().filter(hardware => {
      const clientFilter = this.clientFilter();
      const branchFilter = this.branchFilter();
      const typeFilter = this.typeFilter();

      const matchClient = (!clientFilter || hardware.clientName === clientFilter)
      const matchBranch = (!branchFilter || hardware.branchName === branchFilter)
      const matchType = (!typeFilter || hardware.type === typeFilter)

      return (
        matchClient &&
        matchBranch &&
        matchType &&
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
