import {ChangeDetectorRef, Component, computed, signal} from '@angular/core';
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {NzTableComponent, NzThMeasureDirective} from 'ng-zorro-antd/table';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {ClientService} from '../../services/client.service';
import {ClientTableDto} from '../../interfaces/client-table.dto';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective, NzIconModule} from 'ng-zorro-antd/icon';
import {FormsModule} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {RouterLink} from '@angular/router';
import {UtilityService} from '../../services/utility.service';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {ReportCountTagsComponent} from '../../components/report-count-tags-component/report-count-tags-component';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {TableComponent} from '../../components/table-component/table-component';
import {ReportCountDTO} from '../../interfaces/report-dto/report-count.dto';
import {TableData} from '../../interfaces/table/table-data';
import {TableClientService} from '../../services/table-service/table-clients.service';


@Component({
  selector: 'app-clients-page',
  imports: [
    NzDividerComponent,
    DasboardBoxComponent,
    NzTableComponent,
    NzTagComponent,
    NzThMeasureDirective,
    NzButtonComponent,
    NzIconDirective,
    FormsModule,
    NzInputModule,
    NzIconModule,
    NzFlexDirective,
    RouterLink,
    NzEmptyComponent,
    ReportCountTagsComponent,
    NzRowDirective,
    NzColDirective,
    NzTypographyComponent,
    TableComponent
  ],
  templateUrl: './clients-page.html',
  styleUrl: './clients-page.css',
})
export class ClientsPage {
  constructor(private clientService: ClientService, protected utilityService: UtilityService) {
    this.getClients()
  }

  clientsData = signal<ClientTableDto[] >([]);

  // TABLE COLUMNS
  tableColumns = computed(() =>
    [
      {key:'name', label: 'Name', colWidth: 150, type: 'string'},
      {key:'branches', label: 'Branches', colWidth: 80, type: 'icon-branch'},
      {key:'totalHardware', label: 'Hardware', colWidth: 80, type: 'icon-hardware'},
      {key:'reportsActive', label: 'Reports', colWidth: 150, type: 'report-count-tag'},
      {key:'actions', label: 'Actions', colWidth: 200, type: 'button'},
    ]
  )
  // TABLE DATA
  tableData= computed<TableData[]>(()=> {
    return this.filteredClients().map((client: ClientTableDto) => {
      return {
        id: client.id,
        name: client.name,
        branches: client.branches,
        totalHardware: client.totalHardware,
        reportsActive: client.reportsActive,
        actions: [
          {label: 'Manage', type: 'link', link:['/clients', client.id, this.utilityService.slugify(client.name)]},
          {label: 'Edit', type: 'edit', link:['/clients', client.id, this.utilityService.slugify(client.name)]}]
      }
    })
  });

  // DATA FILTER
  clientNameFilter = signal<string>('');
  filteredClients = computed(() => {
    return this.clientsData().filter(client => {
      return client.name.toLowerCase().includes(this.clientNameFilter().toLowerCase());
    })
  })

  getClients() {
    this.clientService.getClients().subscribe({
      next: data => {
        this.clientsData.set(data);
      }
    })
  }
}
