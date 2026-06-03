import {Component, computed, ElementRef, signal, ViewChild} from '@angular/core';
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {ClientService} from '../../services/client.service';
import {ClientTableDto} from '../../interfaces/client-table.dto';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective, NzIconModule} from 'ng-zorro-antd/icon';
import {FormGroup, FormsModule} from '@angular/forms';
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


@Component({
  selector: 'app-clients-page',
  imports: [
    NzDividerComponent,
    DasboardBoxComponent,
    NzButtonComponent,
    NzIconDirective,
    FormsModule,
    NzInputModule,
    NzIconModule,
    NzFlexDirective,
    NzRowDirective,
    NzColDirective,
    NzTypographyComponent,
    TableComponent,
    EditSideBar,
    ClientForm
  ],
  templateUrl: './clients-page.html',
  styleUrl: './clients-page.css',
})
export class ClientsPage {
  constructor(private clientService: ClientService,
              protected utilityService: UtilityService,
              protected tableClientService: TableClientService) {
    this.getClients()
  }
  clientsData = signal<ClientTableDto[] >([]);

  // TABLE DATA
  tableData= computed<TableData[]>(()=> {
    return this.filteredClients().map((client: ClientTableDto) => {
      return {
        ...client,
        actions: [
          {label: 'Manage', type: 'link', link:['/clients', client.id, this.utilityService.slugify(client.name)]},
          {label: 'Edit', type: 'edit', link: '', onClick: (client: ClientTableDto) => this.openModal(client)}]
      }
    })
  });

  @ViewChild('drawer')
  drawer!: EditSideBar;
  @ViewChild( 'form')
  form!: ClientForm;
  openModal(client: ClientTableDto) {
    console.log('openModal' + client.id + client.name);
    this.drawer.onClose()
    this.form.onEdit(client);
  }

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
