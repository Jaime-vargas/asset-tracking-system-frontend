import {Component, computed, ElementRef, OnInit, signal, ViewChild} from '@angular/core';
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {ClientService} from '../../services/client.service';
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
    NzDividerComponent,
    DasboardBoxComponent,
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
  constructor(private clientService: ClientService,
              protected utilityService: UtilityService,
              protected tableClientService: TableClientService,
              protected clientStore: ClientStore,
              protected sidebarStore: SidebarStore) {
    this.getClients();
  }

  ngOnInit() {
    this.sidebarStore.isOpen$.subscribe(isOpen => {
      this.isOpenSidebar.set(isOpen);
    });
    this.sidebarStore.refreshTable$.subscribe(()=>{
      this.getClients();
    });
  }
  isOpenSidebar = signal<boolean>(false);
  clientsData = signal<ClientTableDto[] >([]);

  // TABLE DATA
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

  // DATA FILTER
  clientNameFilter = signal<string>('');
  filteredClients = computed(() => {
    return this.clientsData().filter(client => {
      return client.name.toLowerCase().includes(this.clientNameFilter().toLowerCase());
    })
  })

  openNewSidebar (){
    this.sidebarStore.setSelectedEntity(undefined)
    this.sidebarStore.setMode("add");
    this.sidebarStore.open();
  }

  openEditSidebar(client: ClientTableDto) {
    this.sidebarStore.setSelectedEntity(client);
    this.sidebarStore.setMode("edit");
    this.sidebarStore.open();
  }

  getClients() {
    this.clientService.getClients().subscribe({
      next: data => {
        this.clientStore.setClientList(data)
        this.clientsData.set(data);
      }
    })
  }
}
