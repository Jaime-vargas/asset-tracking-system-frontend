import {Component, computed, signal} from '@angular/core';
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
    NzEmptyComponent
  ],
  templateUrl: './clients-page.html',
  styleUrl: './clients-page.css',
})
export class ClientsPage {
  constructor(private clientService: ClientService, protected utilityService: UtilityService) {
    this.getClients()
  }
  clientsData = signal<ClientTableDto[] >([]);
  clients = computed(() => {
    const now = new Date();
    return this.clientsData().map(client => {
      const totalReports = client.reportsActive.length;
      const overdueReports = client.reportsActive.filter(report =>
        new Date(report.dueDate) < now
      ).length;
      return {
        ...client,
        reportsActive: totalReports - overdueReports,
        overdueReports
      };
    });
  });
  // DATA FILTER
  clientNameFilter = signal<string>('');
  clientsTable = computed(() => {
    return this.clients().filter(client => {
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
