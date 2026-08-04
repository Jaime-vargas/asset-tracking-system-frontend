import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {DashboardBoxComponent} from '../../components/dasboard-box-component/dashboard-box.component';
import {ClientTableDto} from '../../interfaces/client-table.dto';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective, NzIconModule} from 'ng-zorro-antd/icon';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {UtilityService} from '../../services/utility.service';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {TableComponent} from '../../components/table-component/table-component';
import {TableData} from '../../interfaces/table/table-data';
import {TableClientService} from '../../services/table-columns-service/table-columns-clients.service';
import {EditSideBar} from '../../components/edit-side-bar/edit-side-bar';
import {ClientForm} from '../../components/forms/client-form/client-form';
import {SidebarStore} from '../../store/sidebar.store';
import {FormsModule} from '@angular/forms';
import {ClientStore} from '../../store/client.store';

@Component({
  selector: 'app-clients-page',
  imports: [
    DashboardBoxComponent,
    NzButtonComponent,
    NzIconDirective,
    NzInputModule,
    NzIconModule,
    NzFlexDirective,
    NzRowDirective,
    NzColDirective,
    NzTypographyComponent,
    TableComponent,
    EditSideBar,
    ClientForm,
    FormsModule
  ],
  standalone: true,
  templateUrl: './clients-page.html',
  styleUrl: './clients-page.css',
})
export class ClientsPage implements OnInit {

  protected clientStore = inject(ClientStore);
  private sidebarStore = inject(SidebarStore);
  protected tableClientService = inject(TableClientService);
  private utilityService = inject(UtilityService);

  // Sidebar
  openSideBar = this.sidebarStore.isOpen;

  // Client Store
  private selectedClient = this.clientStore.selectedClient;
  private clientList = this.clientStore.clientList;
  private formMode = this.clientStore.formMode;

  // Filters
  clientNameFilter = signal<string>('');

  // Computed variables
  filteredClients = computed(() => {
    return this.clientList().filter(client => {
      return client.name.toLowerCase().includes(this.clientNameFilter().toLowerCase());
    })
  })

  tableData= computed<TableData[]>(()=> {
    return this.filteredClients().map((client: ClientTableDto) => {
      return {
        ...client,
        actions: [
          {label: 'Manage', type: 'link', link:['/clients', client.id, this.utilityService.slugify(client.name)]},
          {label: 'Edit', type: 'edit', onClick: (client: ClientTableDto) => this.openEditSidebar(client)}]
      }
    })
  });

  ngOnInit() {
    this.clientStore.loadClients();
  }

  openEditSidebar(client: ClientTableDto) {
    this.selectedClient.set(client);
    this.formMode.set("edit");
    this.openSideBar.set(true);
  }

  openNewSidebar(){
    this.selectedClient.set(null);
    this.formMode.set("add");
    this.openSideBar.set(true);
  }
}
