import {Component, computed, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {inject} from '@angular/core';
import {ClientService} from '../../services/client.service';
import {BranchTableDto} from '../../interfaces/branch-table.dto';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzTableComponent, NzThMeasureDirective} from 'ng-zorro-antd/table';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {FormsModule} from '@angular/forms';
import {NzInputDirective, NzInputPrefixDirective, NzInputWrapperComponent} from 'ng-zorro-antd/input';
import {UtilityService} from '../../services/utility.service';
import {RouteContextService} from '../../services/route-context.service';
import {ReportCountTagsComponent} from '../../components/report-count-tags-component/report-count-tags-component';
import {NzBreadCrumbComponent, NzBreadCrumbItemComponent} from 'ng-zorro-antd/breadcrumb';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-client-branches-page',
  imports: [
    DasboardBoxComponent,
    NzButtonComponent,
    NzIconDirective,
    NzTableComponent,
    NzThMeasureDirective,
    NzDividerComponent,
    NzEmptyComponent,
    NzFlexDirective,
    FormsModule,
    NzInputDirective,
    NzInputPrefixDirective,
    NzInputWrapperComponent,
    RouterLink,
    ReportCountTagsComponent,
    NzBreadCrumbComponent,
    NzBreadCrumbItemComponent,
    NzRowDirective,
    NzColDirective
  ],
  templateUrl: './client-branches-page.html',
  styleUrl: './client-branches-page.css',
})
export class ClientBranchesPage {
  route: ActivatedRoute = inject(ActivatedRoute);
  routeContext = inject(RouteContextService)
  constructor(private clientService: ClientService,
              protected utilityService: UtilityService) {
    this.routeContext.setFromRoute(this.route);
    this.getBranches();
  }


  // TABLE DATA
  branchesData = signal<BranchTableDto[]>([]);

  // DATA FILTER
  branchNameFilter = signal<string>('');
  filteredBranches = computed(()=> {
      return this.branchesData().filter(branch => {
        return branch.name.toLowerCase().includes(this.branchNameFilter().toLowerCase());
      })
  })

  clientId = computed(() => this.routeContext.clientId() ?? 0);
  getBranches() {
    return this.clientService.getBranches(this.clientId()).subscribe({
      next: data => {
        this.branchesData.set(data);
      }
    })
  }
}
